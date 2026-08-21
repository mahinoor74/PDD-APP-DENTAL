package com.toothmate.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.toothmate.app.ui.components.RiskBadge
import com.toothmate.app.ui.components.ToothMateTopBar
import com.toothmate.app.ui.navigation.Screen
import com.toothmate.app.ui.theme.TealLight
import com.toothmate.app.ui.theme.TealPrimary
import com.toothmate.app.viewmodel.AssessmentViewModel

@Composable
fun PrescriptionScreen(navController: NavController, assessmentViewModel: AssessmentViewModel) {
    val prescription by assessmentViewModel.currentPrescription.collectAsState()
    val assessment by assessmentViewModel.currentAssessment.collectAsState()

    // Match exact clinical technique based on diagnostic assessment
    val hasBleeding = assessment?.bleedingGums == true
    val isHighRisk = assessment?.painLevel ?: 0 > 4

    val techniqueName = when {
        hasBleeding -> "Modified Bass Technique"
        isHighRisk -> "Orthodontic Charters Technique"
        else -> "Modified Bass Technique"
    }

    val techniqueDescription = when (techniqueName) {
        "Orthodontic Charters Technique" -> "Formulated explicitly by Dr. W.J. Charters for orthodontic patients. Directs bristles at a 45° angle toward chewing surfaces to sweep underneath bracket wings and archwires."
        "Modified Stillman Technique" -> "Specially designed for patients with gum recession or tooth sensitivity. Uses gentle vibratory pulses and sweeps away from the gumline without causing root abrasion."
        "Fones (Circular) Technique" -> "A simple, highly effective circular scrubbing technique recommended for children and individuals building manual motor skills."
        else -> "The gold-standard periodontist method for deep sulcular cleaning. Targets bacterial plaque trapped inside the gingival pocket where gums meet teeth."
    }

    val steps = listOf(
        "Angle brush bristles at 45 degrees directly toward the line where your gums meet your teeth.",
        "Gently press so bristle tips enter the top of the gum pocket without discomfort.",
        "Execute 10 short, gentle vibratory back-and-forth shakes on the spot.",
        "Roll the brush head firmly away from the gums to sweep dislodged plaque out."
    )

    Scaffold(
        topBar = {
            ToothMateTopBar(
                title = "Clinical Prescription & Technique",
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
                .verticalScroll(rememberScrollState())
        ) {
            // Technique Hero Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = TealPrimary),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .background(Color.White.copy(alpha = 0.2f), RoundedCornerShape(12.dp))
                                .padding(horizontal = 10.dp, vertical = 4.dp)
                        ) {
                            Text(
                                text = "MATCHED CLINICAL TECHNIQUE",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                color = Color.White
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = techniqueName,
                        fontSize = 24.sp,
                        fontWeight = FontWeight.Black,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = "✨ Customized care strategy generated for your oral health profile.",
                        fontSize = 13.sp,
                        color = Color(0xFFE0F2FE)
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // What Technique Is & Why Suggested Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "📖 What is the $techniqueName?",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = TealPrimary
                    )

                    Spacer(modifier = Modifier.height(6.dp))

                    Text(
                        text = techniqueDescription,
                        fontSize = 14.sp,
                        color = Color(0xFF334155),
                        lineHeight = 20.sp
                    )

                    HorizontalDivider(modifier = Modifier.padding(vertical = 14.dp))

                    Text(
                        text = "🎯 How to Take Care of Your Teeth",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = TealPrimary
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFF0FDF4), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Text(text = "🪥 ", fontSize = 16.sp)
                        Column {
                            Text(text = "Prescribed Toothbrush", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF166534))
                            Text(text = "Ultra-Soft 0.01mm Micro-Tapered Bristle Brush head", fontSize = 12.sp, color = Color(0xFF15803D))
                        }
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .background(Color(0xFFF0F9FF), RoundedCornerShape(12.dp))
                            .padding(12.dp)
                    ) {
                        Text(text = "🧪 ", fontSize = 16.sp)
                        Column {
                            Text(text = "Prescribed Toothpaste Formulation", fontWeight = FontWeight.Bold, fontSize = 13.sp, color = Color(0xFF075985))
                            Text(text = "1450 ppm Sodium Fluoride Anti-Cavity Enamel Shield paste", fontSize = 12.sp, color = Color(0xFF0369A1))
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Step-by-Step Brushing Instructions Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
            ) {
                Column(modifier = Modifier.padding(18.dp)) {
                    Text(
                        text = "📋 Prescribed Step-by-Step Brushing Guide",
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = TealPrimary
                    )

                    Spacer(modifier = Modifier.height(12.dp))

                    steps.forEachIndexed { idx, stepText ->
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(vertical = 6.dp)
                                .background(Color(0xFFF8FAFC), RoundedCornerShape(14.dp))
                                .padding(12.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(28.dp)
                                    .background(TealPrimary, CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = "${idx + 1}",
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White,
                                    fontSize = 13.sp
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Text(
                                text = stepText,
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFF1E293B),
                                lineHeight = 18.sp
                            )
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Precautions Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB)),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Icon(
                            Icons.Default.Info,
                            contentDescription = "Precaution",
                            tint = Color(0xFFB45309),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = "Safety Precautions & Tips",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = Color(0xFF92400E)
                        )
                    }

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = "• Avoid pressing bristles too deeply with heavy hand force.\n• Maintain a 45-degree angle without scrubbing flat.\n• Replace toothbrush every 3 months or after recovering from flu.",
                        fontSize = 12.sp,
                        color = Color(0xFF78350F),
                        lineHeight = 18.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Action Buttons
            Button(
                onClick = { navController.navigate(Screen.SmartMirror.route) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(16.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
            ) {
                Text(text = "Start Guided Smart Mirror Session", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                Spacer(modifier = Modifier.width(6.dp))
                Icon(Icons.Default.ArrowForward, contentDescription = "Start", modifier = Modifier.size(18.dp))
            }

            Spacer(modifier = Modifier.height(10.dp))

            OutlinedButton(
                onClick = { navController.navigate(Screen.Dashboard.route) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text(text = "Return to Dashboard", fontWeight = FontWeight.Bold)
            }
        }
    }
}
