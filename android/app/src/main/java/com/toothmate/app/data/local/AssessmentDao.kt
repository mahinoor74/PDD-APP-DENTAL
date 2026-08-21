package com.toothmate.app.data.local

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.toothmate.app.data.model.DentalAssessment
import kotlinx.coroutines.flow.Flow

@Dao
interface AssessmentDao {
    @Query("SELECT * FROM assessments ORDER BY id DESC")
    fun getAllAssessments(): Flow<List<DentalAssessment>>

    @Query("SELECT * FROM assessments ORDER BY id DESC LIMIT 1")
    suspend fun getLatestAssessment(): DentalAssessment?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAssessment(assessment: DentalAssessment)

    @Query("DELETE FROM assessments")
    suspend fun clearAssessments()
}
