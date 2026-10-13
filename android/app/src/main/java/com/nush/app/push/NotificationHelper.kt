package com.nush.app.push

import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.graphics.Color
import android.os.Build
import androidx.annotation.RequiresApi
import androidx.core.app.NotificationCompat
import com.nush.app.R
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class NotificationHelper @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    companion object {
        const val CHANNEL_HEARTBEAT = "heartbeat"
        const val CHANNEL_MESSAGES  = "messages"
        const val NOTIF_ID_HEARTBEAT = 1001
    }

    private val manager: NotificationManager =
        context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    fun createChannels() {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return

        // Heartbeat channel — high importance, custom vibration, pink LED
        val heartbeatChannel = NotificationChannel(
            CHANNEL_HEARTBEAT,
            "Calculator",
            NotificationManager.IMPORTANCE_HIGH,
        ).apply {
            description = "Calculator notifications"
            enableLights(true)
            lightColor = Color.parseColor("#FF5C8E")
            enableVibration(true)
            // Matches HeartbeatBeacon haptic pattern: [60,40,80,200]
            vibrationPattern = longArrayOf(0L, 60L, 40L, 80L, 200L)
        }

        // Messages channel — default importance
        val messagesChannel = NotificationChannel(
            CHANNEL_MESSAGES,
            "Messages 💌",
            NotificationManager.IMPORTANCE_DEFAULT,
        ).apply {
            description = "General messages and updates"
        }

        manager.createNotificationChannels(listOf(heartbeatChannel, messagesChannel))
    }

    /** Build and show a heartbeat notification. */
    fun showHeartbeatNotification(title: String, body: String) {
        val notification = NotificationCompat.Builder(context, CHANNEL_HEARTBEAT)
            .setSmallIcon(R.drawable.ic_notification_heart)
            .setContentTitle(title)
            .setContentText(body)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setColor(Color.parseColor("#FF5C8E"))
            .setAutoCancel(true)
            .setVibrate(longArrayOf(0L, 60L, 40L, 80L, 200L))
            .build()

        manager.notify(NOTIF_ID_HEARTBEAT, notification)
    }
}
