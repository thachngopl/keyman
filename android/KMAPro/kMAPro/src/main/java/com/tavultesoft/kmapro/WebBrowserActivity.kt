/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.tavultesoft.kmapro

import java.net.MalformedURLException
import java.net.URL

import com.tavultesoft.kmea.KMManager

import android.annotation.SuppressLint
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences
import android.graphics.Bitmap
import android.graphics.Color
import android.graphics.PorterDuff.Mode
import android.graphics.drawable.Drawable
import android.os.Build
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.util.Patterns
import android.view.KeyEvent
import android.view.View
import android.view.View.OnClickListener
import android.view.View.OnFocusChangeListener
import android.view.ViewGroup
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.InputMethodManager
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ProgressBar
import android.widget.TextView
import android.widget.TextView.OnEditorActionListener
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.app.ActionBar
import android.app.Activity

class WebBrowserActivity : Activity() {

    private var webView: WebView? = null
    private var addressField: EditText? = null
    private var clearButton: ImageButton? = null
    private var stopButton: ImageButton? = null
    private var reloadButton: ImageButton? = null
    private var progressBar: ProgressBar? = null
    private var loadedFont: String? = null
    private var isLoading = false
    private var didFinishLoading = false

    @SuppressLint("SetJavaScriptEnabled", "InflateParams")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val context = this
        val actionBar = actionBar
        actionBar!!.setLogo(null)
        actionBar.setDisplayShowHomeEnabled(false)
        actionBar.setDisplayShowTitleEnabled(false)
        actionBar.setDisplayShowCustomEnabled(true)
        actionBar.setBackgroundDrawable(MainActivity.getActionBarDrawable(this))
        val webBarLayout = layoutInflater.inflate(
                R.layout.web_browser_bar_layout, null) as ViewGroup
        actionBar.customView = webBarLayout
        setContentView(R.layout.activity_web_browser)

        webView = findViewById(R.id.webView) as WebView
        addressField = findViewById(R.id.address_field) as EditText
        clearButton = findViewById(R.id.clear_button) as ImageButton
        stopButton = findViewById(R.id.stop_button) as ImageButton
        reloadButton = findViewById(R.id.reload_button) as ImageButton
        val backButton = findViewById(R.id.backButton) as ImageButton
        val forwardButton = findViewById(R.id.forwardButton) as ImageButton
        val bookmarksButton = findViewById(R.id.bookmarksButton) as ImageButton
        val globeButton = findViewById(R.id.globeButton) as ImageButton
        val closeButton = findViewById(R.id.closeButton) as ImageButton
        progressBar = findViewById(R.id.progressBar) as ProgressBar
        progressBar!!.rotation = 180f

        addressField!!.onFocusChangeListener = OnFocusChangeListener { v, hasFocus ->
            if (hasFocus) {
                if (addressField!!.length() > 0) {
                    reloadButton!!.visibility = View.GONE
                    stopButton!!.visibility = View.GONE
                    clearButton!!.visibility = View.VISIBLE
                } else {
                    reloadButton!!.visibility = View.GONE
                    stopButton!!.visibility = View.GONE
                    clearButton!!.visibility = View.GONE
                }
            } else {
                if (isLoading) {
                    clearButton!!.visibility = View.GONE
                    reloadButton!!.visibility = View.GONE
                    stopButton!!.visibility = View.VISIBLE
                    addressField!!.setText(webView!!.url)
                } else if (didFinishLoading) {
                    clearButton!!.visibility = View.GONE
                    stopButton!!.visibility = View.GONE
                    reloadButton!!.visibility = View.VISIBLE
                    addressField!!.setText(webView!!.url)
                }
            }
        }

        addressField!!.addTextChangedListener(object : TextWatcher {
            override fun onTextChanged(s: CharSequence, start: Int, before: Int, count: Int) {
                // Do nothing
            }

            override fun beforeTextChanged(s: CharSequence, start: Int, count: Int, after: Int) {
                // Do nothing
            }

            override fun afterTextChanged(s: Editable) {
                if (s.length >= 1) {
                    if (addressField!!.hasFocus()) {
                        reloadButton!!.visibility = View.GONE
                        stopButton!!.visibility = View.GONE
                        clearButton!!.visibility = View.VISIBLE
                    }
                } else {
                    if (addressField!!.hasFocus()) {
                        reloadButton!!.visibility = View.GONE
                        stopButton!!.visibility = View.GONE
                        clearButton!!.visibility = View.GONE
                    } else {
                        if (isLoading) {
                            clearButton!!.visibility = View.GONE
                            reloadButton!!.visibility = View.GONE
                            stopButton!!.visibility = View.VISIBLE
                        } else if (didFinishLoading) {
                            clearButton!!.visibility = View.GONE
                            stopButton!!.visibility = View.GONE
                            reloadButton!!.visibility = View.VISIBLE
                        }
                    }
                }
            }
        })

        clearButton!!.setOnClickListener { addressField!!.setText("") }

        stopButton!!.setOnClickListener {
            addressField!!.clearFocus()
            webView!!.stopLoading()
            updateButtons()
            didFinishLoading = true
            isLoading = false
            if (!addressField!!.hasFocus()) {
                clearButton!!.visibility = View.GONE
                stopButton!!.visibility = View.GONE
                reloadButton!!.visibility = View.VISIBLE
            }

            loadFont()
        }

        reloadButton!!.setOnClickListener {
            addressField!!.clearFocus()
            webView!!.reload()
        }

        backButton.setOnClickListener {
            addressField!!.clearFocus()
            webView!!.goBack()
        }

        forwardButton.setOnClickListener {
            addressField!!.clearFocus()
            webView!!.goForward()
        }

        bookmarksButton.setOnClickListener {
            addressField!!.clearFocus()
            val i = Intent(context, BookmarksActivity::class.java)
            i.putExtra("title", webView!!.title)
            i.putExtra("url", webView!!.url)
            startActivityForResult(i, 1)
        }

        globeButton.setOnClickListener {
            addressField!!.clearFocus()
            KMManager.showKeyboardPicker(context, KMManager.KeyboardType.KEYBOARD_TYPE_INAPP)
        }

        closeButton.setOnClickListener {
            finish()
            overridePendingTransition(0, android.R.anim.fade_out)
        }


        webView!!.settings.layoutAlgorithm = WebSettings.LayoutAlgorithm.NORMAL
        webView!!.settings.javaScriptEnabled = true
        webView!!.settings.useWideViewPort = true
        webView!!.settings.loadWithOverviewMode = true
        webView!!.settings.builtInZoomControls = true
        webView!!.settings.setSupportZoom(true)
        webView!!.setLayerType(View.LAYER_TYPE_SOFTWARE, null)

        webView!!.setWebChromeClient(object : WebChromeClient() {
            override fun onProgressChanged(view: WebView, progress: Int) {
                progressBar!!.progress = 100 - progress
            }
        })
        webView!!.setWebViewClient(object : WebViewClient() {
            override fun onReceivedError(view: WebView, errorCode: Int, description: String, failingUrl: String) {
                updateButtons()
                didFinishLoading = true
                isLoading = false
                if (!addressField!!.hasFocus()) {
                    clearButton!!.visibility = View.GONE
                    stopButton!!.visibility = View.GONE
                    reloadButton!!.visibility = View.VISIBLE
                }
            }

            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                if (url.toLowerCase() != "about:blank")
                    view.loadUrl(url)

                return true
            }

            override fun onPageStarted(view: WebView, url: String, favicon: Bitmap) {
                updateButtons()
                isLoading = true
                didFinishLoading = false
                addressField!!.setText(url)
                if (!addressField!!.hasFocus()) {
                    clearButton!!.visibility = View.GONE
                    reloadButton!!.visibility = View.GONE
                    stopButton!!.visibility = View.VISIBLE
                }
            }

            override fun onPageFinished(view: WebView, url: String) {
                updateButtons()
                didFinishLoading = true
                isLoading = false
                if (!addressField!!.hasFocus()) {
                    clearButton!!.visibility = View.GONE
                    stopButton!!.visibility = View.GONE
                    reloadButton!!.visibility = View.VISIBLE
                }

                loadFont()
            }
        })

        addressField!!.setOnEditorActionListener { v, actionId, event ->
            var handled = false
            if (actionId == EditorInfo.IME_ACTION_GO || event.keyCode == KeyEvent.KEYCODE_ENTER) {
                val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                imm.hideSoftInputFromWindow(addressField!!.windowToken, 0)
                var urlStr = v.text.toString()
                try {
                    URL(urlStr)
                } catch (e: MalformedURLException) {
                    if (Patterns.WEB_URL.matcher(String.format("%s%s", "http://", urlStr)).matches()) {
                        urlStr = String.format("%s%s", "http://", urlStr)
                    } else {
                        urlStr = String.format("https://www.google.com/search?q=%s", urlStr)
                    }
                }

                webView!!.loadUrl(urlStr)
                addressField!!.clearFocus()
                handled = true
            }

            handled
        }

        updateButtons()
        addressField!!.clearFocus()

        // Load last visited Url
        val prefs = getSharedPreferences(getString(R.string.kma_prefs_name), Context.MODE_PRIVATE)
        val editor = prefs.edit()
        val url = prefs.getString("lastVisitedUrl", "https://www.google.com/")
        webView!!.loadUrl(url)
    }

    override fun onResume() {
        super.onResume()
        if (webView != null) {
            webView!!.resumeTimers()

            if (didFinishLoading) {
                val fontFilename = KMManager.getKeyboardTextFontFilename()
                if (loadedFont != fontFilename) {
                    webView!!.reload()
                }
            }
        }
    }

    override fun onPause() {
        super.onPause()
        if (webView != null) {
            webView!!.pauseTimers()
        }
    }

    override fun onDestroy() {
        super.onDestroy()
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        if (webView != null) {
            if (resultCode == Activity.RESULT_OK && data != null) {
                val url = data.getStringExtra("url")
                if (url != null)
                    webView!!.loadUrl(url)
            }
        }
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
    }

    override fun onBackPressed() {
        finish()
        overridePendingTransition(0, android.R.anim.fade_out)
    }

    private fun loadFont() {
        val font = KMManager.getKeyboardTextFontFilename()
        if (!font.isEmpty()) {
            loadedFont = font
            val fontUrl = String.format("%s%s", fontBaseUri, font)
            val jsStr = String.format(
                    "var style = document.createElement('style');" +
                            "style.type = 'text/css';" +
                            "style.innerHTML = '@font-face{font-family:\"KMCustomFont\";src:url(\"%s\");} " +
                            "*{font-family:\"KMCustomFont\" !important;}';" +
                            "document.getElementsByTagName('head')[0].appendChild(style);", fontUrl)
            webView!!.loadUrl(String.format("javascript:%s", jsStr))
        } else {
            loadedFont = "sans-serif"
            val jsStr = "var style = document.createElement('style');" +
                    "style.type = 'text/css';" +
                    "style.innerHTML = '*{font-family:\"sans-serif\" !important;}';" +
                    "document.getElementsByTagName('head')[0].appendChild(style);"
            webView!!.loadUrl(String.format("javascript:%s", jsStr))
        }
    }

    private fun updateButtons() {
        val backButton = findViewById(R.id.backButton) as ImageButton
        val forwardButton = findViewById(R.id.forwardButton) as ImageButton

        setImageButtonEnabled(backButton, R.drawable.ic_navigation_back, webView!!.canGoBack())
        setImageButtonEnabled(forwardButton, R.drawable.ic_navigation_forward, webView!!.canGoForward())
    }

    private fun setImageButtonEnabled(imgButton: ImageButton, resId: Int, enabled: Boolean) {
        imgButton.isEnabled = enabled
        val originalIcon: Drawable
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            originalIcon = resources.getDrawable(resId, theme)
        } else {
            originalIcon = resources.getDrawable(resId)
        }
        val icon = if (enabled) originalIcon else convertDrawableToGrayScale(originalIcon)
        imgButton.setImageDrawable(icon)
    }

    companion object {
        private val fontBaseUri = "https://az416209.vo.msecnd.net/font/deploy/"

        private fun convertDrawableToGrayScale(drawable: Drawable?): Drawable? {
            if (drawable == null)
                return null

            val drw = drawable.mutate()
            drw.setColorFilter(Color.LTGRAY, Mode.SRC_IN)
            return drw
        }
    }
}