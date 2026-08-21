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
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ArrowForward
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.AutoAwesome
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.toothmate.app.ui.components.ToothMateTopBar
import com.toothmate.app.ui.navigation.Screen
import com.toothmate.app.ui.theme.TealLight
import com.toothmate.app.ui.theme.TealPrimary
import com.toothmate.app.viewmodel.AssessmentViewModel
import kotlinx.coroutines.launch

data class QuestionData(
    val id: Int,
    val question: String,
    val subtitle: String,
    val optionTrue: String,
    val optionFalse: String,
    val conditionKey: String
)

val assessmentQuestionsList = listOf(
    QuestionData(
        id = 1,
        question = "Do you wear braces, archwires, or clear aligners on your teeth?",
        subtitle = "Orthodontic hardware requires specialized clearance techniques under bracket wings.",
        optionTrue = "Yes, I wear braces / archwires",
        optionFalse = "No, no orthodontic hardware",
        conditionKey = "hasBraces"
    ),
    QuestionData(
        id = 2,
        question = "Do your gums bleed, turn red, or feel tender during brushing or flossing?",
        subtitle = "Gum bleeding indicates active gingival inflammation and sulcular plaque buildup.",
        optionTrue = "Yes, gums bleed or feel tender",
        optionFalse = "No, gums feel healthy and firm",
        conditionKey = "bleedingGums"
    ),
    QuestionData(
        id = 3,
        question = "Have you noticed your gums shrinking back or exposing tooth roots?",
        subtitle = "Gumline recession exposes sensitive dentin vulnerable to brush abrasion.",
        optionTrue = "Yes, noticeable gum recession",
        optionFalse = "No, gumline looks stable",
        conditionKey = "recededGums"
    ),
    QuestionData(
        id = 4,
        question = "Do you have active dental implants, fixed bridges, or dental crowns?",
        subtitle = "Dental restorations require dedicated margin clearance to prevent peri-implantitis.",
        optionTrue = "Yes, I have implants, bridges, or crowns",
        optionFalse = "No dental restorations",
        conditionKey = "hasImplants"
    ),
    QuestionData(
        id = 5,
        question = "Do you experience sharp sensitivity or pain with hot or cold drinks/foods?",
        subtitle = "Tooth sensitivity is caused by open dentinal tubules or micro-enamel loss.",
        optionTrue = "Yes, sensitive to hot or cold",
        optionFalse = "No tooth sensitivity",
        conditionKey = "sensitivity"
    ),
    QuestionData(
        id = 6,
        question = "Do you scrub back-and-forth vigorously with firm or medium bristles?",
        subtitle = "Aggressive horizontal scrubbing damages enamel and causes irreversible gum recession.",
        optionTrue = "Yes, I scrub firmly / use medium bristles",
        optionFalse = "No, I brush gently with soft bristles",
        conditionKey = "aggressiveBrusher"
    ),
    QuestionData(
        id = 7,
        question = "Do you consume alcohol, acidic beverages, or use tobacco products regularly?",
        subtitle = "Alcohol and acidic items alter oral pH balance and accelerate plaque biofilm growth.",
        optionTrue = "Yes, regularly or occasionally",
        optionFalse = "No, rarely or never",
        conditionKey = "lifestyleRisk"
    ),
    QuestionData(
        id = 8,
        question = "How many times do you brush your teeth daily?",
        subtitle = "Brushing twice daily for 2 full minutes removes 99% of soft plaque.",
        optionTrue = "Twice or more daily",
        optionFalse = "Once or less daily",
        conditionKey = "preventative"
    ),
    QuestionData(
        id = 9,
        question = "Do you find food particles wedged frequently between your teeth or dental work?",
        subtitle = "Interdental food traps cause localized interproximal cavities and bad breath.",
        optionTrue = "Yes, food traps frequently",
        optionFalse = "No, clears easily",
        conditionKey = "foodTrap"
    ),
    QuestionData(
        id = 10,
        question = "Do you or your child have difficulty gripping or maneuvering a toothbrush handle?",
        subtitle = "Restricted manual dexterity benefits from simplified circular brushing techniques.",
        optionTrue = "Yes, grip or maneuvering is difficult",
        optionFalse = "No problem maneuvering toothbrush",
        conditionKey = "manualDexterity"
    )
)

@Composable
fun AssessmentScreen(navController: NavController, assessmentViewModel: AssessmentViewModel) {
    val coroutineScope = rememberCoroutineScope()
    var currentQuestionIndex by remember { mutableIntStateOf(0) }
    val selectedAnswers = remember { mutableStateMapOf<Int, Boolean>() }

    val totalQuestions = assessmentQuestionsList.size
    val currentQ = assessmentQuestionsList[currentQuestionIndex]
    val progress = (currentQuestionIndex + 1).toFloat() / totalQuestions.toFloat()

    Scaffold(
        topBar = {
            ToothMateTopBar(
                title = "Oral Health Assessment",
                canNavigateBack = currentQuestionIndex > 0,
                onNavigateBack = {
                    if (currentQuestionIndex > 0) currentQuestionIndex--
                }
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
            // Header Progress Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Question ${currentQuestionIndex + 1} of $totalQuestions",
                            fontWeight = FontWeight.Bold,
                            fontSize = 14.sp,
                            color = TealPrimary
                        )
                        Text(
                            text = "${(progress * 100).toInt()}% Completed",
                            fontWeight = FontWeight.ExtraBold,
                            fontSize = 13.sp,
                            color = Color(0xFF0284C7)
                        )
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    LinearProgressIndicator(
                        progress = { progress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(RoundedCornerShape(4.dp)),
                        color = TealPrimary,
                        trackColor = Color(0xFFE2E8F0)
                    )
                }
            }

            Spacer(modifier = Modifier.height(18.dp))

            // Question Card
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 6.dp)
            ) {
                Column(modifier = Modifier.padding(22.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .background(Color(0xFFE0F2FE), CircleShape),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "Q${currentQ.id}",
                                fontWeight = FontWeight.Black,
                                fontSize = 14.sp,
                                color = TealPrimary
                            )
                        }
                        Spacer(modifier = Modifier.width(10.dp))
                        Text(
                            text = "Clinical Diagnostic Question",
                            fontSize = 12.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF64748B)
                        )
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    Text(
                        text = currentQ.question,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color(0xFF0F172A),
                        lineHeight = 24.sp
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    Text(
                        text = currentQ.subtitle,
                        fontSize = 13.sp,
                        color = Color(0xFF64748B),
                        lineHeight = 18.sp
                    )

                    Spacer(modifier = Modifier.height(24.dp))

                    // Option Buttons
                    val selectedValue = selectedAnswers[currentQuestionIndex]

                    // Option True Button Card
                    val isTrueSelected = selectedValue == true
                    Card(
                        onClick = { selectedAnswers[currentQuestionIndex] = true },
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(
                                width = if (isTrueSelected) 2.dp else 1.dp,
                                color = if (isTrueSelected) TealPrimary else Color(0xFFE2E8F0),
                                shape = RoundedCornerShape(16.dp)
                            ),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isTrueSelected) Color(0xFFF0FDF4) else Color(0xFFF8FAFC)
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = currentQ.optionTrue,
                                modifier = Modifier.weight(1f),
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = if (isTrueSelected) TealPrimary else Color(0xFF1E293B)
                            )
                            if (isTrueSelected) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = "Selected",
                                    tint = TealPrimary,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Option False Button Card
                    val isFalseSelected = selectedValue == false
                    Card(
                        onClick = { selectedAnswers[currentQuestionIndex] = false },
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(
                                width = if (isFalseSelected) 2.dp else 1.dp,
                                color = if (isFalseSelected) TealPrimary else Color(0xFFE2E8F0),
                                shape = RoundedCornerShape(16.dp)
                            ),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isFalseSelected) Color(0xFFF0FDF4) else Color(0xFFF8FAFC)
                        )
                    ) {
                        Row(
                            modifier = Modifier.padding(16.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = currentQ.optionFalse,
                                modifier = Modifier.weight(1f),
                                fontWeight = FontWeight.Bold,
                                fontSize = 14.sp,
                                color = if (isFalseSelected) TealPrimary else Color(0xFF1E293B)
                            )
                            if (isFalseSelected) {
                                Icon(
                                    Icons.Default.CheckCircle,
                                    contentDescription = "Selected",
                                    tint = TealPrimary,
                                    modifier = Modifier.size(22.dp)
                                )
                            }
                        }
                    }
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Bottom Navigation Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                if (currentQuestionIndex > 0) {
                    OutlinedButton(
                        onClick = { currentQuestionIndex-- },
                        modifier = Modifier
                            .weight(1f)
                            .height(52.dp),
                        shape = RoundedCornerShape(16.dp)
                    ) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", modifier = Modifier.size(18.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(text = "Previous", fontWeight = FontWeight.Bold)
                    }
                }

                val hasAnsweredCurrent = selectedAnswers.containsKey(currentQuestionIndex)

                Button(
                    onClick = {
                        if (currentQuestionIndex < totalQuestions - 1) {
                            currentQuestionIndex++
                        } else {
                            // Last Question -> Submit & Calculate Matched Clinical Technique
                            coroutineScope.launch {
                                val painVal = if (selectedAnswers[1] == true) 6 else 0
                                val bleedingVal = selectedAnswers[1] == true
                                val cavityVal = selectedAnswers[2] == true
                                val nightFeedVal = selectedAnswers[6] == true
                                val sugarVal = if (selectedAnswers[6] == true) 3 else 1
                                val brushVal = if (selectedAnswers[7] == true) 2 else 1

                                assessmentViewModel.submitAssessment(
                                    painLevel = painVal,
                                    bleedingGums = bleedingVal,
                                    cavityVisible = cavityVal,
                                    nightFeeding = nightFeedVal,
                                    sugarFrequency = sugarVal,
                                    brushingFrequency = brushVal
                                )

                                navController.navigate(Screen.Prescription.route)
                            }
                        }
                    },
                    enabled = hasAnsweredCurrent,
                    modifier = Modifier
                        .weight(2f)
                        .height(52.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = TealPrimary)
                ) {
                    Text(
                        text = if (currentQuestionIndex < totalQuestions - 1) "Next Question" else "View Matched Prescription 🎉",
                        fontWeight = FontWeight.Bold,
                        fontSize = 15.sp
                    )
                    Spacer(modifier = Modifier.width(6.dp))
                    Icon(
                        imageVector = if (currentQuestionIndex < totalQuestions - 1) Icons.Default.ArrowForward else Icons.Default.AutoAwesome,
                        contentDescription = "Next",
                        modifier = Modifier.size(18.dp)
                    )
                }
            }
        }
    }
}
