package com.toothmate.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.toothmate.app.data.model.CariesRiskLevel
import com.toothmate.app.ui.components.RiskBadge
import com.toothmate.app.ui.components.ToothMateTopBar
import com.toothmate.app.ui.navigation.Screen
import com.toothmate.app.ui.theme.TealLight
import com.toothmate.app.ui.theme.TealPrimary
import com.toothmate.app.viewmodel.AssessmentViewModel

@Composable
fun SuccessScreen(navController: NavController, assessmentViewModel: AssessmentViewModel) {
    val assessment by assessmentViewModel.currentAssessment.collectAsState()

    Scaffold(
        topBar = { ToothMateTopBar(title = "Assessment Results") }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(TealLight)
                .padding(innerPadding)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Text(text = "🎉", fontSize = 64.sp)
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Assessment Complete!",
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold,
                color = TealPrimary
            )
            Text(
                text = "Caries risk computed based on clinical indicators",
                fontSize = 14.sp,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(24.dp))

            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
            ) {
                Column(
                    modifier = Modifier.padding(24.dp),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(text = "Computed Caries Risk Level", fontSize = 14.sp, color = Color.Gray)
                    Spacer(modifier = Modifier.height(8.dp))

                    val risk = assessment?.riskLevel ?: CariesRiskLevel.LOW
                    RiskBadge(riskLevel = risk)

                    Spacer(modifier = Modifier.height(16.dp))

                    Text(
                        text = "Risk Score: ${assessment?.cariesRiskScore ?: 0} / 100",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    val summaryText = when (risk) {
                        CariesRiskLevel.HIGH -> "High risk of dental decay. Immediate pediatric dentist consultation and preventive treatment required."
                        CariesRiskLevel.MODERATE -> "Moderate risk detected. Fluoride application and diet modifications recommended."
                        CariesRiskLevel.LOW -> "Low risk. Maintain routine brushing twice daily and 6-month checkups."
                    }
                    Text(
                        text = summaryText,
                        fontSize = 14.sp,
                        color = Color.DarkGray
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            Button(
                onClick = { navController.navigate(Screen.Prescription.route) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
            ) {
                Text("View Generated Prescription 📋", fontSize = 16.sp, fontWeight = FontWeight.Bold)
            }

            Spacer(modifier = Modifier.height(12.dp))

            OutlinedButton(
                onClick = {
                    navController.navigate(Screen.Dashboard.route) {
                        popUpTo(Screen.Dashboard.route) { inclusive = true }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Go to Dashboard 🏠", fontSize = 16.sp, color = TealPrimary)
            }
        }
    }
}
