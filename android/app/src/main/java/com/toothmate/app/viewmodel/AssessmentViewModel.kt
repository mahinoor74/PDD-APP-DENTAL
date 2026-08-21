package com.toothmate.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.toothmate.app.data.model.DentalAssessment
import com.toothmate.app.data.model.Prescription
import com.toothmate.app.data.repository.DentalRepository
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

class AssessmentViewModel(private val repository: DentalRepository) : ViewModel() {

    private val _currentAssessment = MutableStateFlow<DentalAssessment?>(null)
    val currentAssessment: StateFlow<DentalAssessment?> = _currentAssessment.asStateFlow()

    private val _currentPrescription = MutableStateFlow<Prescription?>(null)
    val currentPrescription: StateFlow<Prescription?> = _currentPrescription.asStateFlow()

    suspend fun submitAssessment(
        painLevel: Int,
        bleedingGums: Boolean,
        cavityVisible: Boolean,
        nightFeeding: Boolean,
        sugarFrequency: Int,
        brushingFrequency: Int
    ): DentalAssessment {
        val assessment = repository.calculateRiskAndSave(
            painLevel = painLevel,
            bleedingGums = bleedingGums,
            cavityVisible = cavityVisible,
            nightFeeding = nightFeeding,
            sugarFrequency = sugarFrequency,
            brushingFrequency = brushingFrequency
        )
        _currentAssessment.value = assessment
        val prescription = repository.generatePrescription(assessment)
        _currentPrescription.value = prescription
        return assessment
    }
}
