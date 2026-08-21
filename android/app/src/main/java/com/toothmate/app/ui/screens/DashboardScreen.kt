package com.toothmate.app.ui.screens

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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.ChatBubbleOutline
import androidx.compose.material.icons.filled.EmojiEvents
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Whatshot
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.NavController
import com.toothmate.app.ui.components.BottomNavigationBar
import com.toothmate.app.ui.navigation.Screen
import com.toothmate.app.ui.theme.TealLight
import com.toothmate.app.ui.theme.TealPrimary
import com.toothmate.app.viewmodel.DashboardViewModel
import com.toothmate.app.data.model.BrushingSession
import com.toothmate.app.data.model.WeekDayData
import com.toothmate.app.data.model.getCurrentWeekData
import java.time.LocalDate
import java.time.format.DateTimeFormatter

val DAILY_TIPS = listOf(
    "Brush for 2 full minutes twice a day to remove soft plaque!",
    "Flossing once daily reaches tooth surfaces a brush can't reach!",
    "Replace your toothbrush every 3 months or when bristles flare.",
    "Wait 30 minutes after eating before brushing — acids weaken enamel!",
    "Position bristles at 45° to the gumline for optimal plaque removal.",
    "Brush your tongue from back to front to eliminate bad breath bacteria!"
)

@Composable
fun DashboardScreen(navController: NavController, dashboardViewModel: DashboardViewModel) {
    val childName by dashboardViewModel.childName.collectAsState()
    val streakCount by dashboardViewModel.streakCount.collectAsState()
    val todayCompletedCount by dashboardViewModel.todayCompletedCount.collectAsState()
    val totalCleanSessions by dashboardViewModel.totalCleanSessions.collectAsState()

    val morningAlarmTime by dashboardViewModel.morningAlarmTime.collectAsState()
    val nightAlarmTime by dashboardViewModel.nightAlarmTime.collectAsState()
    val isMorningAlarmEnabled by dashboardViewModel.isMorningAlarmEnabled.collectAsState()
    val isNightAlarmEnabled by dashboardViewModel.isNightAlarmEnabled.collectAsState()

    var tipIndex by remember { mutableIntStateOf(0) }
    var activeModalType by remember { mutableStateOf<String?>(null) }

    LaunchedEffect(Unit) {
        dashboardViewModel.refreshDashboard()
    }

    val todayDate = remember { LocalDate.now() }

    // Scaffold with containerColor = TealLight
    Scaffold(
        bottomBar = { BottomNavigationBar(navController = navController) },
        containerColor = TealLight
    ) { _ ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .background(TealLight)
                .statusBarsPadding()
                .padding(top = 8.dp),
            contentPadding = PaddingValues(
                start = 16.dp,
                end = 16.dp,
                top = 8.dp,
                bottom = 100.dp
            ),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {

            // 1. TOP HERO WELCOME BANNER WITH DYNAMIC GOAL SYNCHRONIZATION
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = TealPrimary),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(20.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                // Progress Circle (0/2, 1/2, 2/2)
                                Box(
                                    modifier = Modifier
                                        .size(56.dp)
                                        .clip(CircleShape)
                                        .background(Color.White.copy(alpha = 0.2f)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "$todayCompletedCount/2",
                                        fontWeight = FontWeight.Black,
                                        fontSize = 18.sp,
                                        color = Color.White
                                    )
                                }

                                Spacer(modifier = Modifier.width(14.dp))

                                Column {
                                    Text(
                                        text = "Today's Hygiene Goal",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.Bold,
                                        color = Color(0xFFA5F3FC)
                                    )
                                    Text(
                                        text = "Welcome back, ${childName.ifBlank { "User" }}!",
                                        fontSize = 20.sp,
                                        fontWeight = FontWeight.ExtraBold,
                                        color = Color.White
                                    )
                                    Text(
                                        text = when (todayCompletedCount) {
                                            0 -> "Ready to brush? Complete your morning session!"
                                            1 -> "Great morning start! 1 night session left to hit your goal."
                                            else -> "Great job! Both daily sessions completed!"
                                        },
                                        fontSize = 12.sp,
                                        color = Color.White.copy(alpha = 0.9f)
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            // Dynamic Action Button (Start Morning Brushing ▶ / Start Night Brushing ▶ / ✓ Goal Completed Today)
                            Button(
                                onClick = {
                                    if (todayCompletedCount < 2) {
                                        navController.navigate(Screen.SmartMirror.route)
                                    }
                                },
                                enabled = todayCompletedCount < 2,
                                shape = RoundedCornerShape(16.dp),
                                contentPadding = PaddingValues(horizontal = 10.dp, vertical = 10.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color(0xFF06B6D4),
                                    disabledContainerColor = Color(0xFF0F766E)
                                ),
                                modifier = Modifier.weight(1.3f)
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, modifier = Modifier.size(16.dp), tint = Color.White)
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(
                                    text = when (todayCompletedCount) {
                                        0 -> "Start Morning Brushing ▶"
                                        1 -> "Start Night Brushing ▶"
                                        else -> "✓ Goal Completed Today"
                                    },
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color.White
                                )
                            }

                            // Profile Button
                            Button(
                                onClick = { navController.navigate(Screen.Profile.route) },
                                shape = RoundedCornerShape(16.dp),
                                contentPadding = PaddingValues(horizontal = 12.dp, vertical = 10.dp),
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = Color.White,
                                    contentColor = Color(0xFF0F766E)
                                ),
                                elevation = ButtonDefaults.buttonElevation(defaultElevation = 2.dp),
                                modifier = Modifier.weight(0.9f)
                            ) {
                                Icon(Icons.Default.Person, contentDescription = null, tint = Color(0xFF0F766E), modifier = Modifier.size(16.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Profile", fontSize = 13.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF0F766E))
                            }
                        }
                    }
                }
            }

            // 2. VERTICAL STACK FOR MORNING & NIGHT ALARM SLOTS WITH DYNAMIC ACTIVE/INACTIVE STATES
            item {
                Column(
                    modifier = Modifier.fillMaxWidth(),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    // 1. Morning Alarm Card (Top)
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isMorningAlarmEnabled) Color(0xFFFEF3C7) else Color(0xFFF1F5F9)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("☀️", fontSize = 16.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Morning Reminder: $morningAlarmTime",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = if (isMorningAlarmEnabled) Color(0xFF92400E) else Color(0xFF64748B)
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isMorningAlarmEnabled) Color(0xFFFDE68A) else Color(0xFFE2E8F0)
                            ) {
                                Text(
                                    text = if (isMorningAlarmEnabled) "Active" else "Inactive",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isMorningAlarmEnabled) Color(0xFFB45309) else Color(0xFF64748B),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }

                    // 2. Night Alarm Card (Bottom)
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = if (isNightAlarmEnabled) Color(0xFFEDE9FE) else Color(0xFFF1F5F9)
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 16.dp, vertical = 12.dp),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text("🌙", fontSize = 16.sp)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Night Reminder: $nightAlarmTime",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp,
                                    color = if (isNightAlarmEnabled) Color(0xFF5B21B6) else Color(0xFF64748B)
                                )
                            }
                            Surface(
                                shape = RoundedCornerShape(8.dp),
                                color = if (isNightAlarmEnabled) Color(0xFFDDD6FE) else Color(0xFFE2E8F0)
                            ) {
                                Text(
                                    text = if (isNightAlarmEnabled) "Active" else "Inactive",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = if (isNightAlarmEnabled) Color(0xFF6D28D9) else Color(0xFF64748B),
                                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                                )
                            }
                        }
                    }
                }
            }

            // 3. WEEKLY COMPLIANCE TRACKER CARD SYNCHRONIZED WITH TODAY'S GOAL
            item {
                val sessions by dashboardViewModel.sessions.collectAsState()
                val (weekHeaderRange, weekDays) = remember(sessions) { getCurrentWeekData(sessions) }

                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(22.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        // Header Row
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    imageVector = Icons.Default.CalendarMonth,
                                    contentDescription = null,
                                    tint = Color(0xFF0D766E),
                                    modifier = Modifier.size(20.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Weekly Compliance Tracker",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 15.sp,
                                    color = Color(0xFF0F172A)
                                )
                            }
                            Text(
                                text = weekHeaderRange,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.SemiBold,
                                color = Color(0xFF64748B)
                            )
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Line 1: Monday - Thursday (4 Days)
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            weekDays.take(4).forEach { day ->
                                DayBubbleItem(day = day)
                            }
                        }

                        Spacer(modifier = Modifier.height(14.dp))

                        // Line 2: Friday - Sunday (3 Days centered)
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(horizontal = 28.dp),
                            horizontalArrangement = Arrangement.SpaceAround
                        ) {
                            weekDays.drop(4).forEach { day ->
                                DayBubbleItem(day = day)
                            }
                        }
                    }
                }
            }

            // 4. METRICS ROW: UNBROKEN STREAK & TOTAL CLEAN SESSIONS
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Interactive Streak Card
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { activeModalType = "streak" },
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFF7ED)),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Color(0xFFF97316)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.Whatshot, contentDescription = null, tint = Color.White, modifier = Modifier.size(20.dp))
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text("$streakCount Days", fontWeight = FontWeight.Black, fontSize = 16.sp, color = Color(0xFF7C2D12))
                                    Text("Unbroken Streak ➔", fontSize = 10.sp, color = Color(0xFFC2410C), fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }

                    // Interactive Total Clean Sessions Card
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { activeModalType = "clean" },
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .clip(RoundedCornerShape(10.dp))
                                        .background(Color(0xFFCCFBF1)),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(Icons.Default.EmojiEvents, contentDescription = null, tint = TealPrimary, modifier = Modifier.size(20.dp))
                                }
                                Spacer(modifier = Modifier.width(8.dp))
                                Column {
                                    Text("$totalCleanSessions", fontWeight = FontWeight.Black, fontSize = 16.sp, color = Color(0xFF0F172A))
                                    Text("Clean Sessions ➔", fontSize = 10.sp, color = Color.Gray, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            // 5. CLINICAL TIP CARD
            item {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFECFDF5)),
                    elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                ) {
                    Column(modifier = Modifier.padding(16.dp)) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.SpaceBetween,
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Lightbulb, contentDescription = null, tint = Color(0xFF059669), modifier = Modifier.size(18.dp))
                                Spacer(modifier = Modifier.width(6.dp))
                                Text("Daily Clinical Hygiene Tip", fontWeight = FontWeight.ExtraBold, fontSize = 14.sp, color = Color(0xFF065F46))
                            }
                            TextButton(onClick = { tipIndex = (tipIndex + 1) % DAILY_TIPS.size }) {
                                Text("Next Tip ➔", fontSize = 11.sp, fontWeight = FontWeight.Bold, color = Color(0xFF059669))
                            }
                        }
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "\"${DAILY_TIPS[tipIndex]}\"",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium,
                            color = Color(0xFF047857)
                        )
                    }
                }
            }

            // 6. DENTAL COACHING SHORTCUT CARDS
            item {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { navController.navigate(Screen.SmartMirror.route) },
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFCFFAFE)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.CameraAlt, contentDescription = null, tint = Color(0xFF0891B2), modifier = Modifier.size(24.dp))
                            }
                            Spacer(modifier = Modifier.height(10.dp))
                            Text("Mirror Coach", fontWeight = FontWeight.ExtraBold, fontSize = 13.sp, color = Color(0xFF0F172A))
                            Text("Real-Time AI Guide", fontSize = 11.sp, color = Color.Gray)
                        }
                    }

                    Card(
                        modifier = Modifier
                            .weight(1f)
                            .clickable { navController.navigate(Screen.Chatbot.route) },
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(16.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(44.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFFDCFCE7)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(Icons.Default.ChatBubbleOutline, contentDescription = null, tint = Color(0xFF16A34A), modifier = Modifier.size(24.dp))
                            }
                            Spacer(modifier = Modifier.height(10.dp))
                            Text("Dr. Minty AI", fontWeight = FontWeight.ExtraBold, fontSize = 13.sp, color = Color(0xFF0F172A))
                            Text("Ask Oral Health Qs", fontSize = 11.sp, color = Color.Gray)
                        }
                    }
                }
            }
        }
    }

    // STREAK & CLEAN SESSIONS MODAL DIALOGS
    if (activeModalType != null) {
        AlertDialog(
            onDismissRequest = { activeModalType = null },
            title = {
                Text(
                    text = if (activeModalType == "streak") "Unbroken Streak Progress" else "Total Clean Sessions",
                    fontWeight = FontWeight.ExtraBold
                )
            },
            text = {
                Text(
                    text = if (activeModalType == "streak")
                        "You have maintained an active brushing streak for $streakCount consecutive day(s)! Complete both morning and night sessions to extend your streak."
                    else
                        "You have completed $totalCleanSessions total brushing session(s) with ToothMate! Keep up the great oral hygiene habit."
                )
            },
            confirmButton = {
                TextButton(onClick = { activeModalType = null }) {
                    Text("Got It!", fontWeight = FontWeight.Bold, color = TealPrimary)
                }
            }
        )
    }
}

@Composable
fun DayBubbleItem(day: WeekDayData) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = Modifier.width(48.dp)
    ) {
        Text(
            text = day.dayName,
            fontSize = 12.sp,
            fontWeight = if (day.isToday) FontWeight.Bold else FontWeight.Medium,
            color = if (day.isToday) Color(0xFF0D766E) else Color(0xFF64748B)
        )
        Spacer(modifier = Modifier.height(6.dp))
        Box(
            modifier = Modifier.size(42.dp),
            contentAlignment = Alignment.Center
        ) {
            // Main Day Circle
            Box(
                modifier = Modifier
                    .size(38.dp)
                    .background(
                        color = if (day.sessionCount > 0) Color(0xFF0D766E) else Color(0xFFF1F5F9),
                        shape = CircleShape
                    )
                    .border(
                        width = if (day.isToday && day.sessionCount == 0) 2.dp else 0.dp,
                        color = if (day.isToday) Color(0xFF0D766E) else Color.Transparent,
                        shape = CircleShape
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = day.dateNumber,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Bold,
                    color = if (day.sessionCount > 0) Color.White else Color(0xFF94A3B8)
                )
            }

            // Session Badge (Render only when sessionCount > 0)
            if (day.sessionCount > 0) {
                Box(
                    modifier = Modifier
                        .size(16.dp)
                        .align(Alignment.TopEnd)
                        .background(Color(0xFFF59E0B), CircleShape)
                        .border(1.dp, Color.White, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = day.sessionCount.toString(),
                        fontSize = 9.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                }
            }
        }
    }
}

