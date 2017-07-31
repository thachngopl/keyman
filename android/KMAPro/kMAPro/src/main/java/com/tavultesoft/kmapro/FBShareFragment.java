/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.tavultesoft.kmapro;

import android.app.Activity;
import android.content.Intent;
import android.support.v4.app.Fragment;
import android.telecom.Call;
import android.text.method.ScrollingMovementMethod;
import android.content.Intent;
import android.graphics.Typeface;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

import com.facebook.CallbackManager;
import com.facebook.login.widget.LoginButton;
import com.facebook.share.widget.LikeView;

import java.util.ArrayList;

public class FBShareFragment extends Fragment {
  private CallbackManager callbackManager;
  //private OnShareContentChangedListener shareContentChangedListener;
  private TextView textView;

    public static String messageText = null;
  public static Typeface messageTextTypeface = null;
  public static float messageTextSize = 0;

  @Override
  public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
    super.onCreateView(inflater, container, savedInstanceState);
    callbackManager = CallbackManager.Factory.create();

    View view = inflater.inflate(R.layout.activity_fbshare, container, false);

    LoginButton loginButton = (LoginButton) view.findViewById(R.id.loginButton);
    loginButton.setFragment(this);
    loginButton.setReadPermissions("public_profile");

    textView = (TextView) view.findViewById(R.id.textView);
    textView.setMovementMethod(new ScrollingMovementMethod());
    if (messageTextTypeface != null) {
      textView.setTypeface(messageTextTypeface);
    }
    if (messageTextSize > 0) {
      textView.setTextSize(messageTextSize);
    }
    if (messageText != null) {
      textView.setText(messageText);
    }

    return view;
  }


  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    callbackManager.onActivityResult(requestCode, resultCode, data);
  }
}