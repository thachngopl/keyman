/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.tavultesoft.kmapro

import java.util.ArrayList

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.net.ConnectivityManager
import android.net.NetworkInfo

class NetworkStateReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        if (hasConnection(context)) {
            notifyListeners(networkStateChangeListeners, true)
        } else {
            notifyListeners(networkStateChangeListeners, false)
        }
    }

    interface OnNetworkStateChangeListener {
        fun onNetworkStateChanged(hasConnection: Boolean)
    }

    companion object {

        private var networkStateChangeListeners: ArrayList<OnNetworkStateChangeListener>? = null

        fun hasConnection(context: Context): Boolean {
            val cm = context.getSystemService(Context.CONNECTIVITY_SERVICE) as ConnectivityManager

            val wifiNetwork = cm.getNetworkInfo(ConnectivityManager.TYPE_WIFI)
            if (wifiNetwork != null && wifiNetwork.isConnected) {
                return true
            }

            val mobileNetwork = cm.getNetworkInfo(ConnectivityManager.TYPE_MOBILE)
            if (mobileNetwork != null && mobileNetwork.isConnected) {
                return true
            }

            val activeNetwork = cm.activeNetworkInfo
            if (activeNetwork != null && activeNetwork.isConnected) {
                return true
            }

            return false
        }

        fun addNetworkStateChangeListener(listener: OnNetworkStateChangeListener?) {
            if (networkStateChangeListeners == null)
                networkStateChangeListeners = ArrayList<OnNetworkStateChangeListener>()

            if (listener != null && !networkStateChangeListeners!!.contains(listener)) {
                networkStateChangeListeners!!.add(listener)
            }
        }

        fun removeNetworkStateChangeListener(listener: OnNetworkStateChangeListener) {
            if (networkStateChangeListeners != null) {
                networkStateChangeListeners!!.remove(listener)
            }
        }

        fun notifyListeners(listeners: ArrayList<OnNetworkStateChangeListener>?, hasConnection: Boolean) {
            if (listeners != null) {
                val _listeners = listeners.clone() as ArrayList<OnNetworkStateChangeListener>// make a copy of the list to avoid concurrent modification while iterating
                for (listener in _listeners)
                    listener.onNetworkStateChanged(hasConnection)
            }
        }
    }
}