package com.toothmate.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.statusBarsPadding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.Send
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.toothmate.app.data.local.AppDatabase
import com.toothmate.app.data.local.UserPreferences
import com.toothmate.app.data.model.ChatMessage
import com.toothmate.app.data.network.RetrofitClient
import com.toothmate.app.data.repository.ChatRepository
import com.toothmate.app.ui.components.BottomNavigationBar
import com.toothmate.app.viewmodel.ChatViewModel

@Composable
fun DrMintyChatScreen(
    navController: NavController? = null,
    chatViewModel: ChatViewModel? = null,
    isDarkTheme: Boolean? = null
) {
    val context = LocalContext.current
    val prefs = remember { UserPreferences(context) }
    val vm = chatViewModel ?: remember {
        val chatRepo = ChatRepository(RetrofitClient.apiService)
        ChatViewModel(chatRepo, prefs)
    }

    var inputText by remember { mutableStateOf("") }
    val messages by vm.messages.collectAsState()
    val isLoading by vm.isLoading.collectAsState()
    val vmDarkMode by vm.isDarkMode.collectAsState()
    val isDarkMode = isDarkTheme ?: vmDarkMode
    val listState = rememberLazyListState()

    val screenBg = if (isDarkMode) Color(0xFF0F172A) else Color(0xFFF0FDFA)
    val headerBadgeStart = Color(0xFF0D9488)
    val headerBadgeEnd = Color(0xFF10B981)

    LaunchedEffect(Unit) {
        vm.refreshWelcomeMessage()
    }

    LaunchedEffect(messages.size, isLoading) {
        if (messages.isNotEmpty()) {
            listState.animateScrollToItem(messages.size - 1)
        }
    }

    Scaffold(
        topBar = {
            // Header: Gradient Badge (#0D9488 to #10B981) showing "Dr. Minty AI Assistant ⚡ 100% Local ML"
            Surface(
                modifier = Modifier
                    .fillMaxWidth()
                    .statusBarsPadding(),
                color = Color.Transparent,
                shadowElevation = 6.dp
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(
                            Brush.horizontalGradient(
                                colors = listOf(headerBadgeStart, headerBadgeEnd)
                            )
                        )
                        .padding(horizontal = 16.dp, vertical = 14.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Avatar Badge
                        Box(
                            modifier = Modifier
                                .size(44.dp)
                                .clip(CircleShape)
                                .background(Color.White.copy(alpha = 0.25f)),
                            contentAlignment = Alignment.Center
                        ) {
                            Text("🤖", fontSize = 22.sp)
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(
                                    text = "Dr. Minty AI Assistant",
                                    fontSize = 17.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color.White
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Box(
                                    modifier = Modifier
                                        .background(Color.White.copy(alpha = 0.2f), RoundedCornerShape(8.dp))
                                        .padding(horizontal = 6.dp, vertical = 2.dp)
                                ) {
                                    Text(
                                        text = "⚡ 100% Local ML",
                                        fontSize = 10.sp,
                                        fontWeight = FontWeight.Black,
                                        color = Color.White
                                    )
                                }
                            }

                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .background(Color(0xFF4ADE80), CircleShape)
                                )
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = "Online • Clinical Oral Health Guide",
                                    fontSize = 11.sp,
                                    color = Color(0xFFE6FFFA),
                                    fontWeight = FontWeight.SemiBold
                                )
                            }
                        }
                    }
                }
            }
        },
        bottomBar = {
            if (navController != null) {
                BottomNavigationBar(navController = navController, isDarkTheme = isDarkMode)
            }
        },
        containerColor = screenBg
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(screenBg)
                .padding(innerPadding)
                .padding(horizontal = 14.dp, vertical = 8.dp)
        ) {
            LazyColumn(
                state = listState,
                modifier = Modifier
                    .weight(1f)
                    .fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(12.dp),
                contentPadding = PaddingValues(bottom = 12.dp)
            ) {
                items(messages) { msg ->
                    DrMintyMessageItem(
                        message = msg,
                        isDarkMode = isDarkMode,
                        onSuggestionClick = { selected ->
                            vm.sendMessage(selected)
                        }
                    )
                }

                if (isLoading) {
                    item {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(start = 8.dp, top = 4.dp, bottom = 4.dp)
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(16.dp),
                                color = Color(0xFF0D9488),
                                strokeWidth = 2.dp
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Dr. Minty is analyzing...",
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isDarkMode) Color(0xFF94A3B8) else Color(0xFF0F766E)
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            // Rounded Floating Input Bar
            Surface(
                shape = RoundedCornerShape(28.dp),
                color = if (isDarkMode) Color(0xFF1E293B) else Color.White,
                shadowElevation = 8.dp,
                modifier = Modifier
                    .fillMaxWidth()
                    .border(
                        width = 1.dp,
                        color = if (isDarkMode) Color(0xFF334155) else Color(0xFFCCFBF1),
                        shape = RoundedCornerShape(28.dp)
                    )
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = inputText,
                        onValueChange = { inputText = it },
                        placeholder = {
                            Text(
                                "Ask Dr. Minty about tooth pain, gums...",
                                fontSize = 12.5.sp,
                                color = if (isDarkMode) Color(0xFF94A3B8) else Color(0xFF64748B)
                            )
                        },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(24.dp),
                        colors = OutlinedTextFieldDefaults.colors(
                            unfocusedContainerColor = Color.Transparent,
                            focusedContainerColor = Color.Transparent,
                            unfocusedBorderColor = Color.Transparent,
                            focusedBorderColor = Color.Transparent,
                            focusedTextColor = if (isDarkMode) Color.White else Color(0xFF0F172A),
                            unfocusedTextColor = if (isDarkMode) Color.White else Color(0xFF0F172A)
                        ),
                        singleLine = true
                    )

                    Spacer(modifier = Modifier.width(6.dp))

                    Box(
                        modifier = Modifier
                            .size(44.dp)
                            .clip(CircleShape)
                            .background(
                                Brush.linearGradient(
                                    colors = listOf(Color(0xFF0D9488), Color(0xFF10B981))
                                )
                            )
                            .clickable {
                                if (inputText.isNotBlank() && !isLoading) {
                                    val textToSend = inputText
                                    inputText = ""
                                    vm.sendMessage(textToSend)
                                }
                            },
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.AutoMirrored.Filled.Send,
                            contentDescription = "Send Message",
                            tint = Color.White,
                            modifier = Modifier.size(18.dp)
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun DrMintyMessageItem(
    message: ChatMessage,
    isDarkMode: Boolean,
    onSuggestionClick: (String) -> Unit
) {
    val isUser = message.isUser

    Column(
        modifier = Modifier.fillMaxWidth(),
        horizontalAlignment = if (isUser) Alignment.End else Alignment.Start
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = if (isUser) Arrangement.End else Arrangement.Start
        ) {
            Surface(
                shape = if (isUser) {
                    RoundedCornerShape(20.dp, 20.dp, 4.dp, 20.dp)
                } else {
                    RoundedCornerShape(20.dp, 20.dp, 20.dp, 4.dp)
                },
                color = if (isUser) {
                    Color(0xFF0D9488) // Teal #0D9488 for user bubble
                } else {
                    if (isDarkMode) Color(0xFF1E293B) else Color.White // Theme-aware card for bot bubble
                },
                shadowElevation = 3.dp,
                modifier = Modifier
                    .widthIn(max = 300.dp)
                    .border(
                        width = if (!isUser) 1.dp else 0.dp,
                        color = if (!isUser) {
                            if (isDarkMode) Color(0xFF334155) else Color(0xFF99F6E4)
                        } else Color.Transparent,
                        shape = if (isUser) {
                            RoundedCornerShape(20.dp, 20.dp, 4.dp, 20.dp)
                        } else {
                            RoundedCornerShape(20.dp, 20.dp, 20.dp, 4.dp)
                        }
                    )
            ) {
                Column(modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp)) {
                    // Bot Header Label
                    if (!isUser) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(bottom = 4.dp)
                        ) {
                            Icon(
                                Icons.Default.AutoAwesome,
                                contentDescription = null,
                                tint = Color(0xFF0D9488),
                                modifier = Modifier.size(13.dp)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "Dr. Minty AI",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF0D9488)
                            )
                        }
                    }

                    // Message Text Content
                    Text(
                        text = message.text,
                        color = if (isUser) Color.White else if (isDarkMode) Color(0xFFF1F5F9) else Color(0xFF0F172A),
                        fontSize = 14.sp,
                        lineHeight = 20.sp,
                        fontWeight = FontWeight.Medium
                    )

                    if (message.timestamp.isNotBlank()) {
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = message.timestamp,
                            color = if (isUser) Color(0xFFCCFBF1) else Color(0xFF94A3B8),
                            fontSize = 10.sp,
                            fontWeight = FontWeight.Bold,
                            modifier = Modifier.align(Alignment.End)
                        )
                    }
                }
            }
        }

        // Clickable Suggestion Chips beneath Bot Responses
        if (!isUser && message.suggestions.isNotEmpty()) {
            Spacer(modifier = Modifier.height(6.dp))
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                contentPadding = PaddingValues(horizontal = 2.dp)
            ) {
                items(message.suggestions) { suggestion ->
                    Surface(
                        onClick = { onSuggestionClick(suggestion) },
                        shape = RoundedCornerShape(16.dp),
                        color = if (isDarkMode) Color(0xFF0F766E).copy(alpha = 0.3f) else Color(0xFFCCFBF1),
                        modifier = Modifier.border(
                            width = 1.dp,
                            color = if (isDarkMode) Color(0xFF14B8A6) else Color(0xFF5EEAD4),
                            shape = RoundedCornerShape(16.dp)
                        )
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        ) {
                            Text(
                                text = "💡 $suggestion",
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (isDarkMode) Color(0xFF5EEAD4) else Color(0xFF0F766E)
                            )
                        }
                    }
                }
            }
        }
    }
}
