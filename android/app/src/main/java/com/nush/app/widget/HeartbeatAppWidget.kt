package com.nush.app.widget

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.util.Log
import android.widget.RemoteViews
import com.nush.app.BuildConfig
import com.nush.app.MainActivity
import com.nush.app.R
import com.nush.app.data.PreferencesManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.launch
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class HeartbeatAppWidget : AppWidgetProvider() {

    companion object {
        const val ACTION_PULSE = "com.nush.app.action.WIDGET_PULSE"
        private const val TAG = "HeartbeatAppWidget"
    }

    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    override fun onUpdate(
        context: Context,
        appWidgetManager: AppWidgetManager,
        appWidgetIds: IntArray
    ) {
        for (widgetId in appWidgetIds) {
            updateWidget(context, appWidgetManager, widgetId)
        }
    }

    override fun onReceive(context: Context, intent: Intent) {
        super.onReceive(context, intent)
        if (intent.action == ACTION_PULSE) {
            scope.launch {
                triggerHeartbeat(context)
            }
        }
    }

    private fun updateWidget(
        context: Context,
        appWidgetManager: AppWidgetManager,
        widgetId: Int
    ) {
        val views = RemoteViews(context.packageName, R.layout.widget_heartbeat)

        // PendingIntent for instant pulse on click
        val pulseIntent = Intent(context, HeartbeatAppWidget::class.java).apply {
            action = ACTION_PULSE
        }
        val pulsePendingIntent = PendingIntent.getBroadcast(
            context,
            0,
            pulseIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        views.setOnClickPendingIntent(R.id.widget_root, pulsePendingIntent)

        appWidgetManager.updateAppWidget(widgetId, views)
    }

    private suspend fun triggerHeartbeat(context: Context) {
        try {
            val prefs = PreferencesManager(context)
            val role = prefs.roleFlow.first().ifBlank { BuildConfig.PRESET_ROLE }.ifBlank { "nush" }

            val url = URL("${BuildConfig.NUSH_BASE_URL}/api/presence")
            val conn = url.openConnection() as HttpURLConnection
            conn.apply {
                requestMethod = "POST"
                setRequestProperty("Content-Type", "application/json")
                setRequestProperty("x-push-secret", BuildConfig.PUSH_SHARED_SECRET)
                doOutput = true
                connectTimeout = 8_000
                readTimeout = 8_000
            }
            val body = JSONObject().apply {
                put("role", role)
                put("heartbeat", true)
            }.toString()

            conn.outputStream.use { it.write(body.toByteArray()) }
            val code = conn.responseCode
            conn.disconnect()
            Log.d(TAG, "Heartbeat pulse sent from widget with status $code")
        } catch (e: Exception) {
            Log.e(TAG, "Error sending heartbeat from widget", e)
        }
    }
}
