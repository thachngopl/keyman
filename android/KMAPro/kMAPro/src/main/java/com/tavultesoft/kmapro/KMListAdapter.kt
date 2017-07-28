/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.tavultesoft.kmapro

import android.content.Context
import android.view.View
import android.view.ViewGroup
import android.widget.SimpleAdapter

internal class KMListAdapter(context: Context, data: List<Map<String, *>>, resource: Int, from: Array<String>, to: IntArray) : SimpleAdapter(context, data, resource, from, to) {

    private val enabled: BooleanArray

    init {
        val length = data.size
        enabled = BooleanArray(length)
        for (i in 0..length - 1) {
            val value = data[i]["isEnabled"].toString()
            if (value == "true") {
                enabled[i] = true
            } else {
                enabled[i] = false
            }
        }
    }

    override fun getView(position: Int, convertView: View, parent: ViewGroup): View {
        val view = super.getView(position, convertView, parent)
        if (enabled[position]) {
            view.alpha = 1.0f
        } else {
            view.alpha = 0.25f
        }

        return view
    }

    override fun areAllItemsEnabled(): Boolean {
        return true
    }

    override fun isEnabled(position: Int): Boolean {
        return enabled[position]
    }
}
