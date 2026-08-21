package com.toothmate.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.toothmate.app.ui.components.ToothMateTopBar
import com.toothmate.app.ui.theme.TealLight
import com.toothmate.app.ui.theme.TealPrimary

data class LanguageOption(val code: String, val name: String, val nativeName: String, val flag: String)

@Composable
fun LanguageScreen(navController: NavController) {
    val languages = listOf(
        LanguageOption("en", "English", "English", "🇬🇧"),
        LanguageOption("hi", "Hindi", "हिंदी", "🇮🇳"),
        LanguageOption("te", "Telugu", "తెలుగు", "🇮🇳"),
        LanguageOption("ta", "Tamil", "தமிழ்", "🇮🇳"),
        LanguageOption("mr", "Marathi", "मराठी", "🇮🇳"),
        LanguageOption("kn", "Kannada", "கನ್ನಡ", "🇮🇳"),
        LanguageOption("ml", "Malayalam", "മലയാളം", "🇮🇳"),
        LanguageOption("bn", "Bengali", "বাংলা", "🇮🇳")
    )

    var selectedLang by remember { mutableStateOf("en") }

    Scaffold(
        topBar = {
            ToothMateTopBar(
                title = "Language Selection 🌐",
                canNavigateBack = true,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(TealLight)
                .padding(innerPadding)
                .padding(20.dp)
        ) {
            Text(text = "Choose App Language", fontSize = 22.sp, fontWeight = FontWeight.Bold, color = TealPrimary)
            Text(text = "Select your preferred language for the interface and questions.", fontSize = 14.sp, color = Color.Gray)

            Spacer(modifier = Modifier.height(16.dp))

            LazyColumn(
                modifier = Modifier.weight(1f),
                verticalArrangement = androidx.compose.foundation.layout.Arrangement.spacedBy(10.dp)
            ) {
                items(languages) { lang ->
                    val isSelected = selectedLang == lang.code
                    Card(
                        onClick = { selectedLang = lang.code },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isSelected) TealPrimary else Color.White
                        ),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(text = lang.flag, fontSize = 28.sp)
                            Spacer(modifier = Modifier.padding(horizontal = 8.dp))
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = lang.name,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = if (isSelected) Color.White else Color.DarkGray
                                )
                                Text(
                                    text = lang.nativeName,
                                    fontSize = 13.sp,
                                    color = if (isSelected) Color.White.copy(alpha = 0.8f) else Color.Gray
                                )
                            }
                            if (isSelected) {
                                Text(text = "✓", fontSize = 20.sp, color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            Button(
                onClick = { navController.popBackStack() },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
            ) {
                Text(text = "Apply Language Settings", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
