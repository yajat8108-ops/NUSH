package com.nush.app.push

import android.util.Log
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import com.nush.app.data.PreferencesManager
import com.nush.app.data.PushRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch

class NushFirebaseMessagingService : FirebaseMessagingService() {

    private val scope              = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val notificationHelper by lazy { NotificationHelper(this) }
    private val preferencesManager by lazy { PreferencesManager(this) }
    private val pushRepository     by lazy { PushRepository() }

    companion object {
        private const val TAG = "NushFCM"
    }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM token: ${token.take(8)}…")
        scope.launch {
            preferencesManager.setFcmToken(token)
            val role = preferencesManager.roleFlow.first()
            val effectiveRole = if (role.isNotBlank()) role else com.nush.app.BuildConfig.DEFAULT_ROLE
            pushRepository.registerToken(effectiveRole, token)
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
