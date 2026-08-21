package com.toothmate.app.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.toothmate.app.ui.navigation.Screen
import com.toothmate.app.viewmodel.AuthViewModel

private data class AgeGroupOption(
    val key: String,
    val title: String,
    val subtitle: String
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DemographicsScreen(navController: NavController, authViewModel: AuthViewModel) {
    var nameInput by remember { mutableStateOf("") }
    var selectedAgeGroup by remember { mutableStateOf("adult") } // "child", "teen", "adult", "senior"
    var selectedGender by remember { mutableStateOf("male") } // "male", "female", "other"

    val ageGroupOptions = listOf(
        AgeGroupOption("child", "Under 12 Years", "Pediatric & Fun Habits"),
        AgeGroupOption("teen", "13 - 17 Years", "Adolescent & Braces Care"),
        AgeGroupOption("adult", "18 - 59 Years", "Adult Plaque & Gum Care"),
        AgeGroupOption("senior", "60+ Years", "Senior & Sensitive Care")
    )

    Scaffold(
        modifier = Modifier.statusBarsPadding(),
        containerColor = Color(0xFF020617)
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF020617))
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 20.dp, vertical = 16.dp),
            verticalArrangement = Arrangement.spacedBy(20.dp)
        ) {
            // 1. STEP INDICATOR & CLEAN HEADER
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                // Step 1 of 3 Progress bar
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(Color(0xFF10B981))
                    )
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(Color(0xFF1E293B))
                    )
                    Box(
                        modifier = Modifier
                            .weight(1f)
                            .height(6.dp)
                            .clip(RoundedCornerShape(3.dp))
                            .background(Color(0xFF1E293B))
                    )
                }

                Text(
                    text = "STEP 1 OF 3 • PROFILE SETUP",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Black,
                    color = Color(0xFF10B981)
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "Create Your Profile",
                    fontSize = 26.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = Color.White
                )

                Text(
                    text = "Personalize your dental care experience",
                    fontSize = 14.sp,
                    color = Color(0xFF94A3B8)
                )
            }

            // 2. MAIN CONTAINER CARD
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
                border = BorderStroke(1.dp, Color(0xFF1E293B))
            ) {
                Column(
                    modifier = Modifier.padding(20.dp),
                    verticalArrangement = Arrangement.spacedBy(20.dp)
                ) {
                    // MODERN FLOATING INPUT FIELD (FULL NAME)
                    Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                        Text(
                            text = "Full Name",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFE2E8F0)
                        )

                        OutlinedTextField(
                            value = nameInput,
                            onValueChange = { nameInput = it },
                            placeholder = { Text("e.g. Mahi", color = Color(0xFF64748B)) },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "User Icon",
                                    tint = Color(0xFF10B981)
                                )
                            },
                            singleLine = true,
                            shape = RoundedCornerShape(16.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedContainerColor = Color(0xFF1E293B),
                                unfocusedContainerColor = Color(0xFF1E293B),
                                focusedBorderColor = Color(0xFF10B981),
                                unfocusedBorderColor = Color(0xFF334155),
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White
                            ),
                            modifier = Modifier.fillMaxWidth()
                        )
                    }

                    // INTERACTIVE AGE GROUP SELECTOR CARDS
                    Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                        Text(
                            text = "Age Group",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFE2E8F0)
                        )

                        ageGroupOptions.forEach { option ->
                            val isSelected = selectedAgeGroup == option.key

                            Card(
                                onClick = { selectedAgeGroup = option.key },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(
                                    containerColor = if (isSelected) Color(0xFF0F766E) else Color(0xFF1E293B)
                                ),
                                border = BorderStroke(
                                    width = if (isSelected) 1.5.dp else 1.dp,
                                    color = if (isSelected) Color(0xFF34D399) else Color(0xFF334155)
                                )
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(horizontal = 16.dp, vertical = 14.dp),
                                    horizontalArrangement = Arrangement.SpaceBetween,
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(verticalArrangement = Arrangement.spacedBy(2.dp)) {
                                        Text(
                                            text = option.title,
                                            fontSize = 14.sp,
                                            fontWeight = if (isSelected) FontWeight.ExtraBold else FontWeight.Bold,
                                            color = Color.White
                                        )
                                        Text(
                                            text = option.subtitle,
                                            fontSize = 11.sp,
                                            color = if (isSelected) Color(0xFF99F6E4) else Color(0xFF94A3B8)
                                        )
                                    }

                                    if (isSelected) {
                                        Icon(
                                            imageVector = Icons.Default.CheckCircle,
                                            contentDescription = "Selected",
                                            tint = Color(0xFF34D399),
                                            modifier = Modifier.size(20.dp)
                                        )
                                    }
                                }
                            }
                        }
                    }

                    // SEGMENTED GENDER SELECTOR
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Text(
                            text = "Gender",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFE2E8F0)
                        )

                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(14.dp))
                                .background(Color(0xFF1E293B))
                                .padding(4.dp)
                        ) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                listOf(
                                    "male" to "Male",
                                    "female" to "Female",
                                    "other" to "Other"
                                ).forEach { (gKey, gLabel) ->
                                    val isGenderSelected = selectedGender == gKey

                                    Box(
                                        modifier = Modifier
                                            .weight(1f)
                                            .height(42.dp)
                                            .clip(RoundedCornerShape(10.dp))
                                            .background(
                                                if (isGenderSelected) Color(0xFF10B981) else Color.Transparent
                                            )
                                            .clickable { selectedGender = gKey },
                                        contentAlignment = Alignment.Center
                                    ) {
                                        Text(
                                            text = gLabel,
                                            color = if (isGenderSelected) Color(0xFF020617) else Color(0xFF94A3B8),
                                            fontWeight = if (isGenderSelected) FontWeight.ExtraBold else FontWeight.Bold,
                                            fontSize = 13.sp
                                        )
                                    }
                                }
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(6.dp))

                    // PROMINENT "CONTINUE" ACTION BUTTON
                    Button(
                        onClick = {
                            val finalName = if (nameInput.isBlank()) "ToothMate User" else nameInput.trim()
                            val calculatedAge = when (selectedAgeGroup) {
                                "child" -> 8
                                "teen" -> 15
                                "senior" -> 65
                                else -> 30
                            }
                            authViewModel.saveDemographics(finalName, selectedAgeGroup, selectedGender, calculatedAge)
                            navController.navigate(Screen.Assessment.route)
                        },
                        shape = RoundedCornerShape(18.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                        contentPadding = PaddingValues(0.dp),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(56.dp)
                            .background(
                                brush = Brush.horizontalGradient(
                                    colors = listOf(Color(0xFF10B981), Color(0xFF059669))
                                ),
                                shape = RoundedCornerShape(18.dp)
                            )
                    ) {
                        Text(
                            text = "Continue to Dental Assessment →",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                    }
                }
            }
        }
    }
}
