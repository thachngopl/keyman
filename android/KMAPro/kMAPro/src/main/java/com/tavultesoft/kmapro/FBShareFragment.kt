/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.tavultesoft.kmapro

import java.util.Arrays

import com.facebook.FacebookRequestError
import com.facebook.HttpMethod
import com.facebook.Request
import com.facebook.RequestAsyncTask
import com.facebook.Response
import com.facebook.Session
import com.facebook.SessionState
import com.facebook.UiLifecycleHelper
import com.facebook.widget.LoginButton
import com.tavultesoft.kmapro.R

import android.support.v4.app.Fragment
import android.text.method.ScrollingMovementMethod
import android.content.Intent
import android.graphics.Typeface
import android.os.Bundle
import android.util.Log
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast

class FBShareFragment : Fragment() {

    private var uiHelper: UiLifecycleHelper? = null
    private var textView: TextView? = null
    private var shareButton: Button? = null
    private var pendingPublishReauthorization = false
    private val callback = Session.StatusCallback { session, state, exception -> onSessionStateChange(session, state, exception) }

    override fun onCreateView(inflater: LayoutInflater?, container: ViewGroup?, savedInstanceState: Bundle?): View? {
        val view = inflater!!.inflate(R.layout.activity_fbshare, container, false)

        textView = view.findViewById(R.id.textView) as TextView
        textView!!.movementMethod = ScrollingMovementMethod()
        if (messageTextTypeface != null) {
            textView!!.typeface = messageTextTypeface
        }
        if (messageTextSize > 0) {
            textView!!.textSize = messageTextSize
        }
        if (messageText != null) {
            textView!!.text = messageText
        }

        val loginButton = view.findViewById(R.id.loginButton) as LoginButton
        loginButton.setFragment(this)

        shareButton = view.findViewById(R.id.shareButton) as Button
        shareButton!!.setOnClickListener { publishStory() }

        if (savedInstanceState != null) {
            pendingPublishReauthorization = savedInstanceState.getBoolean(PENDING_PUBLISH_KEY, false)
        }

        val session = Session.getActiveSession()
        if (session != null && session.isOpened) {
            shareButton!!.visibility = View.VISIBLE
        }

        return view
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        uiHelper = UiLifecycleHelper(activity, callback)
        uiHelper!!.onCreate(savedInstanceState)
    }

    override fun onResume() {
        super.onResume()
        uiHelper!!.onResume()
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        uiHelper!!.onActivityResult(requestCode, resultCode, data)
    }

    override fun onPause() {
        super.onPause()
        uiHelper!!.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        uiHelper!!.onDestroy()
    }

    override fun onSaveInstanceState(outState: Bundle?) {
        super.onSaveInstanceState(outState)
        outState!!.putBoolean(PENDING_PUBLISH_KEY, pendingPublishReauthorization)
        uiHelper!!.onSaveInstanceState(outState)
    }

    private fun onSessionStateChange(session: Session, state: SessionState, exception: Exception) {
        if (state.isOpened) {
            shareButton!!.visibility = View.VISIBLE
            if (pendingPublishReauthorization && state == SessionState.OPENED_TOKEN_UPDATED) {
                pendingPublishReauthorization = false
                publishStory()
            }
        } else if (state.isClosed) {
            shareButton!!.visibility = View.GONE
        }
    }

    private fun publishStory() {
        val session = Session.getActiveSession()

        if (session != null) {
            // Check for publish permissions
            val permissions = session.permissions
            if (!isSubsetOf(PERMISSIONS, permissions)) {
                pendingPublishReauthorization = true
                val newPermissionsRequest = Session.NewPermissionsRequest(this, PERMISSIONS)
                session.requestNewPublishPermissions(newPermissionsRequest)
                return
            }

            val postParams = Bundle()
            postParams.putString("message", textView!!.text.toString())

            val callback = Request.Callback { response ->
                try {
                    val error = response.error
                    if (error != null) {
                        Toast.makeText(activity.applicationContext, error.errorMessage, Toast.LENGTH_SHORT).show()
                    } else {
                        Toast.makeText(activity.applicationContext, "Successfully posted", Toast.LENGTH_LONG).show()
                    }
                } catch (e: Exception) {
                    Log.e("FBShareFragment", e.message)
                }
            }

            val request = Request(session, "me/feed", postParams, HttpMethod.POST, callback)

            val task = RequestAsyncTask(request)
            task.execute()
        }
    }

    private fun isSubsetOf(subset: Collection<String>, superset: Collection<String>): Boolean {
        for (string in subset) {
            if (!superset.contains(string)) {
                return false
            }
        }
        return true
    }

    companion object {
        private val PERMISSIONS = Arrays.asList("publish_actions")
        private val PENDING_PUBLISH_KEY = "pendingPublishReauthorization"

        var messageText: String? = null
        var messageTextTypeface: Typeface? = null
        var messageTextSize = 0f
    }
}
