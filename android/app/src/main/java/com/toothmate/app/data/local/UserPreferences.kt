package com.toothmate.app.data.local

import android.content.Context
import android.content.SharedPreferences
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import java.time.LocalDate

class UserPreferences(context: Context) {

    private val prefs: SharedPreferences =
        context.getSharedPreferences("toothmate_prefs", Context.MODE_PRIVATE)

    init {
        val currentStored = prefs.getBoolean(KEY_IS_DARK_MODE, false)
        if (_darkModeFlow.value != currentStored) {
            _darkModeFlow.value = currentStored
        }
    }

    var isLoggedIn: Boolean
        get() = prefs.getBoolean(KEY_IS_LOGGED_IN, false)
        set(value) = prefs.edit().putBoolean(KEY_IS_LOGGED_IN, value).apply()

    var userName: String
        get() = prefs.getString(KEY_USER_NAME, "User") ?: "User"
        set(value) = prefs.edit().putString(KEY_USER_NAME, value).apply()

    var userRole: String
        get() = prefs.getString(KEY_USER_ROLE, "PATIENT") ?: "PATIENT"
        set(value) = prefs.edit().putString(KEY_USER_ROLE, value).apply()

    var userMode: String
        get() = prefs.getString(KEY_USER_MODE, "child") ?: "child"
        set(value) = prefs.edit().putString(KEY_USER_MODE, value).apply()

    var childName: String
        get() = prefs.getString(KEY_CHILD_NAME, "ToothMate Champion") ?: "ToothMate Champion"
        set(value) = prefs.edit().putString(KEY_CHILD_NAME, value).apply()

    var childAge: Int
        get() = prefs.getInt(KEY_CHILD_AGE, 18)
        set(value) = prefs.edit().putInt(KEY_CHILD_AGE, value).apply()

    var gender: String
        get() = prefs.getString(KEY_GENDER, "Male") ?: "Male"
        set(value) = prefs.edit().putString(KEY_GENDER, value).apply()

    var morningReminderTime: String
        get() = prefs.getString(KEY_MORNING_TIME, "08:00 AM") ?: "08:00 AM"
        set(value) = prefs.edit().putString(KEY_MORNING_TIME, value).apply()

    var nightReminderTime: String
        get() = prefs.getString(KEY_NIGHT_TIME, "08:00 PM") ?: "08:00 PM"
        set(value) = prefs.edit().putString(KEY_NIGHT_TIME, value).apply()

    var morningActive: Boolean
        get() = prefs.getBoolean(KEY_MORNING_ACTIVE, true)
        set(value) = prefs.edit().putBoolean(KEY_MORNING_ACTIVE, value).apply()

    var nightActive: Boolean
        get() = prefs.getBoolean(KEY_NIGHT_ACTIVE, true)
        set(value) = prefs.edit().putBoolean(KEY_NIGHT_ACTIVE, value).apply()

    var selectedSticker: String
        get() = prefs.getString(KEY_SELECTED_STICKER, "Crown") ?: "Crown"
        set(value) = prefs.edit().putString(KEY_SELECTED_STICKER, value).apply()

    var selectedLanguage: String
        get() = prefs.getString(KEY_LANGUAGE, "en") ?: "en"
        set(value) = prefs.edit().putString(KEY_LANGUAGE, value).apply()

    var brushingStreak: Int
        get() = prefs.getInt(KEY_STREAK, 0)
        set(value) = prefs.edit().putInt(KEY_STREAK, value).apply()

    var todayCompletedCount: Int
        get() {
            checkDailyReset()
            return prefs.getInt(KEY_TODAY_COMPLETED, 0)
        }
        set(value) = prefs.edit().putInt(KEY_TODAY_COMPLETED, value).apply()

    var totalCleanSessions: Int
        get() = prefs.getInt(KEY_TOTAL_CLEAN, 0)
        set(value) = prefs.edit().putInt(KEY_TOTAL_CLEAN, value).apply()

    var lastLogDate: String
        get() = prefs.getString(KEY_LAST_LOG_DATE, "") ?: ""
        set(value) = prefs.edit().putString(KEY_LAST_LOG_DATE, value).apply()

    var isDarkMode: Boolean
        get() = prefs.getBoolean(KEY_IS_DARK_MODE, false)
        set(value) {
            prefs.edit().putBoolean(KEY_IS_DARK_MODE, value).apply()
            _darkModeFlow.value = value
        }

    fun toggleDarkMode(): Boolean {
        val next = !isDarkMode
        isDarkMode = next
        return next
    }

    var brushDaysUsed: Int
        get() = prefs.getInt(KEY_BRUSH_DAYS_USED, 42)
        set(value) = prefs.edit().putInt(KEY_BRUSH_DAYS_USED, value).apply()

    fun checkDailyReset() {
        val todayStr = try {
            LocalDate.now().toString()
        } catch (_: Exception) {
            ""
        }
        val storedDate = prefs.getString(KEY_LAST_LOG_DATE, "") ?: ""
        if (storedDate.isNotBlank() && storedDate != todayStr) {
            prefs.edit().putInt(KEY_TODAY_COMPLETED, 0).apply()
        }
        if (storedDate != todayStr) {
            prefs.edit().putString(KEY_LAST_LOG_DATE, todayStr).apply()
        }
    }

    fun incrementStreak() {
        brushingStreak = brushingStreak + 1
    }

    var cleanSessions: Int
        get() = totalCleanSessions
        set(value) { totalCleanSessions = value }

    fun incrementCleanSessions() {
        totalCleanSessions = totalCleanSessions + 1
    }

    companion object {
        private val _darkModeFlow = MutableStateFlow(false)
        val darkModeFlow: StateFlow<Boolean> = _darkModeFlow.asStateFlow()

        private const val KEY_IS_LOGGED_IN = "key_is_logged_in"
        private const val KEY_USER_NAME = "key_user_name"
        private const val KEY_USER_ROLE = "key_user_role"
        private const val KEY_USER_MODE = "key_user_mode"
        private const val KEY_CHILD_NAME = "key_child_name"
        private const val KEY_CHILD_AGE = "key_child_age"
        private const val KEY_GENDER = "key_gender"
        private const val KEY_MORNING_TIME = "key_morning_time"
        private const val KEY_NIGHT_TIME = "key_night_time"
        private const val KEY_MORNING_ACTIVE = "key_morning_active"
        private const val KEY_NIGHT_ACTIVE = "key_night_active"
        private const val KEY_SELECTED_STICKER = "key_selected_sticker"
        private const val KEY_LANGUAGE = "key_language"
        private const val KEY_STREAK = "key_streak"
        private const val KEY_TODAY_COMPLETED = "key_today_completed"
        private const val KEY_TOTAL_CLEAN = "key_total_clean"
        private const val KEY_LAST_LOG_DATE = "key_last_log_date"
        private const val KEY_IS_DARK_MODE = "key_is_dark_mode"
        private const val KEY_BRUSH_DAYS_USED = "key_brush_days_used"
    }
}
