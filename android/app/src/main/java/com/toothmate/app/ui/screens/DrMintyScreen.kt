package com.toothmate.app.ui.screens

import androidx.compose.runtime.Composable
import androidx.navigation.NavController
import com.toothmate.app.data.model.ChatMessage
import com.toothmate.app.viewmodel.ChatViewModel

@Composable
fun DrMintyScreen(navController: NavController, chatViewModel: ChatViewModel) {
    DrMintyChatScreen(navController = navController, chatViewModel = chatViewModel)
}

@Composable
fun DrMintyChatBubble(message: ChatMessage) {
    // Legacy fallback wrapper
    DrMintyMessageItem(message = message, isDarkMode = false, onSuggestionClick = {})
}
