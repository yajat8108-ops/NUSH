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
        Log.d(TAG, "New FCM token generated: ${token.take(12)}…")
        scope.launch {
            preferencesManager.setFcmToken(token)
            val role = preferencesManager.roleFlow.first()
            val effectiveRole = if (role.isNotBlank()) role else com.nush.app.BuildConfig.DEFAULT_ROLE
            Log.d(TAG, "Registering FCM token for role '$effectiveRole' with backend")
            pushRepository.registerToken(effectiveRole, token)
        }
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        Log.d(TAG, "FCM message received from: ${message.from}, data: ${message.data}, notification: ${message.notification?.title}")

        val title = message.notification?.title
            ?: message.data["title"]
            ?: "Calculator"
        val body  = message.notification?.body
            ?: message.data["body"]
            ?: "Calculator is yearning for you 🩷"

        // Display notification for any received message
        notificationHelper.showHeartbeatNotification(title, body)
    }
}
