/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.tavultesoft.kmapro

import java.util.ArrayList
import java.util.HashMap

import com.tavultesoft.kmea.KMManager

import android.net.Uri
import android.os.Bundle
import android.view.Gravity
import android.view.View
import android.webkit.WebSettings.LayoutAlgorithm
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.TextView
import android.annotation.SuppressLint
import android.app.ActionBar
import android.app.Activity
import android.content.Intent
import android.content.pm.PackageInfo
import android.content.pm.PackageManager.NameNotFoundException

class InfoActivity : Activity() {

    private val kmBaseUrl = "http://keyman.com/android/app/"
    private var kmUrl = ""
    private val htmlPath = "file:///android_asset/info/info.html"

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        //getWindow().requestFeature(Window.FEATURE_PROGRESS);

        val actionBar = actionBar
        actionBar!!.setLogo(R.drawable.keyman_logo)
        actionBar.setDisplayShowTitleEnabled(false)
        actionBar.setDisplayShowCustomEnabled(true)
        actionBar.setBackgroundDrawable(MainActivity.getActionBarDrawable(this))
        val version = TextView(this)
        version.width = resources.getDimension(R.dimen.version_label_width).toInt()
        version.textSize = resources.getDimension(R.dimen.version_label_textsize)
        version.gravity = Gravity.CENTER

        var ver = ""
        val pInfo: PackageInfo
        try {
            pInfo = packageManager.getPackageInfo(packageName, 0)
            ver = String.format("Version: %s", pInfo.versionName)
        } catch (e: NameNotFoundException) {
            // Could not get version number
        }

        version.text = ver
        actionBar.customView = version

        setContentView(R.layout.activity_info)

        var currentKbID = KMManager.KMDefault_KeyboardID
        val curKbInfo = KMManager.getCurrentKeyboardInfo(this)
        if (curKbInfo != null)
            currentKbID = KMManager.getCurrentKeyboardInfo(this)[KMManager.KMKey_KeyboardID]

        var installedKbs = ""
        val kbList = KMManager.getKeyboardsList(this)
        if (kbList != null) {
            for (kbInfo in kbList) {
                val kbID = kbInfo[KMManager.KMKey_KeyboardID]
                if (!installedKbs.contains(kbID))
                    installedKbs += kbID + ","
            }
        }

        val lastIndex = installedKbs.length - 1
        if (lastIndex > 0)
            installedKbs = installedKbs.substring(0, lastIndex)

        if (installedKbs.isEmpty())
            installedKbs = currentKbID

        kmUrl = String.format("%s?active=%s&installed=%s", kmBaseUrl, currentKbID, installedKbs)
        val webView = findViewById(R.id.webView) as WebView
        webView.settings.layoutAlgorithm = LayoutAlgorithm.SINGLE_COLUMN
        webView.settings.javaScriptEnabled = true
        webView.settings.useWideViewPort = true
        webView.settings.loadWithOverviewMode = true
        webView.setLayerType(View.LAYER_TYPE_SOFTWARE, null)
        /*
    final Activity activity = this;
    webView.setWebChromeClient(new WebChromeClient() {
      public void onProgressChanged(WebView view, int progress) {
        activity.setProgress(progress * 1000);
      }
    });
    */

        webView.setWebViewClient(object : WebViewClient() {
            override fun onReceivedError(view: WebView, errorCode: Int, description: String, failingUrl: String) {
                // Handle the error
            }

            override fun shouldOverrideUrlLoading(view: WebView, url: String): Boolean {
                if (url == kmUrl || url == htmlPath) {
                    view.loadUrl(url)
                } else {
                    val i = Intent(Intent.ACTION_VIEW, Uri.parse(url))
                    startActivity(i)
                }

                return true
            }
        })

        if (KMManager.hasConnection(this)) {
            // Load app info page from server
            webView.loadUrl(kmUrl)
        } else {
            webView.loadUrl(htmlPath)
            // Load app info page from assets
        }
    }

    override fun onBackPressed() {
        finish()
        overridePendingTransition(0, android.R.anim.fade_out)
    }
}