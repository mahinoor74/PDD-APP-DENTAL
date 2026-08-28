package com.toothmate.app.data.network

import com.google.gson.annotations.SerializedName
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

data class ChatRequest(
    @SerializedName("message") val message: String,
    @SerializedName("user_id") val userId: Any = 1,
    @SerializedName("userId") val userIdAlt: Any = 1,
    @SerializedName("lang") val lang: String = "English"
)

data class ChatResponse(
    @SerializedName("success") val success: Boolean? = true,
    @SerializedName("response") val responseStr: String? = null,
    @SerializedName("text") val textStr: String? = null,
    @SerializedName("reply") val replyStr: String? = null,
    @SerializedName("category") val category: String? = null,
    @SerializedName("confidence") val confidence: Float? = 0f,
    @SerializedName("followUpChips") val followUpChips: List<String>? = emptyList(),
    @SerializedName("chips") val chips: List<String>? = emptyList(),
    @SerializedName("suggestions") val suggestions: List<String>? = emptyList()
) {
    val responseText: String
        get() = responseStr?.takeIf { it.isNotBlank() }
            ?: textStr?.takeIf { it.isNotBlank() }
            ?: replyStr?.takeIf { it.isNotBlank() }
            ?: "I am Dr. Minty, your AI Dental Coach. How can I assist you today?"

    val chipsList: List<String>
        get() {
            val list = followUpChips.orEmpty().ifEmpty { chips.orEmpty() }.ifEmpty { suggestions.orEmpty() }
            return list.ifEmpty {
                listOf(
                    "How to reduce tooth sensitivity?",
                    "Why do my gums bleed?",
                    "Modified Bass technique guide"
                )
            }
        }
}

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

data class TechniqueRecommendRequest(
    @SerializedName("age_group") val ageGroup: Int = 1,
    @SerializedName("has_braces") val hasBraces: Int = 0,
    @SerializedName("has_implants_bridges") val hasImplantsBridges: Int = 0,
    @SerializedName("bleeding_gums") val bleedingGums: Int = 0,
    @SerializedName("gum_recession") val gumRecession: Int = 0,
    @SerializedName("tooth_sensitivity") val toothSensitivity: Int = 0,
    @SerializedName("limited_dexterity") val limitedDexterity: Int = 0,
    @SerializedName("plaque_buildup") val plaqueBuildup: Int = 0
)

data class TechniqueRecommendResponse(
    @SerializedName("recommended_technique") val recommendedTechnique: String,
    @SerializedName("confidence_score") val confidenceScore: Float,
    @SerializedName("clinical_rationale") val clinicalRationale: String,
    @SerializedName("key_features") val keyFeatures: List<String> = emptyList(),
    @SerializedName("description") val description: String? = null,
    @SerializedName("whatItIs") val whatItIs: String? = null,
    @SerializedName("howItWorks") val howItWorks: String? = null,
    @SerializedName("precautions") val precautions: List<String>? = emptyList(),
    @SerializedName("steps") val steps: List<String>? = emptyList(),
    @SerializedName("videoUrl") val videoUrl: String? = null
)

interface ApiService {
    @GET("/")
    suspend fun checkHealth(): Response<Map<String, String>>

    @POST("/api/chat")
    suspend fun sendChatMessage(@Body request: ChatRequest): Response<ChatResponse>

    @POST("/api/predict")
    suspend fun predictRisk(@Body request: PredictRequest): Response<PredictResponse>

    @POST("api/technique/recommend")
    suspend fun recommendTechnique(@Body request: TechniqueRecommendRequest): Response<TechniqueRecommendResponse>
}
