package com.nush.app.bridge

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import android.webkit.JavascriptInterface
import android.webkit.WebView
import androidx.browser.customtabs.CustomTabColorSchemeParams
import androidx.browser.customtabs.CustomTabsIntent
import androidx.core.graphics.toColorInt
import com.nush.app.BuildConfig
import com.nush.app.data.PreferencesManager
import com.nush.app.data.PushRepository
import com.google.firebase.messaging.FirebaseMessaging
import dagger.hilt.android.qualifiers.ActivityContext
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import kotlinx.coroutines.tasks.await
import javax.inject.Inject

/**
 * JS bridge injected only when the WebView is on our own origin.
 * Exposed to JS as window.AndroidBridge.
 */
class AndroidBridge @Inject constructor(
    @ActivityContext private val context: Context,
    private val preferencesManager: PreferencesManager,
    private val pushRepository: PushRepository,
) {
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    var onHeartbeatPulseListener: (() -> Unit)? = null

    companion object {
        private const val TAG = "AndroidBridge"
    }

    /** Called by web app when partner or self heartbeat is pulsed */
    @JavascriptInterface
    fun onHeartbeatPulse() {
        scope.launch(Dispatchers.Main) {
            onHeartbeatPulseListener?.invoke()
        }
    }

    /** Called by the website to trigger native haptic feedback.
     *  pattern: comma-separated ms values e.g. "60,40,80,200" */
    @JavascriptInterface
    fun haptic(pattern: String) {
        try {
            val parts = pattern.split(",")
                .mapNotNull { it.trim().toLongOrNull() }
                .toLongArray()
            if (parts.isEmpty()) return

            val vibrator: Vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                (context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as VibratorManager)
                    .defaultVibrator
            } else {
                @Suppress("DEPRECATION")
                context.getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            }

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                vibrator.vibrate(VibrationEffect.createWaveform(parts, -1))
            } else {
                @Suppress("DEPRECATION")
                vibrator.vibrate(parts, -1)
            }
        } catch (e: Exception) {
            Log.e(TAG, "haptic error", e)
        }
    }

    /** Sets and persists the user's role ("nush" or "yajat"). */
    @JavascriptInterface
    fun setRole(role: String) {
        if (role != "nush" && role != "yajat") {
            Log.w(TAG, "setRole: invalid role '$role'")
            return
        }
        scope.launch {
            preferencesManager.setRole(role)
            // Register token if we already have one
            val token = preferencesManager.fcmTokenFlow.first()
            if (!token.isNullOrBlank()) {
                pushRepository.registerToken(role, token)
            }
        }
    }

    /** Fetches current FCM token and registers it with the backend. */
    @JavascriptInterface
    fun registerPush() {
        scope.launch(Dispatchers.IO) {
            try {
                val token = FirebaseMessaging.getInstance().token.await()
                val role  = preferencesManager.roleFlow.first()
                preferencesManager.setFcmToken(token)
                if (role.isNotBlank()) {
                    pushRepository.registerToken(role, token)
                }
            } catch (e: Exception) {
                Log.e(TAG, "registerPush error", e)
            }
        }
    }

    /** Opens an external URL in Chrome Custom Tabs.
     *  Only accepts http/https to prevent intent injection. */
    @JavascriptInterface
    fun openExternal(url: String) {
        try {
            val uri = Uri.parse(url)
            if (uri.scheme != "http" && uri.scheme != "https") {
                Log.w(TAG, "openExternal: blocked scheme '${uri.scheme}'")
                return
            }
            val tabsIntent = CustomTabsIntent.Builder()
                .setDefaultColorSchemeParams(
                    CustomTabColorSchemeParams.Builder()
                        .setToolbarColor("#FF5C8E".toColorInt())
                        .build()
                )
                .build()
            tabsIntent.intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            tabsIntent.launchUrl(context, uri)
        } catch (e: Exception) {
            Log.e(TAG, "openExternal error", e)
        }
    }
}
