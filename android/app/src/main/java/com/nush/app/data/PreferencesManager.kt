package com.nush.app.data

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.nush.app.BuildConfig
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore: DataStore<Preferences>
    by preferencesDataStore(name = "nush_prefs")

@Singleton
class PreferencesManager @Inject constructor(
    @ApplicationContext private val context: Context,
) {
    companion object {
        private val KEY_ROLE      = stringPreferencesKey("role")
        private val KEY_FCM_TOKEN = stringPreferencesKey("fcm_token")

        /** Role pre-seeded by product flavor (may be empty string in generic build). */
        val PRESET_ROLE: String = BuildConfig.PRESET_ROLE
    }

    /** Emits "nush", "yajat", or "" when no role chosen yet. */
    val roleFlow: Flow<String> = context.dataStore.data.map { prefs ->
        prefs[KEY_ROLE] ?: PRESET_ROLE
    }

    val fcmTokenFlow: Flow<String?> = context.dataStore.data.map { prefs ->
        prefs[KEY_FCM_TOKEN]
    }

    suspend fun setRole(role: String) {
        require(role == "nush" || role == "yajat") { "Invalid role: $role" }
        context.dataStore.edit { it[KEY_ROLE] = role }
    }

    suspend fun setFcmToken(token: String) {
        context.dataStore.edit { it[KEY_FCM_TOKEN] = token }
    }
}
