package com.toothmate.app.data.network

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

data class ChatRequest(
    @SerializedName("message") val message: String,
    @SerializedName("user_id") val userId: Int = 1
)

data class ChatResponse(
    @SerializedName("response") val response: String,
    @SerializedName("status") val status: String = "success"
)

data class PredictRequest(
    @SerializedName("age") val age: Int,
    @SerializedName("pain_level") val painLevel: Int,
    @SerializedName("bleeding_gums") val bleedingGums: Boolean,
    @SerializedName("cavity_visible") val cavityVisible: Boolean,
    @SerializedName("sugar_frequency") val sugarFrequency: Int,
    @SerializedName("brushing_frequency") val brushingFrequency: Int
)

data class PredictResponse(
    @SerializedName("risk_score") val riskScore: Int,
    @SerializedName("risk_level") val riskLevel: String,
    @SerializedName("recommendations") val recommendations: List<String>
)

interface ApiService {
    @GET("/")
    suspend fun checkHealth(): Response<Map<String, String>>

    @POST("/api/chat")
    suspend fun sendChatMessage(@Body request: ChatRequest): Response<ChatResponse>

    @POST("/api/predict")
    suspend fun predictRisk(@Body request: PredictRequest): Response<PredictResponse>
}
