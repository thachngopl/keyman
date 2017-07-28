/**
 * Copyright (C) 2017 SIL International. All rights reserved.
 */

package com.tavultesoft.kmapro

import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.io.ObjectInputStream
import java.io.ObjectOutputStream
import java.net.MalformedURLException
import java.net.URL
import java.util.ArrayList
import java.util.HashMap

import android.os.Bundle
import android.util.Log
import android.view.MenuItem
import android.view.View
import android.view.ViewGroup
import android.view.View.OnClickListener
import android.widget.AdapterView
import android.widget.BaseAdapter
import android.widget.EditText
import android.widget.ImageButton
import android.widget.ListAdapter
import android.widget.ListView
import android.widget.PopupMenu
import android.widget.SimpleAdapter
import android.widget.TextView
import android.widget.Toast
import android.widget.AdapterView.OnItemLongClickListener
import android.annotation.SuppressLint
import android.app.ActionBar
import android.app.Activity
import android.app.AlertDialog
import android.content.Context
import android.content.DialogInterface
import android.content.Intent

class BookmarksActivity : Activity() {
    private val titleKey = "title"
    private val urlKey = "url"
    private val iconKey = "icon"
    private var mDialog: AlertDialog? = null

    @SuppressLint("SetJavaScriptEnabled", "InflateParams")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        val context = this
        val title = intent.getStringExtra(titleKey)
        val url = intent.getStringExtra(urlKey)
        val actionBar = actionBar
        actionBar!!.setLogo(null)
        actionBar.setDisplayShowHomeEnabled(false)
        actionBar.setDisplayShowTitleEnabled(false)
        actionBar.setDisplayShowCustomEnabled(true)
        actionBar.setBackgroundDrawable(MainActivity.getActionBarDrawable(this))
        val bookmarksTitleLayout = layoutInflater.inflate(
                R.layout.bookmarks_title_layout, null) as ViewGroup
        actionBar.customView = bookmarksTitleLayout
        setContentView(R.layout.bookmarks_list_layout)
        listView = findViewById(R.id.listView) as ListView
        list = bookmarksList
        val from = arrayOf(titleKey, urlKey, iconKey)
        val to = intArrayOf(R.id.text1, R.id.text2, R.id.imageButton)
        val listAdapter = SimpleAdapter(this, list, R.layout.bookmarks_row_layout, from, to)
        listView!!.adapter = listAdapter
        listView!!.onItemClickListener = AdapterView.OnItemClickListener { parent, view, position, id ->
            val urlView = view.findViewById(R.id.text2) as TextView
            val intent = Intent()
            intent.putExtra("url", urlView.text)
            setResult(Activity.RESULT_OK, intent)
            finish()
        }

        listView!!.onItemLongClickListener = OnItemLongClickListener { parent, view, position, id ->
            if (position >= 0) {
                val popup = PopupMenu(context, view)
                popup.menuInflater.inflate(R.menu.popup, popup.menu)
                popup.setOnMenuItemClickListener { item ->
                    if (item.itemId == R.id.popup_delete) {
                        deleteBookmark(position)
                        true
                    } else {
                        false
                    }
                }
                popup.show()
                true
            } else {
                false
            }
        }

        val emptyText = findViewById(android.R.id.empty) as TextView
        listView!!.emptyView = emptyText

        val addButton = findViewById(R.id.addButton) as ImageButton
        addButton.setOnClickListener(OnClickListener {
            val dialogBuilder = AlertDialog.Builder(context)
            dialogBuilder.setTitle("Add Bookmark")
            dialogBuilder.setView(layoutInflater.inflate(R.layout.add_bookmark_dialog_layout, null))
            dialogBuilder.setPositiveButton("Add", DialogInterface.OnClickListener { dialog, which ->
                val titleField = mDialog!!.findViewById(R.id.title) as EditText
                val urlField = mDialog!!.findViewById(R.id.url) as EditText
                if (titleField.text.toString().isEmpty()) {
                    Toast.makeText(context, "Invalid title!", Toast.LENGTH_SHORT).show()
                    return@OnClickListener
                } else if (urlField.text.toString().isEmpty()) {
                    Toast.makeText(context, "Invalid url!", Toast.LENGTH_SHORT).show()
                    return@OnClickListener
                } else {
                    val urlStr = urlField.text.toString()
                    try {
                        URL(urlStr)
                    } catch (e: MalformedURLException) {
                        Toast.makeText(context, "Invalid url!", Toast.LENGTH_SHORT).show()
                        return@OnClickListener
                    }

                }

                val bookmark = HashMap<String, String>()
                bookmark.put(titleKey, titleField.text.toString())
                bookmark.put(urlKey, urlField.text.toString())
                bookmark.put(iconKey, "")
                list!!.add(bookmark)
                if (saveBookmarksList()) {
                    val adapter = listAdapter as BaseAdapter
                    adapter.notifyDataSetChanged()
                } else {
                    Toast.makeText(context, "Failed to save bookmark!", Toast.LENGTH_LONG).show()
                }
            })

            dialogBuilder.setNegativeButton("Cancel") { dialog, which ->
                // Cancel
            }

            mDialog = dialogBuilder.create()
            mDialog!!.show()
            val titleField = mDialog!!.findViewById(R.id.title) as EditText
            titleField.setText(title)
            val urlField = mDialog!!.findViewById(R.id.url) as EditText
            urlField.setText(url)
        })
    }

    override fun onBackPressed() {
        finish()
        overridePendingTransition(0, android.R.anim.fade_out)
    }

    private val bookmarksList: ArrayList<HashMap<String, String>>
        get() {
            var list: ArrayList<HashMap<String, String>>? = null

            val file = File(getDir("userdata", Context.MODE_PRIVATE), bookmarksFilename)
            if (file.exists()) {
                try {
                    val inputStream = ObjectInputStream(FileInputStream(file))
                    list = inputStream.readObject() as ArrayList<HashMap<String, String>>
                    inputStream.close()
                } catch (e: Exception) {
                    Log.e("KMAPro", "Failed to read bookmarks list: " + e.message)
                    list = null
                }

            } else {
                list = ArrayList<HashMap<String, String>>()
            }

            return list
        }

    private fun saveBookmarksList(): Boolean {
        var result: Boolean
        try {
            val file = File(getDir("userdata", Context.MODE_PRIVATE), bookmarksFilename)
            val outputStream = ObjectOutputStream(FileOutputStream(file))
            outputStream.writeObject(list)
            outputStream.flush()
            outputStream.close()
            result = true
        } catch (e: Exception) {
            Log.e("KMAPro", "Failed to save bookmarks list: " + e.message)
            result = false
        }

        return result
    }

    private fun deleteBookmark(position: Int) {
        list!!.removeAt(position)
        if (saveBookmarksList()) {
            val adapter = listView!!.adapter as BaseAdapter
            adapter.notifyDataSetChanged()
            Toast.makeText(this, "Bookmark deleted", Toast.LENGTH_SHORT).show()
        }
    }

    companion object {

        private var listView: ListView? = null
        private var list: ArrayList<HashMap<String, String>>? = null
        private val bookmarksFilename = "bookmarks.dat"
    }
}