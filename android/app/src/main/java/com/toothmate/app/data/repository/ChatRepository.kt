package com.toothmate.app.data.repository

import com.toothmate.app.data.model.ChatMessage
import com.toothmate.app.data.network.ApiService
import com.toothmate.app.data.network.ChatRequest
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ChatRepository(private val apiService: ApiService) {

    suspend fun getChatResponse(userMessage: String): ChatMessage {
        val dateFormat = SimpleDateFormat("hh:mm a", Locale.getDefault())
        val timestamp = dateFormat.format(Date())

        return try {
            val response = apiService.sendChatMessage(ChatRequest(message = userMessage))
            val text = if (response.isSuccessful && response.body() != null && response.body()!!.response.isNotBlank()) {
                response.body()!!.response
            } else {
                getFallbackAIResponse(userMessage)
            }
            ChatMessage(text = text, isUser = false, timestamp = timestamp)
        } catch (_: Exception) {
            ChatMessage(
                text = getFallbackAIResponse(userMessage),
                isUser = false,
                timestamp = timestamp
            )
        }
    }

    private fun getFallbackAIResponse(prompt: String): String {
        val lower = prompt.lowercase().trim()
        val clean = lower.replace(Regex("[^a-z0-9\\s]"), "")

        return when {
            clean in listOf("hi", "hello", "hey", "hlo", "holla", "good morning", "good evening") || clean.startsWith("hi ") || clean.startsWith("hello ") || clean.startsWith("hlo ") ->
                "Hello there! How can I help you take care of your teeth and gums today?"

            clean.contains("what are you doing") || clean.contains("what u doing") || clean.contains("what r u doing") ->
                "I'm ready and waiting to answer your dental questions and help you brush properly! What's on your mind?"

            clean.contains("who are you") || clean.contains("your name") || clean.contains("ur name") ->
                "I'm Dr. Minty, your personal AI dental assistant here to guide your brushing habits and answer all your oral hygiene questions!"

            clean.contains("joke") ->
                "Why did the smartphone go to the dentist? Because it had a Bluetooth! Remember to floss daily!"

            clean.contains("bass") || clean.contains("modified bass") ->
                "The Modified Bass Technique is the gold standard method recommended by periodontists worldwide:\n\n1. **Angle**: Angle toothbrush bristles at 45 degrees toward the gum line sulcus.\n2. **Vibrate**: Apply light pressure and vibrate gently back-and-forth in small circular motions for 10 seconds per group of 2-3 teeth.\n3. **Sweep**: Roll/sweep the brush head firmly away from the gums toward the chewing surface to sweep out plaque.\n4. **Duration**: Brush for 2 full minutes twice daily."

            clean.contains("pain") || clean.contains("ache") || clean.contains("toothache") ->
                "For temporary toothache relief, rinse your mouth gently with warm salt water (1/2 tsp salt in warm water), floss to clear trapped food debris, and take OTC analgesics if prescribed. Please schedule a visit with your physical dentist promptly!"

            clean.contains("bleeding") || clean.contains("gum") ->
                "Bleeding gums often signal gingivitis caused by plaque buildup along the gum line. Continue brushing gently with soft bristles at a 45-degree angle. If bleeding persists beyond 5 days, professional dental scaling is recommended."

            clean.contains("sensitivity") || clean.contains("sensitive") || clean.contains("cold") ->
                "Tooth sensitivity occurs when enamel wears down or gums recede exposing dentin. Switch to a Potassium Nitrate desensitizing toothpaste (Sensodyne), use a soft-bristled toothbrush, and avoid highly acidic foods."

            else ->
                "I am Dr. Minty, your AI Dental Coach. Could you describe your dental concern in more detail? For example: tooth pain, bleeding gums, brushing technique, sensitivity, or braces care?"
        }
    }
}
