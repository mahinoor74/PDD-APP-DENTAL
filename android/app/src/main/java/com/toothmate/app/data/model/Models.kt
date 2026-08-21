package com.toothmate.app.data.model

import androidx.room.Entity
import androidx.room.PrimaryKey

enum class CariesRiskLevel {
    LOW, MODERATE, HIGH
}

enum class UserRole {
    PATIENT, PARENT, DENTIST
}

data class User(
    val id: String = "user_123",
    val email: String = "",
    val name: String = "",
    val role: UserRole = UserRole.PATIENT
)

data class PatientDemographics(
    val childName: String = "",
    val ageYears: Int = 5,
    val gender: String = "Male",
    val teethCount: Int = 20,
    val fluorideExposure: Boolean = true,
    val dietaryHabit: String = "Moderate Sugar",
    val systemicCondition: String = "None"
)

@Entity(tableName = "assessments")
data class DentalAssessment(
    @PrimaryKey val id: String = System.currentTimeMillis().toString(),
    val date: String = "",
    val painLevel: Int = 0, // 0 to 10
    val bleedingGums: Boolean = false,
    val cavityVisible: Boolean = false,
    val nightFeeding: Boolean = false,
    val sugarFrequency: Int = 2, // per day
    val brushingFrequency: Int = 1, // per day
    val cariesRiskScore: Int = 0,
    val riskLevel: CariesRiskLevel = CariesRiskLevel.LOW
)

data class Medication(
    val name: String,
    val dosage: String,
    val frequency: String,
    val duration: String,
    val instructions: String
)

data class Prescription(
    val id: String = System.currentTimeMillis().toString(),
    val date: String = "",
    val patientName: String = "",
    val age: Int = 5,
    val riskLevel: CariesRiskLevel = CariesRiskLevel.LOW,
    val medications: List<Medication> = emptyList(),
    val oralHygieneInstructions: List<String> = emptyList(),
    val followUpDays: Int = 30
)

data class ChatMessage(
    val id: String = System.currentTimeMillis().toString(),
    val text: String,
    val isUser: Boolean,
    val timestamp: String = ""
)

data class Reminder(
    val id: Int,
    val title: String,
    val timeHHMM: String,
    val isMorning: Boolean,
    val isEnabled: Boolean
)

data class BrushingSession(
    val id: String = System.currentTimeMillis().toString(),
    val date: java.time.LocalDate = java.time.LocalDate.now(),
    val isMorning: Boolean = true
)

data class WeekDayData(
    val dayName: String,     // "Mon", "Tue", "Wed", etc.
    val dateNumber: String,   // "17", "18", "24", etc.
    val fullDate: java.time.LocalDate,
    val isToday: Boolean,
    val sessionCount: Int
)

fun getCurrentWeekData(sessions: List<BrushingSession>): Pair<String, List<WeekDayData>> {
    val today = java.time.LocalDate.now()
    val monday = today.with(java.time.temporal.TemporalAdjusters.previousOrSame(java.time.DayOfWeek.MONDAY))
    val sunday = today.with(java.time.temporal.TemporalAdjusters.nextOrSame(java.time.DayOfWeek.SUNDAY))

    val headerFormatter = java.time.format.DateTimeFormatter.ofPattern("MMM d")
    val headerRange = "${monday.format(headerFormatter).uppercase()} - ${sunday.format(headerFormatter).uppercase()}"

    val days = (0..6).map { offset ->
        val date = monday.plusDays(offset.toLong())
        val count = sessions.count { it.date == date }
        WeekDayData(
            dayName = date.dayOfWeek.name.take(3).lowercase().replaceFirstChar { it.uppercase() },
            dateNumber = date.dayOfMonth.toString(),
            fullDate = date,
            isToday = date == today,
            sessionCount = count
        )
    }
    return Pair(headerRange, days)
}

