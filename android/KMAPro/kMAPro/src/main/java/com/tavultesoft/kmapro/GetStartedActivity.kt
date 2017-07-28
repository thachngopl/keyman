/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.tavultesoft.kmapro

import java.util.ArrayList
import java.util.HashMap

import com.tavultesoft.kmapro.R
import com.tavultesoft.kmea.KMManager

import android.os.Bundle
import android.provider.Settings
import android.util.Log
import android.view.View
import android.view.ViewGroup
import android.view.Window
import android.view.inputmethod.InputMethodInfo
import android.view.inputmethod.InputMethodManager
import android.widget.AdapterView
import android.widget.CheckBox
import android.widget.CompoundButton
import android.widget.CompoundButton.OnCheckedChangeListener
import android.widget.ImageButton
import android.widget.ListView
import android.app.Activity
import android.content.Context
import android.content.Intent
import android.content.SharedPreferences

class GetStartedActivity : Activity() {
    private val iconKey = "icon"
    private val textKey = "text"
    private val isEnabledKey = "isEnabled"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        val context = this
        requestWindowFeature(Window.FEATURE_CUSTOM_TITLE)
        try {
            val titleContainerId = Class.forName("com.android.internal.R\$id").getField("title_container").get(null) as Int
            (window.findViewById(titleContainerId) as ViewGroup).removeAllViews()
        } catch (e: Exception) {
            Log.e("GetStartedActivity", e.message)
        }

        window.setFeatureInt(Window.FEATURE_CUSTOM_TITLE, R.layout.get_started_title_layout)
        setContentView(R.layout.get_started_list_layout)
        listView = findViewById(R.id.listView) as ListView

        val closeButton = findViewById(R.id.close_button) as ImageButton
        closeButton.setOnClickListener { finish() }

        val prefs = getSharedPreferences(getString(R.string.kma_prefs_name), Context.MODE_PRIVATE)
        val dontShowGetStarted = prefs.getBoolean(MainActivity.dontShowGetStartedKey, false)

        val checkBox = findViewById(R.id.checkBox) as CheckBox
        checkBox.isChecked = dontShowGetStarted
        checkBox.setOnCheckedChangeListener { buttonView, isChecked ->
            val editor = prefs.edit()
            editor.putBoolean(MainActivity.dontShowGetStartedKey, isChecked)
            editor.commit()
        }

        list = ArrayList<HashMap<String, String>>()

        var hashMap = HashMap<String, String>()
        hashMap.put(iconKey, "0")
        hashMap.put(textKey, "Add a keyboard for your language")
        hashMap.put(isEnabledKey, "true")
        list!!.add(hashMap)

        hashMap = HashMap<String, String>()
        hashMap.put(iconKey, "0")
        hashMap.put(textKey, "Enable Keyman as system-wide keyboard")
        hashMap.put(isEnabledKey, "true")
        list!!.add(hashMap)

        hashMap = HashMap<String, String>()
        hashMap.put(iconKey, "0")
        hashMap.put(textKey, "Set Keyman as default keyboard")
        hashMap.put(isEnabledKey, "false")
        list!!.add(hashMap)

        hashMap = HashMap<String, String>()
        hashMap.put(iconKey, R.drawable.ic_light_action_info.toString())
        hashMap.put(textKey, "More info")
        hashMap.put(isEnabledKey, "true")
        list!!.add(hashMap)

        val from = arrayOf(iconKey, textKey)
        val to = intArrayOf(R.id.left_icon, R.id.text)
        listAdapter = KMListAdapter(context, list, R.layout.get_started_row_layout, from, to)
        listView!!.adapter = listAdapter
        listView!!.onItemClickListener = AdapterView.OnItemClickListener { parent, view, position, id ->
            if (position == 0) {
                KMManager.showLanguageList(context)
            } else if (position == 1) {
                startActivity(Intent(Settings.ACTION_INPUT_METHOD_SETTINGS))
            } else if (position == 2) {
                val imManager = getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
                imManager.showInputMethodPicker()
            } else if (position == 3) {
                val i = Intent(context, InfoActivity::class.java)
                i.addFlags(Intent.FLAG_ACTIVITY_CLEAR_WHEN_TASK_RESET)
                startActivity(i)
                overridePendingTransition(android.R.anim.fade_in, R.anim.hold)
            }
        }
    }

    override fun onResume() {
        super.onResume()
    }

    override fun onPause() {
        super.onPause()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            val checkbox_off = android.R.drawable.checkbox_off_background.toString()
            val checkbox_on = android.R.drawable.checkbox_on_background.toString()

            val kbList = KMManager.getKeyboardsList(this)
            if (kbList != null && kbList.size > 1) {
                list!![0].put(iconKey, checkbox_on)
            } else {
                list!![0].put(iconKey, checkbox_off)
            }

            if (isEnabledAsSystemKB(this)) {
                list!![1].put(iconKey, checkbox_on)
                list!![2].put(isEnabledKey, "true")
            } else {
                list!![1].put(iconKey, checkbox_off)
                list!![2].put(isEnabledKey, "false")
            }

            if (isDefaultKB(this)) {
                list!![2].put(iconKey, checkbox_on)
            } else {
                list!![2].put(iconKey, checkbox_off)
            }

            val from = arrayOf(iconKey, textKey)
            val to = intArrayOf(R.id.left_icon, R.id.text)
            listAdapter = KMListAdapter(this, list, R.layout.get_started_row_layout, from, to)
            listView!!.adapter = listAdapter
        }
    }

    companion object {

        private var listView: ListView? = null
        private var list: ArrayList<HashMap<String, String>>? = null
        private var listAdapter: KMListAdapter? = null

        fun isEnabledAsSystemKB(context: Context): Boolean {
            val imManager = context.getSystemService(Context.INPUT_METHOD_SERVICE) as InputMethodManager
            val imList = imManager.enabledInputMethodList
            var isEnabled = false
            val size = imList.size
            for (i in 0..size - 1) {
                if (imList[i].serviceName == "com.keyman.android.SystemKeyboard") {
                    isEnabled = true
                    break
                }
            }

            return isEnabled
        }

        fun isDefaultKB(context: Context): Boolean {
            val inputMethod = Settings.Secure.getString(context.contentResolver, Settings.Secure.DEFAULT_INPUT_METHOD)
            return inputMethod == "com.tavultesoft.kmapro/com.keyman.android.SystemKeyboard"
        }
    }
}