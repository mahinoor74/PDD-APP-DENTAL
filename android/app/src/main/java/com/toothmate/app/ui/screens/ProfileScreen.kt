package com.toothmate.app.ui.screens

import android.widget.Toast
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.ArrowForward
import androidx.compose.material.icons.filled.ArrowDropDown
import androidx.compose.material.icons.filled.CameraAlt
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.AccessTime
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.Lightbulb
import androidx.compose.material.icons.filled.NightlightRound
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material.icons.filled.WbSunny
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.TextStyle
import androidx.compose.material.icons.filled.KeyboardArrowUp
import androidx.compose.material.icons.filled.KeyboardArrowDown
import android.app.TimePickerDialog
import androidx.compose.ui.platform.LocalSoftwareKeyboardController
import androidx.compose.ui.focus.FocusRequester
import androidx.compose.ui.focus.focusRequester
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.runtime.LaunchedEffect
import com.toothmate.app.ui.components.AlarmDialog
import androidx.navigation.NavController
import com.toothmate.app.receiver.NotificationHelper
import com.toothmate.app.ui.components.BottomNavigationBar
import com.toothmate.app.ui.navigation.Screen
import com.toothmate.app.viewmodel.AuthViewModel

@Composable
fun ProfileScreen(navController: NavController, authViewModel: AuthViewModel) {
    val context = LocalContext.current
    val userName by authViewModel.userName.collectAsState()
    val userMode by authViewModel.userMode.collectAsState()
    val childName by authViewModel.childName.collectAsState()
    val brushDaysUsed by authViewModel.brushDaysUsed.collectAsState()

    val morningTimeSaved by authViewModel.morningReminderTime.collectAsState()
    val nightTimeSaved by authViewModel.nightReminderTime.collectAsState()
    val morningActiveSaved by authViewModel.morningActive.collectAsState()
    val nightActiveSaved by authViewModel.nightActive.collectAsState()

    var morningTimeInput by remember { mutableStateOf(if (morningTimeSaved.isNotBlank()) morningTimeSaved else "09:39 AM") }
    var nightTimeInput by remember { mutableStateOf(if (nightTimeSaved.isNotBlank()) nightTimeSaved else "08:00 PM") }
    var morningAlarmEnabled by remember { mutableStateOf(morningActiveSaved) }
    var eveningAlarmEnabled by remember { mutableStateOf(nightActiveSaved) }

    // Dialog & Notification States
    var showEditDialog by remember { mutableStateOf(false) }

    // Formal Time Picker Modal State & Focus Requesters
    val keyboardController = LocalSoftwareKeyboardController.current
    val hourFocusRequester = remember { FocusRequester() }
    val minFocusRequester = remember { FocusRequester() }

    var timePickerTarget by remember { mutableStateOf<String?>(null) } // "morning" or "night"
    var pickerHour by remember { mutableStateOf("09") }
    var pickerMinute by remember { mutableStateOf("39") }
    var pickerAmPm by remember { mutableStateOf("AM") }

    LaunchedEffect(timePickerTarget) {
        if (timePickerTarget != null) {
            kotlinx.coroutines.delay(200)
            hourFocusRequester.requestFocus()
            keyboardController?.show()
        }
    }

    var editDisplayName by remember { mutableStateOf(if (childName.isNotBlank()) childName else userName) }
    var editAgeCategory by remember { mutableStateOf(if (userMode.lowercase().contains("child")) "Child Mode" else "Adult Mode") }
    var editTechnique by remember { mutableStateOf("Modified Bass Technique") }

    // REAL-TIME CLOCK TICKER LOOP: Evaluates system time every 1s & triggers Alarm Pop-Up Overlay EXACTLY ONCE!
    var lastFiredMorningKey by remember { mutableStateOf("") }
    var lastFiredNightKey by remember { mutableStateOf("") }
    var snoozedUntilMillis by remember { mutableStateOf(0L) }
    var activeAlarmPopup by remember { mutableStateOf<Pair<String, String>?>(null) }

    fun parseTimeCal(timeStr: String): java.util.Calendar? {
        val clean = timeStr.trim()
        val regex = Regex("""^(\d{1,2}):(\d{2})\s*(AM|PM)?$""", RegexOption.IGNORE_CASE)
        val match = regex.find(clean) ?: return null
        var h = match.groupValues[1].toIntOrNull() ?: return null
        val m = match.groupValues[2].toIntOrNull() ?: return null
        val ampm = match.groupValues[3].uppercase()

        if (ampm == "PM" && h < 12) h += 12
        if (ampm == "AM" && h == 12) h = 0

        return java.util.Calendar.getInstance().apply {
            set(java.util.Calendar.HOUR_OF_DAY, h)
            set(java.util.Calendar.MINUTE, m)
            set(java.util.Calendar.SECOND, 0)
            set(java.util.Calendar.MILLISECOND, 0)
        }
    }

    LaunchedEffect(morningTimeInput, nightTimeInput, morningAlarmEnabled, eveningAlarmEnabled, snoozedUntilMillis) {
        var isFirstRun = true
        while (true) {
            val now = java.util.Calendar.getInstance()
            val nowMillis = System.currentTimeMillis()
            val curH = now.get(java.util.Calendar.HOUR_OF_DAY)
            val curM = now.get(java.util.Calendar.MINUTE)
            val todayJulian = now.get(java.util.Calendar.DAY_OF_YEAR)

            if (isFirstRun) {
                lastFiredMorningKey = "MORNING-$curH:$curM-$todayJulian"
                lastFiredNightKey = "NIGHT-$curH:$curM-$todayJulian"
                isFirstRun = false
            }

            // 1. Check Snooze Alarm
            if (snoozedUntilMillis > 0L && nowMillis >= snoozedUntilMillis) {
                snoozedUntilMillis = 0L
                val title = "⏰ Snoozed Brushing Reminder"
                val msg = "Your 10-minute snooze is complete! Time to start your 2-minute toothbrushing session now. 🪥✨"
                activeAlarmPopup = Pair(title, msg)
                NotificationHelper.showBrushingNotification(context, title, msg)
            }

            // 2. Check Morning Alarm (Strict 24-hour hour & minute matching for Morning)
            if (morningAlarmEnabled && morningTimeInput.isNotBlank()) {
                val morningCal = parseTimeCal(morningTimeInput)
                if (morningCal != null) {
                    val targetH = morningCal.get(java.util.Calendar.HOUR_OF_DAY)
                    val targetM = morningCal.get(java.util.Calendar.MINUTE)
                    val morningKey = "MORNING-$targetH:$targetM-$todayJulian"

                    if (curH == targetH && curM == targetM && morningKey != lastFiredMorningKey) {
                        lastFiredMorningKey = morningKey
                        val title = "☀️ Morning Brush Time!"
                        val msg = "Start your brushing! It only takes 2 minutes for a clean, confident smile. 🪥✨"
                        activeAlarmPopup = Pair(title, msg)
                        NotificationHelper.showBrushingNotification(context, title, msg)
                    }
                }
            }

            // 3. Check Night Alarm (Strict 24-hour hour & minute matching for Night)
            if (eveningAlarmEnabled && nightTimeInput.isNotBlank()) {
                val nightCal = parseTimeCal(nightTimeInput)
                if (nightCal != null) {
                    val targetH = nightCal.get(java.util.Calendar.HOUR_OF_DAY)
                    val targetM = nightCal.get(java.util.Calendar.MINUTE)
                    val nightKey = "NIGHT-$targetH:$targetM-$todayJulian"

                    if (curH == targetH && curM == targetM && nightKey != lastFiredNightKey) {
                        lastFiredNightKey = nightKey
                        val title = "🌙 Night Brush Time!"
                        val msg = "Protect your enamel before bed! Complete your 2-minute night toothbrushing routine. ✨"
                        activeAlarmPopup = Pair(title, msg)
                        NotificationHelper.showBrushingNotification(context, title, msg)
                    }
                }
            }

            kotlinx.coroutines.delay(1000)
        }
    }

    Scaffold(
        bottomBar = { BottomNavigationBar(navController = navController) },
        containerColor = Color(0xFFF8FAFC)
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFFF8FAFC))
                .statusBarsPadding()
                .padding(
                    start = 16.dp,
                    end = 16.dp,
                    top = 8.dp,
                    bottom = innerPadding.calculateBottomPadding() + 64.dp
                )
                .verticalScroll(rememberScrollState()),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            
            // 1. PROMINENT ENLARGED PROFILE HEADER WITH HIGHLIGHTED TECHNIQUE BANNER
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0F766E)),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(20.dp)
                ) {
                    // Row 1: Avatar, Name, Edit Action
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(54.dp)
                                    .background(Color(0xFF14B8A6), CircleShape),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "User Avatar",
                                    tint = Color.White,
                                    modifier = Modifier.size(32.dp)
                                )
                            }
                            Spacer(modifier = Modifier.width(14.dp))
                            Column {
                                Text(
                                    text = "Hello, ${if (childName.isNotBlank()) childName else userName}!",
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                                Text(
                                    text = "Daily Dental Hygiene Profile",
                                    fontSize = 12.sp,
                                    color = Color(0xFFCCFBF1)
                                )
                            }
                        }

                        IconButton(
                            onClick = { showEditDialog = true },
                            modifier = Modifier
                                .size(40.dp)
                                .background(Color(0x33FFFFFF), CircleShape)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Edit,
                                contentDescription = "Edit Name",
                                tint = Color.White,
                                modifier = Modifier.size(20.dp)
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Row 2: Highlighted Recommended Technique Banner
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(14.dp),
                        color = Color(0xFF042F2E),
                        border = BorderStroke(1.dp, Color(0xFF2DD4BF))
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 14.dp, vertical = 10.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text("✨", fontSize = 16.sp)
                            Spacer(modifier = Modifier.width(8.dp))
                            Column {
                                Text(
                                    text = "CLINICAL RECOMMENDATION",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF5EEAD4),
                                    letterSpacing = 1.sp
                                )
                                Text(
                                    text = editTechnique,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color.White
                                )
                            }
                        }
                    }
                }
            }

            // 2. DAILY HYGIENE REMINDERS CARD
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(modifier = Modifier.padding(20.dp)) {
                    
                    // Card Header
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.Notifications,
                                contentDescription = "Reminders",
                                tint = Color(0xFF0082CD),
                                modifier = Modifier.size(22.dp)
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Column {
                                Text(
                                    text = "Daily Hygiene Reminders",
                                    fontSize = 16.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1E293B)
                                )
                                Text(
                                    text = "Active • Alarms Will Ring at Scheduled Times",
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF10B981)
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(14.dp))

                    // UN-CLIPPED SAVE ALARM TIMES BUTTON (FIRES POPUP NOTIFICATION & SCHEDULES ALARMS)
                    Button(
                        onClick = {
                            authViewModel.saveReminders(
                                morningTime = morningTimeInput,
                                nightTime = nightTimeInput,
                                morningOn = morningAlarmEnabled,
                                nightOn = eveningAlarmEnabled
                            )

                            // Schedule real system alarms with AlarmManager at the exact set time!
                            NotificationHelper.scheduleDailyReminders(
                                context = context,
                                morningTime = morningTimeInput,
                                nightTime = nightTimeInput,
                                morningOn = morningAlarmEnabled,
                                nightOn = eveningAlarmEnabled
                            )

                            Toast.makeText(context, "💾 Alarm Times Saved! Notifications scheduled for $morningTimeInput & $nightTimeInput", Toast.LENGTH_LONG).show()
                        },
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7)),
                        modifier = Modifier.fillMaxWidth().height(48.dp)
                    ) {
                        Icon(Icons.Default.Check, contentDescription = null, tint = Color.White, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text(
                            text = "Save Alarm Times",
                            fontSize = 14.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                    }

                    Spacer(modifier = Modifier.height(18.dp))

                    // Morning Brush Alarm Card (Clean Formal Layout - Test Button Removed)
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFFFFBEB))
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(Color(0xFFF97316)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.WbSunny,
                                    contentDescription = "Morning",
                                    tint = Color.White,
                                    modifier = Modifier.size(22.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Morning Brush Alarm",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1E293B)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Card(
                                    shape = RoundedCornerShape(10.dp),
                                    colors = CardDefaults.cardColors(containerColor = Color.White),
                                    modifier = Modifier.clickable { 
                                        pickerHour = "09"
                                        pickerMinute = "39"
                                        pickerAmPm = "AM"
                                        timePickerTarget = "morning" 
                                    }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.AccessTime, contentDescription = null, tint = Color(0xFFF97316), modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = morningTimeInput,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = Color(0xFF1E293B)
                                        )
                                        Icon(
                                            Icons.Default.ArrowDropDown,
                                            contentDescription = "Select Time",
                                            tint = Color.Gray
                                        )
                                    }
                                }
                            }

                            Switch(
                                checked = morningAlarmEnabled,
                                onCheckedChange = { isEnabled ->
                                    morningAlarmEnabled = isEnabled
                                    authViewModel.setMorningAlarmEnabled(isEnabled)
                                },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = Color(0xFF0082CD)
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(12.dp))

                    // Night Brush Alarm Card (Clean Formal Layout - Test Button Removed)
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC))
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(RoundedCornerShape(14.dp))
                                    .background(Color(0xFF6366F1)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.NightlightRound,
                                    contentDescription = "Night",
                                    tint = Color.White,
                                    modifier = Modifier.size(22.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "Night Brush Alarm",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1E293B)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Card(
                                    shape = RoundedCornerShape(10.dp),
                                    colors = CardDefaults.cardColors(containerColor = Color.White),
                                    modifier = Modifier.clickable { 
                                        pickerHour = "08"
                                        pickerMinute = "00"
                                        pickerAmPm = "PM"
                                        timePickerTarget = "night" 
                                    }
                                ) {
                                    Row(
                                        modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Icon(Icons.Default.AccessTime, contentDescription = null, tint = Color(0xFF6366F1), modifier = Modifier.size(14.dp))
                                        Spacer(modifier = Modifier.width(4.dp))
                                        Text(
                                            text = nightTimeInput,
                                            fontSize = 13.sp,
                                            fontWeight = FontWeight.ExtraBold,
                                            color = Color(0xFF1E293B)
                                        )
                                        Icon(
                                            Icons.Default.ArrowDropDown,
                                            contentDescription = "Select Time",
                                            tint = Color.Gray
                                        )
                                    }
                                }
                            }

                            Switch(
                                checked = eveningAlarmEnabled,
                                onCheckedChange = { isEnabled ->
                                    eveningAlarmEnabled = isEnabled
                                    authViewModel.setNightAlarmEnabled(isEnabled)
                                },
                                colors = SwitchDefaults.colors(
                                    checkedThumbColor = Color.White,
                                    checkedTrackColor = Color(0xFF0082CD)
                                )
                            )
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // MOTIVATIONAL HYGIENE TIP CARD
                    Card(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(18.dp),
                        colors = CardDefaults.cardColors(containerColor = Color(0xFFF0FDF4))
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            verticalAlignment = Alignment.Top
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(38.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color(0xFF10B981)),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    Icons.Default.Lightbulb,
                                    contentDescription = "Tip",
                                    tint = Color.White,
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            Column {
                                Text(
                                    text = "MOTIVATIONAL HYGIENE TIP",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color(0xFF047857)
                                )
                                Spacer(modifier = Modifier.height(4.dp))
                                Text(
                                    text = "Brushing twice daily for 2 full minutes removes plaque buildup and maintains your white, natural smile.",
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium,
                                    color = Color(0xFF334155),
                                    lineHeight = 16.sp
                                )
                            }
                        }
                    }
                }
            }

            // 3. BRUSH HEAD WEAR TRACKER & REPLACEMENT ALERT CARD
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.AccessTime,
                                contentDescription = null,
                                tint = Color(0xFF0D766E),
                                modifier = Modifier.size(20.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = "Brush Head Wear Tracker",
                                fontSize = 15.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF0F172A)
                            )
                        }

                        Button(
                            onClick = { authViewModel.resetBrushHead() },
                            shape = RoundedCornerShape(12.dp),
                            contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFCCFBF1), contentColor = Color(0xFF0F766E))
                        ) {
                            Icon(Icons.Default.Refresh, contentDescription = null, modifier = Modifier.size(14.dp), tint = Color(0xFF0F766E))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Reset New Brush", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }

                    Spacer(modifier = Modifier.height(10.dp))

                    Text(
                        text = "Toothbrush Lifespan: $brushDaysUsed days used / 90 days recommended",
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium,
                        color = Color(0xFF475569)
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    val wearProgress = (brushDaysUsed / 90f).coerceIn(0f, 1f)
                    LinearProgressIndicator(
                        progress = { wearProgress },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(8.dp)
                            .clip(CircleShape),
                        color = when {
                            brushDaysUsed >= 90 -> Color(0xFFEF4444)
                            brushDaysUsed >= 75 -> Color(0xFFF59E0B)
                            else -> Color(0xFF0D766E)
                        },
                        trackColor = Color(0xFFE2E8F0)
                    )

                    if (brushDaysUsed >= 90) {
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "⚠️ Time to replace your brush head for optimal plaque removal!",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFFDC2626)
                        )
                    }
                }
            }

            // 4. CLINICAL TECHNIQUE RE-ASSESSMENT CARD
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .clickable { navController.navigate(Screen.Assessment.route) },
                shape = RoundedCornerShape(20.dp),
                colors = CardDefaults.cardColors(containerColor = Color.White),
                elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
            ) {
                Row(
                    modifier = Modifier.padding(16.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Row(
                        modifier = Modifier.weight(1f),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Box(
                            modifier = Modifier
                                .size(42.dp)
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF0F766E)),
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(Icons.Default.Lightbulb, contentDescription = null, tint = Color.White, modifier = Modifier.size(22.dp))
                        }
                        Spacer(modifier = Modifier.width(12.dp))
                        Column {
                            Text("Clinical Technique Re-Assessment", fontWeight = FontWeight.ExtraBold, fontSize = 14.sp, color = Color(0xFF0F172A))
                            Spacer(modifier = Modifier.height(2.dp))
                            Text(
                                "Retake Dental Questionnaire to update conditions (braces, sensitivity) and recalculate brushing technique.",
                                fontSize = 11.sp,
                                color = Color(0xFF64748B),
                                lineHeight = 15.sp
                            )
                        }
                    }

                    Spacer(modifier = Modifier.width(8.dp))

                    Icon(Icons.AutoMirrored.Filled.ArrowForward, contentDescription = null, tint = Color(0xFF0F766E), modifier = Modifier.size(20.dp))
                }
            }

            // 4. PROMINENT HIGHLIGHTED SIGN OUT BUTTON
            Button(
                onClick = {
                    authViewModel.logout()
                    navController.navigate(Screen.Auth.route) {
                        popUpTo(Screen.Dashboard.route) { inclusive = true }
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                shape = RoundedCornerShape(18.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFFDC2626),
                    contentColor = Color.White
                ),
                elevation = ButtonDefaults.buttonElevation(defaultElevation = 4.dp)
            ) {
                Text(text = "Sign Out Account", color = Color.White, fontWeight = FontWeight.Black, fontSize = 15.sp)
            }
        }

        // FORMAL SLEEK TIME PICKER DIALOG WITH NUMERIC KEYBOARD, STEPPERS & NATIVE CLOCK PICKER
        timePickerTarget?.let { target ->
            Dialog(
                onDismissRequest = { timePickerTarget = null },
                properties = DialogProperties(usePlatformDefaultWidth = false)
            ) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(Color.Black.copy(alpha = 0.75f))
                        .clickable { timePickerTarget = null },
                    contentAlignment = Alignment.Center
                ) {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth(0.90f)
                            .clickable(enabled = false) {},
                        shape = RoundedCornerShape(28.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.White),
                        elevation = CardDefaults.cardElevation(defaultElevation = 16.dp)
                    ) {
                        Column(
                            modifier = Modifier.padding(24.dp),
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Select ${if (target == "morning") "Morning ☀️" else "Night 🌙"} Alarm Time",
                                fontSize = 18.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color(0xFF0F172A)
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Choose exact time for toothbrushing alarm",
                                fontSize = 11.sp,
                                color = Color(0xFF64748B)
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            // Hour : Minute AM/PM Controls (Direct Soft Keypad Focus & Single-Line Period Buttons)
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                // Hour Direct Text Field
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("HOUR", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Color(0xFF94A3B8))
                                    Spacer(modifier = Modifier.height(6.dp))

                                    OutlinedTextField(
                                        value = pickerHour,
                                        onValueChange = {
                                            if (it.length <= 2 && it.all { char -> char.isDigit() }) {
                                                pickerHour = it
                                            }
                                        },
                                        modifier = Modifier
                                            .width(72.dp)
                                            .focusRequester(hourFocusRequester)
                                            .clickable {
                                                hourFocusRequester.requestFocus()
                                                keyboardController?.show()
                                            },
                                        singleLine = true,
                                        textStyle = TextStyle(fontSize = 18.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, color = Color(0xFF0F172A)),
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Next),
                                        shape = RoundedCornerShape(14.dp),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            unfocusedBorderColor = Color(0xFFE2E8F0),
                                            focusedBorderColor = Color(0xFF0284C7)
                                        )
                                    )
                                }

                                Text(":", fontWeight = FontWeight.Black, fontSize = 24.sp, color = Color(0xFF475569))

                                // Minute Direct Text Field
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("MIN", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Color(0xFF94A3B8))
                                    Spacer(modifier = Modifier.height(6.dp))

                                    OutlinedTextField(
                                        value = pickerMinute,
                                        onValueChange = {
                                            if (it.length <= 2 && it.all { char -> char.isDigit() }) {
                                                pickerMinute = it
                                            }
                                        },
                                        modifier = Modifier
                                            .width(72.dp)
                                            .focusRequester(minFocusRequester)
                                            .clickable {
                                                minFocusRequester.requestFocus()
                                                keyboardController?.show()
                                            },
                                        singleLine = true,
                                        textStyle = TextStyle(fontSize = 18.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center, color = Color(0xFF0F172A)),
                                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number, imeAction = ImeAction.Done),
                                        shape = RoundedCornerShape(14.dp),
                                        colors = OutlinedTextFieldDefaults.colors(
                                            unfocusedBorderColor = Color(0xFFE2E8F0),
                                            focusedBorderColor = Color(0xFF0284C7)
                                        )
                                    )
                                }

                                // AM/PM Single Line Period Segment Buttons
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text("PERIOD", fontSize = 10.sp, fontWeight = FontWeight.Black, color = Color(0xFF94A3B8))
                                    Spacer(modifier = Modifier.height(6.dp))
                                    Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(10.dp))
                                                .background(if (pickerAmPm == "AM") Color(0xFFF59E0B) else Color(0xFFE2E8F0))
                                                .clickable { pickerAmPm = "AM" }
                                                .padding(horizontal = 10.dp, vertical = 12.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = "AM", 
                                                fontSize = 12.sp, 
                                                fontWeight = FontWeight.Black, 
                                                color = if (pickerAmPm == "AM") Color.White else Color(0xFF475569),
                                                maxLines = 1,
                                                softWrap = false
                                            )
                                        }
                                        Box(
                                            modifier = Modifier
                                                .clip(RoundedCornerShape(10.dp))
                                                .background(if (pickerAmPm == "PM") Color(0xFF6366F1) else Color(0xFFE2E8F0))
                                                .clickable { pickerAmPm = "PM" }
                                                .padding(horizontal = 10.dp, vertical = 12.dp),
                                            contentAlignment = Alignment.Center
                                        ) {
                                            Text(
                                                text = "PM", 
                                                fontSize = 12.sp, 
                                                fontWeight = FontWeight.Black, 
                                                color = if (pickerAmPm == "PM") Color.White else Color(0xFF475569),
                                                maxLines = 1,
                                                softWrap = false
                                            )
                                        }
                                    }
                                }
                            }

                            Spacer(modifier = Modifier.height(16.dp))

                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Button(
                                    onClick = { timePickerTarget = null },
                                    modifier = Modifier.weight(1f).height(46.dp),
                                    shape = RoundedCornerShape(14.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF1F5F9))
                                ) {
                                    Text("Cancel", color = Color(0xFF475569), fontWeight = FontWeight.Bold)
                                }
                                Button(
                                    onClick = {
                                        val formatted = "${pickerHour.padStart(2, '0')}:${pickerMinute.padStart(2, '0')} $pickerAmPm"
                                        if (target == "morning") morningTimeInput = formatted else nightTimeInput = formatted
                                        timePickerTarget = null
                                    },
                                    modifier = Modifier.weight(1f).height(46.dp),
                                    shape = RoundedCornerShape(14.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0284C7))
                                ) {
                                    Text("Confirm", color = Color.White, fontWeight = FontWeight.ExtraBold)
                                }
                            }
                        }
                    }
                }
            }
        }

        // EDIT PROFILE DETAILS MODAL DIALOG
        if (showEditDialog) {
            Dialog(onDismissRequest = { showEditDialog = false }) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(28.dp),
                    colors = CardDefaults.cardColors(containerColor = Color.White),
                    elevation = CardDefaults.cardElevation(defaultElevation = 10.dp)
                ) {
                    Column(modifier = Modifier.padding(24.dp)) {
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(
                                    Icons.Default.Edit,
                                    contentDescription = "Edit Profile",
                                    tint = Color(0xFF0082CD),
                                    modifier = Modifier.size(22.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Edit Profile Details",
                                    fontSize = 20.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF1E293B)
                                )
                            }
                            IconButton(onClick = { showEditDialog = false }) {
                                Icon(
                                    Icons.Default.Close,
                                    contentDescription = "Close",
                                    tint = Color(0xFF94A3B8)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(20.dp))

                        Text(text = "Display Name", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                        Spacer(modifier = Modifier.height(6.dp))
                        OutlinedTextField(
                            value = editDisplayName,
                            onValueChange = { editDisplayName = it },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = OutlinedTextFieldDefaults.colors(
                                unfocusedContainerColor = Color(0xFFF8FAFC),
                                focusedContainerColor = Color(0xFFF8FAFC),
                                unfocusedBorderColor = Color(0xFFE2E8F0),
                                focusedBorderColor = Color(0xFF0082CD)
                            ),
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(text = "Age Mode Category", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                        Spacer(modifier = Modifier.height(6.dp))
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC))
                        ) {
                            Row(
                                modifier = Modifier
                                    .padding(14.dp)
                                    .fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = editAgeCategory, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                                Icon(Icons.Default.ArrowDropDown, contentDescription = "Select Mode", tint = Color.Gray)
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(text = "Brushing Technique", fontSize = 13.sp, fontWeight = FontWeight.Bold, color = Color(0xFF64748B))
                        Spacer(modifier = Modifier.height(6.dp))
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Color(0xFFF8FAFC))
                        ) {
                            Row(
                                modifier = Modifier
                                    .padding(14.dp)
                                    .fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(text = editTechnique, fontSize = 14.sp, fontWeight = FontWeight.Bold, color = Color(0xFF1E293B))
                                Icon(Icons.Default.ArrowDropDown, contentDescription = "Select Technique", tint = Color.Gray)
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Button(
                                onClick = { showEditDialog = false },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp),
                                shape = RoundedCornerShape(16.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFFF1F5F9))
                            ) {
                                Text(text = "Cancel", color = Color(0xFF475569), fontWeight = FontWeight.Bold)
                            }

                            Button(
                                onClick = {
                                    authViewModel.saveDemographics(
                                        name = editDisplayName,
                                        mode = if (editAgeCategory.contains("Child")) "child" else "adult",
                                        genderVal = "Male",
                                        age = 25
                                    )
                                    showEditDialog = false
                                    Toast.makeText(context, "✅ Profile Updated!", Toast.LENGTH_SHORT).show()
                                },
                                modifier = Modifier
                                    .weight(1f)
                                    .height(48.dp),
                                shape = RoundedCornerShape(16.dp),
                                colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0082CD))
                            ) {
                                Text(text = "Save Changes", color = Color.White, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
        }

        // REAL-TIME ALARM POPUP OVERLAY ON SCREEN AT SCHEDULED TIME
        activeAlarmPopup?.let { (title, msg) ->
            AlarmDialog(
                title = title,
                message = msg,
                onDismiss = { activeAlarmPopup = null },
                onSnooze = {
                    activeAlarmPopup = null
                    snoozedUntilMillis = System.currentTimeMillis() + 10 * 60 * 1000L
                    android.widget.Toast.makeText(context, "⏰ Snoozed for 10 minutes!", android.widget.Toast.LENGTH_LONG).show()
                },
                onStartBrushing = {
                    activeAlarmPopup = null
                    navController.navigate(Screen.SmartMirror.route)
                }
            )
        }
    }
}
