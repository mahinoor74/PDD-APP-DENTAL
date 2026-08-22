package com.toothmate.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.toothmate.app.data.local.UserPreferences
import com.toothmate.app.data.model.ChatMessage
import com.toothmate.app.data.repository.ChatRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class ChatViewModel(
    private val repository: ChatRepository,
    private val prefs: UserPreferences
) : ViewModel() {

    private val _messages = MutableStateFlow<List<ChatMessage>>(emptyList())
    val messages: StateFlow<List<ChatMessage>> = _messages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    val isDarkMode: StateFlow<Boolean> = UserPreferences.darkModeFlow

    private val _userName = MutableStateFlow(prefs.childName)
    val userName: StateFlow<String> = _userName.asStateFlow()

    val defaultSuggestions = listOf(
        "How to reduce tooth sensitivity?",
        "Why do my gums bleed?",
        "Modified Bass technique guide"
    )

    init {
        refreshWelcomeMessage()
    }

    fun refreshWelcomeMessage() {
        val currentName = prefs.childName.ifBlank { prefs.userName }.ifBlank { "User" }
        _userName.value = currentName
        val timestamp = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
        
        val welcomeMsgText = "Hello $currentName! I am Dr. Minty, your local AI dental hygiene assistant. How can I help you today?"
        
        val initialWelcome = ChatMessage(
            text = welcomeMsgText,
            isUser = false,
            timestamp = timestamp,
            suggestions = defaultSuggestions
        )
        if (_messages.value.isEmpty()) {
            _messages.value = listOf(initialWelcome)
        }
    }

    fun sendMessage(userText: String) {
        if (userText.isBlank()) return

        val dateFormat = SimpleDateFormat("hh:mm a", Locale.getDefault())
        val userMsg = ChatMessage(
            text = userText,
            isUser = true,
            timestamp = dateFormat.format(Date())
        )

        _messages.value = _messages.value + userMsg
        _isLoading.value = true

        viewModelScope.launch(Dispatchers.IO) {
            try {
                val aiMsg = repository.getChatResponse(userText)
                _messages.value = _messages.value + aiMsg
            } catch (_: Exception) {
                val fallbackMsg = ChatMessage(
                    text = "I'm feeling minty fresh and ready to help! How can I assist with your teeth, gums, or oral hygiene today?",
                    isUser = false,
                    timestamp = dateFormat.format(Date()),
                    suggestions = defaultSuggestions
                )
                _messages.value = _messages.value + fallbackMsg
            } finally {
                _isLoading.value = false
            }
        }
    }
}
