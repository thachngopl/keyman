/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.tavultesoft.kmapro

import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.IOException
import java.io.OutputStream
import java.util.ArrayList
import java.util.HashMap

import com.tavultesoft.kmea.KMManager

import com.tavultesoft.kmea.KMManager.KeyboardType
import com.tavultesoft.kmea.KMTextView
import com.tavultesoft.kmea.KeyboardEventHandler.OnKeyboardDownloadEventListener
import com.tavultesoft.kmea.KeyboardEventHandler.OnKeyboardEventListener

import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.ParcelFileDescriptor
import android.os.Parcelable
import android.annotation.SuppressLint
import android.annotation.TargetApi
import android.app.Activity
import android.app.ActionBar
import android.app.AlertDialog
import android.content.ClipData
import android.content.Context
import android.content.DialogInterface
import android.content.Intent
import android.content.SharedPreferences
import android.content.pm.LabeledIntent
import android.content.pm.ResolveInfo
import android.content.res.Configuration
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Point
import android.graphics.Rect
import android.graphics.RectF
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.text.Html
import android.util.Log
import android.util.TypedValue
import android.view.KeyEvent
import android.view.LayoutInflater
import android.view.Menu
import android.view.MenuItem
import android.view.View
import android.view.View.OnClickListener
import android.view.WindowManager
import android.widget.SeekBar
import android.widget.Toast

class MainActivity : Activity(), OnKeyboardEventListener, OnKeyboardDownloadEventListener {

    private var textView: KMTextView? = null
    private val minTextSize = 16
    private val maxTextSize = 72
    private var textSize = minTextSize
    private var menu: Menu? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val actionBar = actionBar
        actionBar!!.setLogo(R.drawable.keyman_logo)
        actionBar.setDisplayShowTitleEnabled(false)
        actionBar.setBackgroundDrawable(getActionBarDrawable(this))

        if (BuildConfig.DEBUG) {
            KMManager.setDebugMode(true)
        }
        KMManager.initialize(applicationContext, KeyboardType.KEYBOARD_TYPE_INAPP)
        setContentView(R.layout.activity_main)
        textView = findViewById(R.id.kmTextView) as KMTextView
        val prefs = getSharedPreferences(getString(R.string.kma_prefs_name), Context.MODE_PRIVATE)
        textView!!.setText(prefs.getString(userTextKey, ""))
        textSize = prefs.getInt(userTextSizeKey, minTextSize)
        textView!!.textSize = textSize.toFloat()
        textView!!.setSelection(textView!!.text.length)

        val didCheckUserData = prefs.getBoolean(MainActivity.didCheckUserDataKey, false)
        if (!didCheckUserData && Build.VERSION.SDK_INT >= Build.VERSION_CODES.JELLY_BEAN) {
            try {
                val getUserdataIntent = Intent("keyman.ACTION_GET_USERDATA")
                startActivityForResult(getUserdataIntent, 0)
            } catch (e: Exception) {
                val editor = prefs.edit()
                editor.putBoolean(MainActivity.didCheckUserDataKey, true)
                editor.commit()
                checkGetStarted()
            }

        } else {
            checkGetStarted()
        }
    }

    @TargetApi(Build.VERSION_CODES.JELLY_BEAN)
    public override fun onActivityResult(requestCode: Int, resultCode: Int, returnIntent: Intent) {
        if (resultCode != Activity.RESULT_OK) {
            checkGetStarted()
            return
        } else {
            var didFail = false
            val userdata = returnIntent.clipData
            val len = userdata!!.itemCount
            for (i in 0..len - 1) {
                val fileUri = userdata.getItemAt(i).uri
                try {
                    val filename = fileUri.lastPathSegment
                    val pfd = contentResolver.openFileDescriptor(fileUri, "r")
                    val inputStream = FileInputStream(pfd!!.fileDescriptor)

                    if (filename.endsWith(".dat")) {
                        val newFile = File(getDir("userdata", Context.MODE_PRIVATE), filename)
                        copyFile(inputStream, newFile)
                        inputStream.close()
                    } else if (filename.endsWith(".js")) {
                        val langDir = File(getDir("data", Context.MODE_PRIVATE).toString() + "/languages")
                        if (langDir.exists())
                            langDir.mkdir()
                        val newFile = File(langDir, filename)
                        copyFile(inputStream, newFile)
                        inputStream.close()
                    } else if (filename.endsWith(".ttf") || filename.endsWith(".otf")) {
                        val fontDir = File(getDir("data", Context.MODE_PRIVATE).toString() + "/fonts")
                        if (fontDir.exists())
                            fontDir.mkdir()
                        val newFile = File(fontDir, filename)
                        copyFile(inputStream, newFile)
                        inputStream.close()
                    }
                } catch (e: Exception) {
                    didFail = true
                    Log.e("onActivityResult", e.message)
                }

            }

            if (!didFail) {
                KMManager.updateOldKeyboardsList(this)
                val prefs = getSharedPreferences(getString(R.string.kma_prefs_name), Context.MODE_PRIVATE)
                val editor = prefs.edit()
                editor.putBoolean(MainActivity.didCheckUserDataKey, true)
                editor.commit()
            }

            checkGetStarted()
        }
    }

    override fun onResume() {
        super.onResume()
        KMManager.onResume()
        if (!KMManager.keyboardExists(this, KMManager.KMDefault_KeyboardID, KMManager.KMDefault_LanguageID)) {
            val kbInfo = HashMap<String, String>()
            kbInfo.put(KMManager.KMKey_KeyboardID, KMManager.KMDefault_KeyboardID)
            kbInfo.put(KMManager.KMKey_LanguageID, KMManager.KMDefault_LanguageID)
            kbInfo.put(KMManager.KMKey_KeyboardName, KMManager.KMDefault_KeyboardName)
            kbInfo.put(KMManager.KMKey_LanguageName, KMManager.KMDefault_LanguageName)
            kbInfo.put(KMManager.KMKey_KeyboardVersion, KMManager.getLatestKeyboardFileVersion(this, KMManager.KMDefault_KeyboardID))
            kbInfo.put(KMManager.KMKey_Font, KMManager.KMDefault_KeyboardFont)
            KMManager.addKeyboard(this, kbInfo)
        }

        KMManager.addKeyboardEventListener(this)
        KMManager.addKeyboardDownloadEventListener(this)

        checkUrl()
        intent.data = null
    }

    override fun onPause() {
        super.onPause()
        KMManager.onPause()
        KMManager.removeKeyboardEventListener(this)
        KMManager.removeKeyboardDownloadEventListener(this)
        val prefs = getSharedPreferences(getString(R.string.kma_prefs_name), Context.MODE_PRIVATE)
        val editor = prefs.edit()
        editor.putString(userTextKey, textView!!.text.toString())
        editor.putInt(userTextSizeKey, textSize)
        editor.commit()
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        setIntent(intent)
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        actionBar!!.setBackgroundDrawable(getActionBarDrawable(this))
        resizeTextView(textView!!.isKeyboardVisible)
        invalidateOptionsMenu()
    }

    override fun onCreateOptionsMenu(menu: Menu): Boolean {
        // Inflate the menu; this adds items to the action bar if it is present.
        menuInflater.inflate(R.menu.main, menu)
        this.menu = menu
        return true
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        when (item.itemId) {
            R.id.action_info -> {
                showInfo()
                return true
            }
            R.id.action_share -> {
                showShareDialog()
                return true
            }
            R.id.action_web -> {
                showWebBrowser()
                return true
            }
            R.id.action_text_size -> {
                showTextSizeDialog()
                return true
            }
            R.id.action_clear_text -> {
                showClearTextDialog()
                return true
            }
            R.id.action_get_started -> {
                showGetStarted()
                return true
            }
            else -> return super.onOptionsItemSelected(item)
        }
    }

    override fun onKeyUp(keycode: Int, e: KeyEvent): Boolean {
        when (keycode) {
            KeyEvent.KEYCODE_MENU -> {
                menu!!.performIdentifierAction(R.id.action_overflow, Menu.FLAG_PERFORM_NO_CLOSE)
                return true
            }
        }

        return super.onKeyUp(keycode, e)
    }

    override fun onKeyboardLoaded(keyboardType: KeyboardType) {
        // Do nothing
    }

    override fun onKeyboardChanged(newKeyboard: String) {
        textView!!.typeface = KMManager.getKeyboardTextFontTypeface(this)
    }

    override fun onKeyboardShown() {
        resizeTextView(true)
    }

    override fun onKeyboardDismissed() {
        resizeTextView(false)
    }

    private fun resizeTextView(isKeyboardVisible: Boolean) {
        var keyboardHeight = 0
        if (isKeyboardVisible)
            keyboardHeight = KMManager.getKeyboardHeight(this)

        val outValue = TypedValue()
        theme.resolveAttribute(android.R.attr.actionBarSize, outValue, true)
        val actionBarHeight = resources.getDimensionPixelSize(outValue.resourceId)

        // *** TO DO: Try to check if status bar is visible, set statusBarHeight to 0 if it is not visible ***
        var statusBarHeight = 0
        val resourceId = resources.getIdentifier("status_bar_height", "dimen", "android")
        if (resourceId > 0)
            statusBarHeight = resources.getDimensionPixelSize(resourceId)

        val size = Point(0, 0)
        windowManager.defaultDisplay.getSize(size)
        val screenHeight = size.y
        textView!!.height = screenHeight - statusBarHeight - actionBarHeight - keyboardHeight
    }

    private fun showInfo() {
        val i = Intent(this, InfoActivity::class.java)
        i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET)
        startActivity(i)
        overridePendingTransition(android.R.anim.fade_in, R.anim.hold)
    }

    private fun showWebBrowser() {
        val i = Intent(this, WebBrowserActivity::class.java)
        i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET)
        startActivity(i)
        overridePendingTransition(android.R.anim.fade_in, R.anim.hold)
    }

    private fun showShareDialog() {
        val shareIntents = ArrayList<Intent>()
        val intent = Intent(Intent.ACTION_SEND)
        intent.type = "text/plain"
        intent.putExtra(Intent.EXTRA_TEXT, textView!!.text.toString())

        val resInfo = packageManager.queryIntentActivities(intent, 0)
        val fbPackageName = "com.facebook.katana"

        for (resolveInfo in resInfo) {
            val packageName = resolveInfo.activityInfo.packageName

            val shareIntent = Intent(android.content.Intent.ACTION_SEND)
            shareIntent.type = "text/plain"
            shareIntent.`package` = packageName

            var text = textView!!.text.toString()
            val htmlMailFormat = "<html><head></head><body>%s%s</body></html>"
            val extraMailText = "<br><br>Sent from&nbsp<a href=\"http://keyman.com/android\">Keyman for Android</a>"

            if (packageName != fbPackageName) {
                if (packageName == "com.android.email") {
                    // Text for email app, it doesn't currently support HTML
                    shareIntent.putExtra(Intent.EXTRA_TEXT, text)
                } else if (packageName == "com.google.android.gm") {
                    // Html string for Gmail
                    shareIntent.type = "message/rfc822"
                    text = text.replace("<", "&lt;")
                    text = text.replace(">", "&gt;")
                    text = text.replace(" ", "&nbsp;")
                    text = text.replace('\n', ' ')
                    text = text.replace(" ", "<br>")
                    shareIntent.putExtra(Intent.EXTRA_TEXT, Html.fromHtml(String.format(htmlMailFormat, text, extraMailText)))
                } else if (packageName == "com.twitter.android") {
                    // Text for Twitter
                    shareIntent.putExtra(Intent.EXTRA_TEXT, text)
                } else {
                    // Text for all others
                    shareIntent.putExtra(Intent.EXTRA_TEXT, text)
                }

                shareIntents.add(shareIntent)
            }
        }

        val fbShareIntent = Intent(this, FBShareActivity::class.java)
        fbShareIntent.putExtra("messageText", textView!!.text.toString())
        fbShareIntent.putExtra("messageTextSize", textSize.toFloat())
        fbShareIntent.putExtra("messageTextTypeface", KMManager.getKeyboardTextFontFilename())
        shareIntents.add(LabeledIntent(fbShareIntent, packageName, "Facebook", R.drawable.ic_facebook_logo))

        val chooserIntent = Intent.createChooser(shareIntents.removeAt(0), "Share via")
        chooserIntent.putExtra(Intent.EXTRA_INITIAL_INTENTS, shareIntents.toTypedArray<Parcelable>())
        startActivity(chooserIntent)
    }

    @SuppressLint("InflateParams")
    private fun showTextSizeDialog() {
        val inflater = LayoutInflater.from(this@MainActivity)
        val textSizeController = inflater.inflate(R.layout.text_size_controller, null)
        val dialogBuilder = AlertDialog.Builder(this@MainActivity)
        dialogBuilder.setIcon(R.drawable.ic_light_action_textsize)
        dialogBuilder.setTitle(String.format("Text Size: %d", textSize))
        dialogBuilder.setView(textSizeController)
        dialogBuilder.setPositiveButton("OK") { dialog, which ->
            // Done
        }

        val dialog = dialogBuilder.create()
        dialog.show()

        val seekBar = dialog.findViewById(R.id.seekBar) as SeekBar
        seekBar.progress = textSize - minTextSize
        seekBar.max = maxTextSize - minTextSize
        seekBar.setOnSeekBarChangeListener(object : SeekBar.OnSeekBarChangeListener {

            override fun onStopTrackingTouch(seekBar: SeekBar) {
                // Do nothing
            }

            override fun onStartTrackingTouch(seekBar: SeekBar) {
                // Do nothing
            }

            override fun onProgressChanged(seekBar: SeekBar, progress: Int, fromUser: Boolean) {
                textSize = progress + minTextSize
                textView!!.textSize = textSize.toFloat()
                dialog.setTitle(String.format("Text Size: %d", textSize))
            }
        })

        dialog.findViewById(R.id.textSizeDownButton).setOnClickListener {
            if (textSize > minTextSize) {
                textSize--
                seekBar.progress = textSize - minTextSize
            }
        }

        dialog.findViewById(R.id.textSizeUpButton).setOnClickListener {
            if (textSize < maxTextSize) {
                textSize++
                seekBar.progress = textSize - minTextSize
            }
        }
    }

    private fun showClearTextDialog() {
        val dialogBuilder = AlertDialog.Builder(this@MainActivity)
        dialogBuilder.setIcon(R.drawable.ic_light_action_trash)
        dialogBuilder.setTitle("Clear Text")
        dialogBuilder.setMessage("\nAll text will be cleared\n")
        dialogBuilder.setPositiveButton("OK") { dialog, which -> textView!!.setText("") }

        dialogBuilder.setNegativeButton("Cancel") { dialog, which ->
            // Cancel
        }

        dialogBuilder.show()
    }

    private fun checkGetStarted() {
        val prefs = getSharedPreferences(getString(R.string.kma_prefs_name), Context.MODE_PRIVATE)
        val dontShowGetStarted = prefs.getBoolean(MainActivity.dontShowGetStartedKey, false)
        if (!dontShowGetStarted) {
            var shouldShowGetStarted = false
            val kbList = KMManager.getKeyboardsList(this)
            if (kbList != null && kbList.size < 2)
                shouldShowGetStarted = true

            if (!GetStartedActivity.isEnabledAsSystemKB(this))
                shouldShowGetStarted = true

            if (!GetStartedActivity.isDefaultKB(this))
                shouldShowGetStarted = true

            if (shouldShowGetStarted)
                showGetStarted()
        }
    }

    private fun showGetStarted() {
        val getStartedIntent = Intent(this, GetStartedActivity::class.java)
        startActivity(getStartedIntent)
    }

    private fun checkUrl(): Boolean {
        // return true if requires user action (e.g. Download dialog)
        val i = intent
        val data = i.data ?: return false

        val context = this
        val keyboard = data.getQueryParameter("keyboard")
        val language = data.getQueryParameter("language")
        val url = data.getQueryParameter("url")

        if (url != null) {
            /*
      int kbIndex = -1;
      if (keyboard != null && language != null)
        kbIndex = KMManager.getKeyboardIndex(this, keyboard, language);

      if (kbIndex >= 0) {
        KMManager.setKeyboard(context, kbIndex);
        return false;
      }*/

            val direct = data.getQueryParameter("direct")
            val isDirect: Boolean
            if (direct != null && direct == "true") {
                isDirect = true
            } else {
                isDirect = false
            }

            val index = url.lastIndexOf("/") + 1
            var jsonFilename = "unknown"
            if (index >= 0 && index <= url.length) {
                jsonFilename = url.substring(index)
            }
            val dialogBuilder = AlertDialog.Builder(context)
            dialogBuilder.setTitle("Custom Keyboard: " + jsonFilename)
            dialogBuilder.setMessage("Would you like to download this keyboard?")
            dialogBuilder.setPositiveButton("Download") { dialog, which ->
                // Download custom keyboard
                if (KMManager.hasConnection(context)) {
                    KMManager.KMCustomKeyboardDownloader.download(context, url, isDirect, true)
                } else {
                    Toast.makeText(context, "No internet connection", Toast.LENGTH_SHORT).show()
                }
            }
            dialogBuilder.setNegativeButton("Cancel") { dialog, which ->
                // Cancel
            }

            val dialog = dialogBuilder.create()
            dialog.show()

            return true
        } else if (keyboard != null && language != null && !keyboard.trim { it <= ' ' }.isEmpty() && !language.trim { it <= ' ' }.isEmpty()) {
            val kbIndex = KMManager.getKeyboardIndex(this, keyboard, language)

            if (kbIndex >= 0) {
                KMManager.setKeyboard(context, kbIndex)
                return false
            }

            val kbKey = String.format("%s_%s", language, keyboard)
            val dialogBuilder = AlertDialog.Builder(context)
            dialogBuilder.setTitle("Keyboard: " + kbKey)
            dialogBuilder.setMessage("Would you like to download this keyboard?")
            dialogBuilder.setPositiveButton("Download") { dialog, which ->
                // Download keyboard
                if (KMManager.hasConnection(context)) {
                    KMManager.KMKeyboardDownloader.download(context, keyboard, language, true)
                } else {
                    Toast.makeText(context, "No internet connection", Toast.LENGTH_SHORT).show()
                }
            }
            dialogBuilder.setNegativeButton("Cancel") { dialog, which ->
                // Cancel
            }

            val dialog = dialogBuilder.create()
            dialog.show()

            return true
        }

        return false
    }

    override fun onKeyboardDownloadStarted(keyboardInfo: HashMap<String, String>) {
        // Do nothing
    }

    override fun onKeyboardDownloadFinished(keyboardInfo: HashMap<String, String>, result: Int) {
        if (result > 0) {
            val keyboardID = keyboardInfo[KMManager.KMKey_KeyboardID]
            val languageID = keyboardInfo[KMManager.KMKey_LanguageID]
            val keyboardName = keyboardInfo[KMManager.KMKey_KeyboardName]
            val languageName = keyboardInfo[KMManager.KMKey_LanguageName]
            val kbVersion = keyboardInfo[KMManager.KMKey_KeyboardVersion]
            val kFont = keyboardInfo[KMManager.KMKey_Font]
            val kOskFont = keyboardInfo[KMManager.KMKey_OskFont]
            if (languageID.contains(";")) {
                val ids = languageID.split("\\;".toRegex()).dropLastWhile({ it.isEmpty() }).toTypedArray()
                val names = languageName.split("\\;".toRegex()).dropLastWhile({ it.isEmpty() }).toTypedArray()
                val len = ids.size
                for (i in 0..len - 1) {
                    val langId = ids[i]
                    var langName = "Unknown"
                    if (i < names.size)
                        langName = names[i]
                    val kbInfo = HashMap<String, String>()
                    kbInfo.put(KMManager.KMKey_KeyboardID, keyboardID)
                    kbInfo.put(KMManager.KMKey_LanguageID, langId)
                    kbInfo.put(KMManager.KMKey_KeyboardName, keyboardName)
                    kbInfo.put(KMManager.KMKey_LanguageName, langName)
                    kbInfo.put(KMManager.KMKey_KeyboardVersion, kbVersion)
                    kbInfo.put(KMManager.KMKey_Font, kFont)
                    kbInfo.put(KMManager.KMKey_OskFont, kOskFont)
                    if (i == 0) {
                        if (KMManager.addKeyboard(this, kbInfo)) {
                            KMManager.setKeyboard(keyboardID, langId, keyboardName, langName, kFont, kOskFont)
                        }
                    } else {
                        KMManager.addKeyboard(this, kbInfo)
                    }
                }
            } else {
                if (KMManager.addKeyboard(this, keyboardInfo)) {
                    KMManager.setKeyboard(keyboardID, languageID, keyboardName, languageName, kFont, kOskFont)
                }
            }
        } else {
            Toast.makeText(this, "Keyboard download failed", Toast.LENGTH_SHORT).show()
        }
    }

    @Throws(IOException::class)
    private fun copyFile(inStream: FileInputStream, dstFile: File) {
        val outStream = FileOutputStream(dstFile)

        val buffer = ByteArray(1024)
        var len: Int
        while ((len = inStream.read(buffer)) > 0) {
            outStream.write(buffer, 0, len)
        }
        outStream.flush()
        outStream.close()
    }

    companion object {
        private val userTextKey = "UserText"
        private val userTextSizeKey = "UserTextSize"
        val dontShowGetStartedKey = "DontShowGetStarted"
        protected val didCheckUserDataKey = "DidCheckUserData"

        fun getActionBarDrawable(context: Context): Drawable {
            val size = Point()
            val wm = context.getSystemService(Context.WINDOW_SERVICE) as WindowManager
            wm.defaultDisplay.getSize(size)
            val width = size.x

            val outValue = TypedValue()
            context.theme.resolveAttribute(android.R.attr.actionBarSize, outValue, true)
            val actionBarHeight = context.resources.getDimensionPixelSize(outValue.resourceId)
            val bh = context.resources.getDimensionPixelSize(R.dimen.keyman_bar_height)
            val th = actionBarHeight - bh

            val w1 = width * 56 / 100f
            val w2 = width * 23 / 100f

            val conf = Bitmap.Config.ARGB_8888
            val bitmap = Bitmap.createBitmap(width, actionBarHeight, conf)
            val canvas = Canvas(bitmap)

            val p = Paint()
            p.style = Paint.Style.FILL
            p.color = Color.WHITE
            canvas.drawRect(Rect(0, 0, width, actionBarHeight), p)

            p.color = context.resources.getColor(R.color.keyman_orange)
            canvas.drawRect(RectF(0f, th.toFloat(), w1, actionBarHeight.toFloat()), p)

            p.color = context.resources.getColor(R.color.keyman_red)
            canvas.drawRect(RectF(w1, th.toFloat(), w1 + w2, actionBarHeight.toFloat()), p)

            p.color = context.resources.getColor(R.color.keyman_blue)
            canvas.drawRect(RectF(w1 + w2, th.toFloat(), width.toFloat(), actionBarHeight.toFloat()), p)
            return BitmapDrawable(context.resources, bitmap)
        }
    }
}