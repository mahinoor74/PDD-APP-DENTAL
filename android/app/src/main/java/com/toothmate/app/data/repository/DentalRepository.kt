package com.toothmate.app.data.repository

import com.toothmate.app.data.local.AssessmentDao
import com.toothmate.app.data.local.UserPreferences
import com.toothmate.app.data.model.CariesRiskLevel
import com.toothmate.app.data.model.DentalAssessment
import com.toothmate.app.data.model.Medication
import com.toothmate.app.data.model.Prescription
import com.toothmate.app.data.network.ApiService
import com.toothmate.app.data.network.PredictRequest
import kotlinx.coroutines.flow.Flow
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class DentalRepository(
    private val assessmentDao: AssessmentDao,
    private val apiService: ApiService,
    private val prefs: UserPreferences
) {

    val allAssessments: Flow<List<DentalAssessment>> = assessmentDao.getAllAssessments()

    suspend fun calculateRiskAndSave(
        painLevel: Int,
        bleedingGums: Boolean,
        cavityVisible: Boolean,
        nightFeeding: Boolean,
        sugarFrequency: Int,
        brushingFrequency: Int
    ): DentalAssessment {
        var riskScore = 0
        
        // 🧮 Rule-Based Risk Calculation Engine
        if (painLevel > 4) riskScore += 35
        else if (painLevel > 0) riskScore += 15

        if (cavityVisible) riskScore += 30
        if (bleedingGums) riskScore += 15
        if (nightFeeding) riskScore += 10
        if (sugarFrequency >= 3) riskScore += 15
        if (brushingFrequency < 2) riskScore += 15

        val riskLevel = when {
            riskScore >= 50 -> CariesRiskLevel.HIGH
            riskScore >= 25 -> CariesRiskLevel.MODERATE
            else -> CariesRiskLevel.LOW
        }

        val dateFormat = SimpleDateFormat("MMM dd, yyyy - hh:mm a", Locale.getDefault())
        val assessment = DentalAssessment(
            date = dateFormat.format(Date()),
            painLevel = painLevel,
            bleedingGums = bleedingGums,
            cavityVisible = cavityVisible,
            nightFeeding = nightFeeding,
            sugarFrequency = sugarFrequency,
            brushingFrequency = brushingFrequency,
            cariesRiskScore = riskScore,
            riskLevel = riskLevel
        )

        // Try syncing with API backend asynchronously
        try {
            apiService.predictRisk(
                PredictRequest(
                    age = prefs.childAge,
                    painLevel = painLevel,
                    bleedingGums = bleedingGums,
                    cavityVisible = cavityVisible,
                    sugarFrequency = sugarFrequency,
                    brushingFrequency = brushingFrequency
                )
            )
        } catch (_: Exception) {
            // Fallback to local rule-based assessment
        }

        assessmentDao.insertAssessment(assessment)
        return assessment
    }

    fun generatePrescription(assessment: DentalAssessment): Prescription {
        val medications = mutableListOf<Medication>()
        val instructions = mutableListOf<String>()

        instructions.add("Brush twice daily using soft-bristled toothbrush for 2 full minutes.")
        instructions.add("Use pea-sized amount of fluoridated toothpaste (1000 ppm).")

        when (assessment.riskLevel) {
            CariesRiskLevel.HIGH -> {
                medications.add(
                    Medication(
                        name = "Pediatric Analgesic (Paracetamol / Ibuprofen)",
                        dosage = "Based on child weight (10-15 mg/kg)",
                        frequency = "Every 6 hours as needed for severe pain",
                        duration = "3-5 days",
                        instructions = "Take after food. Consult dentist if pain persists."
                    )
                )
                medications.add(
                    Medication(
                        name = "0.05% Sodium Fluoride Mouthrinse",
                        dosage = "10 ml",
                        frequency = "Once daily before bedtime",
                        duration = "30 days",
                        instructions = "Swish for 60 seconds and spit. Do not swallow."
                    )
                )
                instructions.add("Urgent: Schedule clinical examination with Pediatric Dentist within 48 hours.")
                instructions.add("Avoid sugary snacks, fruit juices, and sticky candies.")
            }
            CariesRiskLevel.MODERATE -> {
                medications.add(
                    Medication(
                        name = "Fluoride Toothpaste (1000 ppm)",
                        dosage = "Pea-sized amount",
                        frequency = "Twice daily",
                        duration = "Continuous",
                        instructions = "Spit after brushing. Do not rinse with excess water immediately."
                    )
                )
                instructions.add("Apply Topical Fluoride Varnish every 3-6 months at dental clinic.")
                instructions.add("Limit intake of cariogenic snacks and carbonated beverages.")
            }
            CariesRiskLevel.LOW -> {
                instructions.add("Maintain daily routine of morning & night brushing.")
                instructions.add("Routine dental checkup recommended every 6 months.")
            }
        }

        val dateFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
        return Prescription(
            date = dateFormat.format(Date()),
            patientName = prefs.childName,
            age = prefs.childAge,
            riskLevel = assessment.riskLevel,
            medications = medications,
            oralHygieneInstructions = instructions,
            followUpDays = if (assessment.riskLevel == CariesRiskLevel.HIGH) 7 else 30
        )
    }
}
