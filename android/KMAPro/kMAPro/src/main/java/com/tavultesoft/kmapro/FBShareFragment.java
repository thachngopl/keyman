/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.tavultesoft.kmapro;

import java.util.Arrays;
import java.util.Collection;
import java.util.List;

import com.facebook.CallbackManager;
import com.facebook.FacebookCallback;
import com.facebook.FacebookException;
import com.facebook.login.LoginResult;
import com.facebook.login.widget.LoginButton;
import com.facebook.share.Sharer;
import com.facebook.share.model.ShareContent;
import com.facebook.share.model.ShareLinkContent;
import com.facebook.share.widget.ShareButton;

import android.net.Uri;
import android.support.v4.app.Fragment;
import android.text.method.ScrollingMovementMethod;
import android.graphics.Typeface;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;

public class FBShareFragment extends Fragment {

  private LoginButton loginButton;
  private ShareButton shareButton;
  private TextView textView;
  private CallbackManager callbackManager;

  private static final List<String> PERMISSIONS = Arrays.asList("publish_actions");
  private static final String PENDING_PUBLISH_KEY = "pendingPublishReauthorization";
  private boolean pendingPublishReauthorization = false;
  public static String messageText = null;
  public static Typeface messageTextTypeface = null;
  public static float messageTextSize = 0;

  @Override
  public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
    View view = inflater.inflate(R.layout.activity_fbshare, container, false);

    callbackManager = CallbackManager.Factory.create();
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

    loginButton = (LoginButton) view.findViewById(R.id.loginButton);
    loginButton.setPublishPermissions(PERMISSIONS);
    loginButton.setFragment(this);
    loginButton.registerCallback(callbackManager, new FacebookCallback<LoginResult>() {
      @Override
      public void onSuccess(LoginResult loginResult) {

      }

      @Override
      public void onCancel() {

      }

      @Override
      public void onError(FacebookException error) {

      }
    });

    ShareContent fbContent = new ShareLinkContent.Builder()
      .setQuote(textView.getText().toString())
      .setContentUrl(Uri.parse("https://keyman.com"))
      .build();

    shareButton = (ShareButton) view.findViewById(R.id.shareButton);
    shareButton.setShareContent(fbContent);
    shareButton.registerCallback(callbackManager, new FacebookCallback<Sharer.Result>() {
      @Override
      public void onSuccess(Sharer.Result result) {
      }

      @Override
      public void onCancel() {
      }

      @Override
      public void onError(FacebookException error) {
      }
    });

    return view;
  }

  @Override
  public void onDestroy() {
    super.onDestroy();
  }

  @Override
  public void onSaveInstanceState(Bundle outState) {
    super.onSaveInstanceState(outState);
    outState.putBoolean(PENDING_PUBLISH_KEY, pendingPublishReauthorization);
  }

  private boolean isSubsetOf(Collection<String> subset, Collection<String> superset) {
    for (String string : subset) {
      if (!superset.contains(string)) {
        return false;
      }
    }
    return true;
  }
}