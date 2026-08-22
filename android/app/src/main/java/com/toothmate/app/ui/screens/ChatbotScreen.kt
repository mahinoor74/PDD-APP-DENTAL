package com.toothmate.app.ui.screens

import androidx.compose.runtime.Composable
import androidx.navigation.NavController
import com.toothmate.app.data.model.ChatMessage
import com.toothmate.app.viewmodel.ChatViewModel

@Composable
fun ChatbotScreen(navController: NavController, chatViewModel: ChatViewModel) {
    DrMintyChatScreen(navController = navController, chatViewModel = chatViewModel)
}

@Composable
fun ChatBubble(message: ChatMessage) {
    // Legacy fallback wrapper
    DrMintyMessageItem(message = message, isDarkMode = false, onSuggestionClick = {})
}
