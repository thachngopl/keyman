/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.tavultesoft.kmapro;

import com.facebook.CallbackManager;
import com.facebook.FacebookCallback;
import com.facebook.FacebookException;
import com.facebook.GraphRequest;
import com.facebook.GraphResponse;
import com.facebook.login.LoginManager;
import com.facebook.login.LoginResult;
import com.facebook.login.widget.LoginButton;
import com.facebook.share.Sharer;
import com.facebook.share.widget.ShareDialog;
import com.tavultesoft.kmapro.R;
import com.tavultesoft.kmea.KMManager;

import android.app.ActionBar;
import android.os.Bundle;
import android.support.v4.app.FragmentActivity;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import org.json.JSONObject;

import java.util.Arrays;
import java.util.List;

public class FBShareActivity extends FragmentActivity {
  private static final String PERMISSION = "publish_actions";

  private CallbackManager callbackManager;
  private ShareDialog shareDialog;

  private FBShareFragment fbShareFragment;

  private FacebookCallback<Sharer.Result> shareCallback = new FacebookCallback<Sharer.Result>() {
    @Override
    public void onSuccess(Sharer.Result result) {

    }

    @Override
    public void onCancel() { Log.d("FBShare", "Cancelled");
    }

    @Override
    public void onError(FacebookException error) {

    }
  };

  @Override
  public void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    setContentView(R.layout.activity_fbshare);

    final ActionBar actionBar = getActionBar();
    actionBar.setLogo(R.drawable.keyman_logo);
    actionBar.setDisplayShowTitleEnabled(false);
    actionBar.setBackgroundDrawable(MainActivity.getActionBarDrawable(this));

    Bundle extras = getIntent().getExtras();
    if (extras != null) {
      FBShareFragment.messageText = extras.getString("messageText");
      FBShareFragment.messageTextSize = extras.getFloat("messageTextSize");
      FBShareFragment.messageTextTypeface = KMManager.getFontTypeface(getApplicationContext(), extras.getString("messageTextTypeface"));
    }

    if (savedInstanceState == null) {
      // Add the fragment on initial activity setup
      fbShareFragment = new FBShareFragment();
      getSupportFragmentManager().beginTransaction().add(android.R.id.content, fbShareFragment).commit();
    } else {
      // Or set the fragment from restored state info
      fbShareFragment = (FBShareFragment) getSupportFragmentManager().findFragmentById(android.R.id.content);
    }
  }
}