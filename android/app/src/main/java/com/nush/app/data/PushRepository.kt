package com.nush.app.data

import android.util.Log
import com.nush.app.BuildConfig
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL

class PushRepository {

    companion object {
        private const val TAG = "PushRepository"
    }

    /**
     * Registers [fcmToken] for [role] with the Next.js backend.
     * Protected by the shared-secret header.
     */
    suspend fun registerToken(role: String, fcmToken: String): Boolean =
        withContext(Dispatchers.IO) {
            try {
                val url  = URL("${BuildConfig.NUSH_BASE_URL}/api/push/register")
                val conn = url.openConnection() as HttpURLConnection
                conn.apply {
                    requestMethod = "POST"
                    setRequestProperty("Content-Type", "application/json")
                    setRequestProperty("x-push-secret", BuildConfig.PUSH_SHARED_SECRET)
                    doOutput      = true
                    connectTimeout = 10_000
                    readTimeout    = 10_000
                }
                val body = JSONObject().apply {
                    put("role",     role)
                    put("fcmToken", fcmToken)
                }.toString()
                conn.outputStream.use { it.write(body.toByteArray()) }
                val code = conn.responseCode
                conn.disconnect()
                code in 200..299
            } catch (e: Exception) {
                Log.e(TAG, "registerToken failed", e)
                false
            }
        }
}
