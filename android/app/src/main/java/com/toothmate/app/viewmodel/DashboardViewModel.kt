package com.toothmate.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.toothmate.app.data.local.UserPreferences
import com.toothmate.app.data.model.DentalAssessment
import com.toothmate.app.data.repository.DentalRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import com.toothmate.app.data.model.BrushingSession
import com.toothmate.app.data.model.WeekDayData
import com.toothmate.app.data.model.getCurrentWeekData
import java.time.DayOfWeek
import java.time.LocalDate
import java.time.temporal.TemporalAdjusters

class DashboardViewModel(
    private val repository: DentalRepository,
    private val prefs: UserPreferences
) : ViewModel() {

    private val _childName = MutableStateFlow(prefs.childName)
    val childName: StateFlow<String> = _childName.asStateFlow()

    private val _streakCount = MutableStateFlow(prefs.brushingStreak)
    val streakCount: StateFlow<Int> = _streakCount.asStateFlow()

    private val _todayCompletedCount = MutableStateFlow(prefs.todayCompletedCount)
    val todayCompletedCount: StateFlow<Int> = _todayCompletedCount.asStateFlow()

    private val _totalCleanSessions = MutableStateFlow(prefs.totalCleanSessions)
    val totalCleanSessions: StateFlow<Int> = _totalCleanSessions.asStateFlow()

    private val _morningAlarmTime = MutableStateFlow(prefs.morningReminderTime)
    val morningAlarmTime: StateFlow<String> = _morningAlarmTime.asStateFlow()

    private val _nightAlarmTime = MutableStateFlow(prefs.nightReminderTime)
    val nightAlarmTime: StateFlow<String> = _nightAlarmTime.asStateFlow()

    private val _isMorningAlarmEnabled = MutableStateFlow(prefs.morningActive)
    val isMorningAlarmEnabled: StateFlow<Boolean> = _isMorningAlarmEnabled.asStateFlow()

    private val _isNightAlarmEnabled = MutableStateFlow(prefs.nightActive)
    val isNightAlarmEnabled: StateFlow<Boolean> = _isNightAlarmEnabled.asStateFlow()

    private val _assessmentHistory = MutableStateFlow<List<DentalAssessment>>(emptyList())
    val assessmentHistory: StateFlow<List<DentalAssessment>> = _assessmentHistory.asStateFlow()

    private val _sessions = MutableStateFlow<List<BrushingSession>>(emptyList())
    val sessions: StateFlow<List<BrushingSession>> = _sessions.asStateFlow()

    private val _weekData = MutableStateFlow<Pair<String, List<WeekDayData>>>(Pair("", emptyList()))
    val weekData: StateFlow<Pair<String, List<WeekDayData>>> = _weekData.asStateFlow()

    init {
        refreshDashboard()
        viewModelScope.launch {
            repository.allAssessments.collect { assessments ->
                _assessmentHistory.value = assessments
            }
        }
    }

    fun refreshDashboard() {
        prefs.checkDailyReset()
        _childName.value = prefs.childName
        _streakCount.value = prefs.brushingStreak
        _todayCompletedCount.value = prefs.todayCompletedCount
        _totalCleanSessions.value = prefs.totalCleanSessions
        _morningAlarmTime.value = prefs.morningReminderTime
        _nightAlarmTime.value = prefs.nightReminderTime
        _isMorningAlarmEnabled.value = prefs.morningActive
        _isNightAlarmEnabled.value = prefs.nightActive

        rebuildWeekSessions()
    }

    private fun rebuildWeekSessions() {
        val today = LocalDate.now()
        val monday = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY))
        val currentSessions = mutableListOf<BrushingSession>()

        // Historical compliance for past days in current week
        var tempDate = monday
        while (tempDate.isBefore(today)) {
            currentSessions.add(BrushingSession(date = tempDate, isMorning = true))
            currentSessions.add(BrushingSession(date = tempDate, isMorning = false))
            tempDate = tempDate.plusDays(1)
        }

        // Today's completed sessions
        val todayCount = prefs.todayCompletedCount
        if (todayCount >= 1) currentSessions.add(BrushingSession(date = today, isMorning = true))
        if (todayCount >= 2) currentSessions.add(BrushingSession(date = today, isMorning = false))

        _sessions.value = currentSessions
        _weekData.value = getCurrentWeekData(currentSessions)
    }

    fun logBrushingSession() {
        prefs.checkDailyReset()
        val currentCount = prefs.todayCompletedCount
        if (currentCount < 2) {
            val nextCount = currentCount + 1
            val nextTotal = prefs.totalCleanSessions + 1
            val todayStr = try {
                LocalDate.now().toString()
            } catch (_: Exception) {
                ""
            }

            prefs.todayCompletedCount = nextCount
            prefs.totalCleanSessions = nextTotal
            prefs.lastLogDate = todayStr

            if (nextCount == 2) {
                prefs.incrementStreak()
            }

            _todayCompletedCount.value = nextCount
            _totalCleanSessions.value = nextTotal
            _streakCount.value = prefs.brushingStreak

            rebuildWeekSessions()
        }
    }
}
