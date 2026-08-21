package com.toothmate.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.toothmate.app.data.local.UserPreferences
import com.toothmate.app.data.model.BrushingTechnique
import com.toothmate.app.data.model.ClinicalTechniquesRepository
import com.toothmate.app.data.model.ZoneScriptItem
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.time.LocalDate

class MirrorViewModel(private val prefs: UserPreferences) : ViewModel() {

    private val totalSeconds = 120 // 2 minutes standard

    private val _selectedTechnique = MutableStateFlow(ClinicalTechniquesRepository.TECHNIQUES[0])
    val selectedTechnique: StateFlow<BrushingTechnique> = _selectedTechnique.asStateFlow()

    private val _secondsRemaining = MutableStateFlow(totalSeconds)
    val secondsRemaining: StateFlow<Int> = _secondsRemaining.asStateFlow()

    private val _isRunning = MutableStateFlow(false)
    val isRunning: StateFlow<Boolean> = _isRunning.asStateFlow()

    private val _currentZoneIdx = MutableStateFlow(0)
    val currentZoneIdx: StateFlow<Int> = _currentZoneIdx.asStateFlow()

    private val _streakCount = MutableStateFlow(prefs.brushingStreak)
    val streakCount: StateFlow<Int> = _streakCount.asStateFlow()

    private val _cleanSessions = MutableStateFlow(prefs.cleanSessions)
    val cleanSessions: StateFlow<Int> = _cleanSessions.asStateFlow()

    private val _onZoneChangeTrigger = MutableStateFlow<ZoneScriptItem?>(null)
    val onZoneChangeTrigger: StateFlow<ZoneScriptItem?> = _onZoneChangeTrigger.asStateFlow()

    private val _onFinishTrigger = MutableStateFlow<String?>(null)
    val onFinishTrigger: StateFlow<String?> = _onFinishTrigger.asStateFlow()

    private var timerJob: Job? = null

    fun selectTechnique(techId: String) {
        val tech = ClinicalTechniquesRepository.getById(techId)
        _selectedTechnique.value = tech
        resetTimer()
    }

    fun startTimer() {
        if (_isRunning.value) return
        _isRunning.value = true
        _onFinishTrigger.value = null

        // Trigger Zone 0 script at start
        val currentTech = _selectedTechnique.value
        if (currentTech.zoneScripts.isNotEmpty()) {
            _onZoneChangeTrigger.value = currentTech.zoneScripts[_currentZoneIdx.value]
        }

        timerJob = viewModelScope.launch {
            while (_secondsRemaining.value > 0 && _isRunning.value) {
                delay(1000L)
                _secondsRemaining.value -= 1
                
                val elapsed = totalSeconds - _secondsRemaining.value
                val zoneInterval = maxOf(1, totalSeconds / 6)
                val newZoneIdx = minOf(5, elapsed / zoneInterval)

                if (newZoneIdx != _currentZoneIdx.value) {
                    _currentZoneIdx.value = newZoneIdx
                    val targetZone = currentTech.zoneScripts.getOrNull(newZoneIdx)
                    if (targetZone != null) {
                        _onZoneChangeTrigger.value = targetZone
                    }
                }
            }

            if (_secondsRemaining.value == 0) {
                _isRunning.value = false
                prefs.checkDailyReset()
                val currentCount = prefs.todayCompletedCount
                if (currentCount < 2) {
                    val nextCount = currentCount + 1
                    prefs.todayCompletedCount = nextCount
                    prefs.lastLogDate = try { LocalDate.now().toString() } catch (_: Exception) { "" }
                    if (nextCount == 2) {
                        prefs.incrementStreak()
                    }
                }
                prefs.incrementCleanSessions()
                _streakCount.value = prefs.brushingStreak
                _cleanSessions.value = prefs.cleanSessions
                _onFinishTrigger.value = currentTech.finishScript
            }
        }
    }

    fun pauseTimer() {
        _isRunning.value = false
        timerJob?.cancel()
    }

    fun resetTimer() {
        pauseTimer()
        _secondsRemaining.value = totalSeconds
        _currentZoneIdx.value = 0
        _onFinishTrigger.value = null
    }

    fun selectZone(zoneIndex: Int) {
        _currentZoneIdx.value = zoneIndex
        val targetZone = _selectedTechnique.value.zoneScripts.getOrNull(zoneIndex)
        if (targetZone != null) {
            _onZoneChangeTrigger.value = targetZone
        }
    }
}
