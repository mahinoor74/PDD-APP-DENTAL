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
            val response = apiService.sendChatMessage(
                ChatRequest(
                    message = userMessage,
                    userId = 1,
                    userIdAlt = 1,
                    lang = "English"
                )
            )

            if (response.isSuccessful && response.body() != null) {
                val body = response.body()!!
                ChatMessage(
                    text = body.responseText,
                    isUser = false,
                    timestamp = timestamp,
                    suggestions = body.chipsList
                )
            } else {
                ChatMessage(
                    text = getFallbackAIResponse(userMessage),
                    isUser = false,
                    timestamp = timestamp,
                    suggestions = getFallbackSuggestions(userMessage)
                )
            }
        } catch (_: Exception) {
            ChatMessage(
                text = getFallbackAIResponse(userMessage),
                isUser = false,
                timestamp = timestamp,
                suggestions = getFallbackSuggestions(userMessage)
            )
        }
    }

    fun getFallbackSuggestions(prompt: String): List<String> {
        val lower = prompt.lowercase().trim()
        return when {
            lower.contains("sensitivity") -> listOf(
                "Best toothpaste for sensitivity?",
                "Why do cold drinks hurt?",
                "How to prevent enamel erosion?"
            )
            lower.contains("bleed") || lower.contains("gum") -> listOf(
                "How to treat gingivitis at home?",
                "Is flossing supposed to hurt?",
                "Best mouthwash for gums?"
            )
            lower.contains("bass") || lower.contains("brush") -> listOf(
                "How long should I brush?",
                "Manual vs Electric toothbrush?",
                "When should I replace my brush?"
            )
            else -> listOf(
                "How to reduce tooth sensitivity?",
                "Why do my gums bleed?",
                "Modified Bass technique guide"
            )
        }
    }

    private fun getFallbackAIResponse(prompt: String): String {
        if (prompt.isBlank()) return "Hello there! How can I help you take care of your teeth and gums today?"

        val lower = prompt.lowercase().trim()
        val clean = lower.replace(Regex("[^a-z0-9\\s]"), "")

        return when {
            // Greetings & Hellos
            clean in listOf("hi", "hello", "hey", "hlo", "hlw", "hii", "helo", "heyy", "yo", "hola", "namaste", "good morning", "good evening", "good afternoon", "sup") ||
            clean.startsWith("hi ") || clean.startsWith("hello ") || clean.startsWith("hey ") ->
                "Hello! I am Dr. Minty, your local AI dental hygiene assistant. How can I help you take care of your teeth and gums today?"

            // What are you doing / What r u doing
            clean.contains("what are you doing") || clean.contains("what u doing") || clean.contains("what r u doing") || clean.contains("what are u doing") || clean.contains("whats up") ->
                "I'm ready and waiting to answer your dental questions and help you brush properly! What's on your mind today?"

            // How are you
            clean.contains("how are you") || clean.contains("how r u") || clean.contains("how do you do") || clean.contains("how is it going") || clean.contains("how are u") ->
                "I'm feeling minty fresh and ready to help! How are your teeth and brushing routines going today?"

            // Identity & Name
            clean.contains("who are you") || clean.contains("what is your name") || clean.contains("whats your name") || clean.contains("ur name") || clean.contains("who r u") ->
                "I'm Dr. Minty, your personal AI dental assistant here to guide your brushing habits and answer all your oral hygiene questions!"

            // What can you do / Capabilities
            clean.contains("what can you do") || clean.contains("what do you do") || clean.contains("how can you help") || clean.contains("help me") ->
                "I can help you with brushing techniques (like Modified Bass), tooth sensitivity, bleeding gums, cavity prevention, braces care, toothache first-aid, and daily oral hygiene routines!"

            // Doctor / AI
            clean.contains("are you a doctor") || clean.contains("are you real") || clean.contains("are you a bot") || clean.contains("are you ai") ->
                "I am an AI-powered dental health guide! While I provide clinically accurate dental information, always visit a human dentist for physical checkups and clinical treatments."

            // Joke
            clean.contains("joke") || clean.contains("funny") ->
                "Why did the smartphone go to the dentist? Because it had a Bluetooth! Remember to floss daily!"

            // Gratitude & Goodbyes
            clean.contains("thank you") || clean.contains("thanks") || clean.contains("tq") || clean.contains("thx") || clean.contains("appreciate") ->
                "You're very welcome! Keep up that great brushing streak, and let me know whenever you have another question."

            clean.contains("bye") || clean.contains("goodbye") || clean.contains("good night") || clean.contains("gn") || clean.contains("see you") ->
                "Goodbye! Don't forget to brush for two full minutes before bed. Keep smiling!"

            // Dental Clinical Knowledge
            clean.contains("bass") || clean.contains("modified bass") ->
                "The Modified Bass Technique is the gold standard method recommended by periodontists worldwide:\n\n1. **Angle**: Angle toothbrush bristles at 45 degrees toward the gum line.\n2. **Vibrate**: Apply light pressure and vibrate gently back-and-forth for 10 seconds per section.\n3. **Sweep**: Roll/sweep the brush head away from the gums toward chewing surfaces.\n4. **Duration**: Brush for 2 full minutes twice daily."

            clean.contains("pain") || clean.contains("ache") || clean.contains("toothache") ->
                "For temporary toothache relief, rinse gently with warm salt water (1/2 tsp salt), floss to clear trapped food debris, and avoid extreme temperatures. Please schedule a physical dental visit promptly!"

            clean.contains("bleeding") || clean.contains("gum") ->
                "Bleeding gums often signal gingivitis. Continue brushing gently with soft bristles at a 45-degree angle. If bleeding persists beyond 5 days, see a dentist for scaling."

            clean.contains("sensitivity") || clean.contains("sensitive") || clean.contains("cold") ->
                "Tooth sensitivity occurs when enamel wears down or gums recede exposing dentin. Switch to a Potassium Nitrate toothpaste (Sensodyne), avoid scrubbing too hard, and limit acidic foods."

            clean.contains("braces") || clean.contains("wire") ->
                "For braces, use the Charters technique: angle bristles 45° downward over top brackets and 45° upward under bottom brackets. Use interdental brushes or threader floss under archwires daily."

            clean.contains("whiten") || clean.contains("white") ->
                "For safe whitening, use fluoride whitening toothpaste or dentist-supervised carbamide peroxide trays. Avoid harsh abrasive DIY powders that strip enamel!"

            clean.contains("cavity") || clean.contains("decay") ->
                "Cavities are caused by bacteria fermenting sugars into acid. Prevent them by brushing twice daily with 1450ppm fluoride toothpaste, flossing daily, and limiting sugary snacks."

            else ->
                "I am Dr. Minty, your AI Dental Coach! Ask me about tooth pain, bleeding gums, brushing technique, sensitivity, cavities, braces, or dental hygiene advice."
        }
    }
}
