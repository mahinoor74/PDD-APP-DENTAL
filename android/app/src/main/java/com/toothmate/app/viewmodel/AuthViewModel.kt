package com.toothmate.app.viewmodel

import androidx.lifecycle.ViewModel
import com.toothmate.app.data.local.UserPreferences
import com.toothmate.app.data.model.UserRole
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class AuthViewModel(private val prefs: UserPreferences) : ViewModel() {

    private val _isLoggedIn = MutableStateFlow(prefs.isLoggedIn)
    val isLoggedIn: StateFlow<Boolean> = _isLoggedIn.asStateFlow()

    private val _userName = MutableStateFlow(prefs.userName)
    val userName: StateFlow<String> = _userName.asStateFlow()

    private val _userMode = MutableStateFlow(prefs.userMode)
    val userMode: StateFlow<String> = _userMode.asStateFlow()

    private val _childName = MutableStateFlow(prefs.childName)
    val childName: StateFlow<String> = _childName.asStateFlow()

    private val _childAge = MutableStateFlow(prefs.childAge)
    val childAge: StateFlow<Int> = _childAge.asStateFlow()

    private val _gender = MutableStateFlow(prefs.gender)
    val gender: StateFlow<String> = _gender.asStateFlow()

    private val _morningReminderTime = MutableStateFlow(prefs.morningReminderTime)
    val morningReminderTime: StateFlow<String> = _morningReminderTime.asStateFlow()

    private val _nightReminderTime = MutableStateFlow(prefs.nightReminderTime)
    val nightReminderTime: StateFlow<String> = _nightReminderTime.asStateFlow()

    private val _morningActive = MutableStateFlow(prefs.morningActive)
    val morningActive: StateFlow<Boolean> = _morningActive.asStateFlow()

    private val _nightActive = MutableStateFlow(prefs.nightActive)
    val nightActive: StateFlow<Boolean> = _nightActive.asStateFlow()

    private val _selectedSticker = MutableStateFlow(prefs.selectedSticker)
    val selectedSticker: StateFlow<String> = _selectedSticker.asStateFlow()

    private val _isDarkMode = MutableStateFlow(prefs.isDarkMode)
    val isDarkMode: StateFlow<Boolean> = _isDarkMode.asStateFlow()

    private val _brushDaysUsed = MutableStateFlow(prefs.brushDaysUsed)
    val brushDaysUsed: StateFlow<Int> = _brushDaysUsed.asStateFlow()

    fun login(email: String, name: String, role: UserRole) {
        prefs.isLoggedIn = true
        prefs.userName = name
        prefs.userRole = role.name
        _isLoggedIn.value = true
        _userName.value = name
    }

    fun toggleDarkMode() {
        val next = !prefs.isDarkMode
        prefs.isDarkMode = next
        _isDarkMode.value = next
    }

    fun resetBrushHead() {
        prefs.brushDaysUsed = 0
        _brushDaysUsed.value = 0
    }

    fun saveDemographics(name: String, mode: String, genderVal: String, age: Int) {
        prefs.childName = name
        prefs.userName = name
        prefs.userMode = mode
        prefs.gender = genderVal
        prefs.childAge = age
        
        _childName.value = name
        _userName.value = name
        _userMode.value = mode
        _gender.value = genderVal
        _childAge.value = age
    }

    fun setMorningAlarmEnabled(isEnabled: Boolean) {
        prefs.morningActive = isEnabled
        _morningActive.value = isEnabled
    }

    fun setNightAlarmEnabled(isEnabled: Boolean) {
        prefs.nightActive = isEnabled
        _nightActive.value = isEnabled
    }

    fun saveReminders(morningTime: String, nightTime: String, morningOn: Boolean, nightOn: Boolean) {
        prefs.morningReminderTime = morningTime
        prefs.nightReminderTime = nightTime
        prefs.morningActive = morningOn
        prefs.nightActive = nightOn

        _morningReminderTime.value = morningTime
        _nightReminderTime.value = nightTime
        _morningActive.value = morningOn
        _nightActive.value = nightOn
    }

    fun setSelectedSticker(sticker: String) {
        prefs.selectedSticker = sticker
        _selectedSticker.value = sticker
    }

    fun logout() {
        prefs.isLoggedIn = false
        _isLoggedIn.value = false
    }
}
