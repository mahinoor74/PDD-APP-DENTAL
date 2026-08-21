package com.toothmate.app.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.toothmate.app.data.local.UserPreferences
import com.toothmate.app.data.model.ChatMessage
import com.toothmate.app.data.repository.ChatRepository
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

    private val _userName = MutableStateFlow(prefs.childName)
    val userName: StateFlow<String> = _userName.asStateFlow()

    init {
        refreshWelcomeMessage()
    }

    fun refreshWelcomeMessage() {
        val currentName = prefs.childName.ifBlank { prefs.userName }.ifBlank { "User" }
        _userName.value = currentName
        val timestamp = SimpleDateFormat("hh:mm a", Locale.getDefault()).format(Date())
        val initialWelcome = ChatMessage(
            text = "Hello $currentName! I'm Dr. Minty, your personal AI dental assistant. How can I help you with your teeth, gums, or oral care today?",
            isUser = false,
            timestamp = timestamp
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

        viewModelScope.launch {
            val aiMsg = repository.getChatResponse(userText)
            _messages.value = _messages.value + aiMsg
            _isLoading.value = false
        }
    }
}
