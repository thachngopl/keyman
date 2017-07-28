/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.keyman.android

import com.tavultesoft.kmapro.BuildConfig
import com.tavultesoft.kmea.KMManager
import com.tavultesoft.kmea.KMManager.KeyboardType
import com.tavultesoft.kmea.KMHardwareKeyboardInterpreter
import com.tavultesoft.kmea.KeyboardEventHandler.OnKeyboardEventListener

import android.content.Context
import android.content.res.Configuration
import android.graphics.Point
import android.inputmethodservice.InputMethodService
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.view.inputmethod.EditorInfo
import android.view.inputmethod.ExtractedText
import android.view.inputmethod.ExtractedTextRequest
import android.view.inputmethod.InputConnection

class SystemKeyboard : InputMethodService(), OnKeyboardEventListener {
    private var interpreter: KMHardwareKeyboardInterpreter? = null

    /**
     * Main initialization of the input method component. Be sure to call
     * to super class.
     */
    override fun onCreate() {
        super.onCreate()
        if (BuildConfig.DEBUG) {
            KMManager.setDebugMode(true)
        }
        KMManager.addKeyboardEventListener(this)
        KMManager.initialize(applicationContext, KeyboardType.KEYBOARD_TYPE_SYSTEM)
        interpreter = KMHardwareKeyboardInterpreter(applicationContext, KeyboardType.KEYBOARD_TYPE_SYSTEM)
        KMManager.setInputMethodService(this) // for HW interface
    }

    override fun onDestroy() {
        SystemKeyboard.inputView = null
        KMManager.removeKeyboardEventListener(this)
        interpreter = null // Throw it away, since we're losing our application's context.
        KMManager.onDestroy()
        super.onDestroy()
    }

    /**
     * This is the point where you can do all of your UI initialization. It
     * is called after creation and any configuration change.
     */
    override fun onInitializeInterface() {
        super.onInitializeInterface()
    }

    /**
     * Called by the framework when your view for creating input needs to
     * be generated. This will be called the first time your input method
     * is displayed, and every time it needs to be re-created such as due to
     * a configuration change.
     */
    override fun onCreateInputView(): View? {
        //Log.i("SystemKeyboard", "onCreateInputView");
        if (inputView == null) {
            inputView = KMManager.createInputView(this)
        }

        inputView?.let {
            var parent = inputView!!.parent as ViewGroup
            parent.removeView(inputView)
        }
        return inputView
    }

    /**
     * Deal with the editor reporting movement of its cursor.
     */
    override fun onUpdateSelection(oldSelStart: Int, oldSelEnd: Int, newSelStart: Int, newSelEnd: Int, candidatesStart: Int, candidatesEnd: Int) {
        super.onUpdateSelection(oldSelStart, oldSelEnd, newSelStart, newSelEnd, candidatesStart, candidatesEnd)
        KMManager.updateSelectionRange(KMManager.KeyboardType.KEYBOARD_TYPE_SYSTEM, newSelStart, newSelEnd)
    }

    /**
     * This is the main point where we do our initialization of the input method
     * to begin operating on an application.  At this point we have been
     * bound to the client, and are now receiving all of the detailed information
     * about the target of our edits.
     */
    override fun onStartInput(attribute: EditorInfo, restarting: Boolean) {
        attribute.imeOptions = attribute.imeOptions or (EditorInfo.IME_FLAG_NO_EXTRACT_UI or EditorInfo.IME_FLAG_NO_FULLSCREEN)
        super.onStartInput(attribute, restarting)
        KMManager.onStartInput(attribute, restarting)
        //Log.i("SystemKeyboard", "onStartInput");
        val ic = currentInputConnection
        if (ic != null) {
            val icText = ic.getExtractedText(ExtractedTextRequest(), 0)
            if (icText != null) {
                val didUpdateText = KMManager.updateText(KeyboardType.KEYBOARD_TYPE_SYSTEM, icText.text.toString())
                val selStart = icText.startOffset + icText.selectionStart
                val selEnd = icText.startOffset + icText.selectionEnd
                val didUpdateSelection = KMManager.updateSelectionRange(KeyboardType.KEYBOARD_TYPE_SYSTEM, selStart, selEnd)
                if (!didUpdateText || !didUpdateSelection)
                    exText = icText
            }
        }
    }

    override fun onStartInputView(attribute: EditorInfo, restarting: Boolean) {
        super.onStartInputView(attribute, restarting)
        //Log.i("SystemKeyboard", "onStartInputView");
    }

    override fun onUpdateExtractingVisibility(ei: EditorInfo) {
        super.onUpdateExtractingVisibility(ei)
        //Log.i("SystemKeyboard", "onUpdateExtractingVisibility");
    }

    override fun onConfigurationChanged(newConfig: Configuration) {
        super.onConfigurationChanged(newConfig)
        KMManager.onConfigurationChanged(newConfig)
    }

    override fun onComputeInsets(outInsets: InputMethodService.Insets) {
        super.onComputeInsets(outInsets)

        // We should extend the touchable region so that Keyman sub keys menu can receive touch events outside the keyboard frame
        val wm = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        val size = Point(0, 0)
        wm.defaultDisplay.getSize(size)

        var inputViewHeight = 0
        if (inputView != null)
            inputViewHeight = inputView!!.height

        val kbHeight = KMManager.getKeyboardHeight(this)
        outInsets.contentTopInsets = inputViewHeight - kbHeight
        outInsets.touchableInsets = InputMethodService.Insets.TOUCHABLE_INSETS_REGION
        outInsets.touchableRegion.set(0, outInsets.contentTopInsets, size.x, size.y)
    }

    override fun onKeyboardLoaded(keyboardType: KeyboardType) {
        if (keyboardType == KeyboardType.KEYBOARD_TYPE_SYSTEM) {
            if (exText != null)
                exText = null
        }
    }

    override fun onKeyboardChanged(newKeyboard: String) {
        // Do nothing
    }

    override fun onKeyboardShown() {
        // Do nothing
    }

    override fun onKeyboardDismissed() {
        // Do nothing
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent): Boolean {
        return interpreter!!.onKeyDown(keyCode, event)  // if false, will revert to default handling.
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent): Boolean {
        return interpreter!!.onKeyUp(keyCode, event)
    }

    override fun onKeyMultiple(keyCode: Int, count: Int, event: KeyEvent): Boolean {
        return interpreter!!.onKeyMultiple(keyCode, count, event)
    }

    override fun onKeyLongPress(keyCode: Int, event: KeyEvent): Boolean {
        return interpreter!!.onKeyLongPress(keyCode, event)
    }

    companion object {
        private var inputView: View? = null
        private var exText: ExtractedText? = null
    }
}