package com.nush.app

import android.app.Application
import com.nush.app.push.NotificationHelper

class NushApp : Application() {

    override fun onCreate() {
        super.onCreate()
        // Create notification channels on startup
        NotificationHelper(this).createChannels()
    }
}
