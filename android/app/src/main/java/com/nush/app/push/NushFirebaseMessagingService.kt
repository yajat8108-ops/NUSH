package com.nush.app.push

import android.app.PendingIntent
import android.content.Intent
import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.nush.app.MainActivity
import com.nush.app.data.PreferencesManager
import com.nush.app.data.PushRepository
import dagger.hilt.android.AndroidEntryPoint
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import javax.inject.Inject

@AndroidEntryPoint
class NushFirebaseMessagingService : FirebaseMessagingService() {

    @Inject lateinit var notificationHelper: NotificationHelper
    @Inject lateinit var preferencesManager: PreferencesManager
    @Inject lateinit var pushRepository: PushRepository

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    companion object {
        private const val TAG = "NushFCM"
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM token: ${token.take(8)}…")
        scope.launch {
            preferencesManager.setFcmToken(token)
            val role = preferencesManager.roleFlow.first()
            if (role.isNotBlank()) {
                pushRepository.registerToken(role, token)
            }
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        Log.d(TAG, "FCM message received: ${message.data}")

        val title = message.notification?.title
            ?: message.data["title"]
            ?: "Calculator"
        val body  = message.notification?.body
            ?: message.data["body"]
            ?: "Calculator is yearning for you 🩷"
        val type  = message.data["type"] ?: "heartbeat"

        if (type == "heartbeat") {
            notificationHelper.showHeartbeatNotification(title, body)
        }
    }
}
