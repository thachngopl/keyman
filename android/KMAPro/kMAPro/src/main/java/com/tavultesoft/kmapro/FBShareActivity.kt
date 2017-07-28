/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.tavultesoft.kmapro

import com.tavultesoft.kmapro.R
import com.tavultesoft.kmea.KMManager

import android.app.ActionBar
import android.os.Bundle
import android.support.v4.app.FragmentActivity

class FBShareActivity : FragmentActivity() {
    private var fbShareFragment: FBShareFragment? = null

    public override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val actionBar = actionBar
        actionBar!!.setLogo(R.drawable.keyman_logo)
        actionBar.setDisplayShowTitleEnabled(false)
        actionBar.setBackgroundDrawable(MainActivity.getActionBarDrawable(this))

        val extras = intent.extras
        if (extras != null) {
            FBShareFragment.messageText = extras.getString("messageText")
            FBShareFragment.messageTextSize = extras.getFloat("messageTextSize")
            FBShareFragment.messageTextTypeface = KMManager.getFontTypeface(applicationContext, extras.getString("messageTextTypeface"))
        }

        if (savedInstanceState == null) {
            // Add the fragment on initial activity setup
            fbShareFragment = FBShareFragment()
            supportFragmentManager.beginTransaction().add(android.R.id.content, fbShareFragment).commit()
        } else {
            // Or set the fragment from restored state info
            fbShareFragment = supportFragmentManager.findFragmentById(android.R.id.content) as FBShareFragment
        }
    }
}