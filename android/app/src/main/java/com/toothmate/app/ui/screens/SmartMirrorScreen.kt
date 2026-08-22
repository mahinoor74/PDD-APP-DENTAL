package com.toothmate.app.ui.screens

import android.Manifest
import android.content.pm.PackageManager
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.material.icons.automirrored.filled.VolumeOff
import androidx.compose.material.icons.automirrored.filled.VolumeUp
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Pause
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.core.content.ContextCompat
import androidx.navigation.NavController
import com.toothmate.app.data.local.UserPreferences
import com.toothmate.app.data.model.ClinicalTechniquesRepository
import com.toothmate.app.ui.components.BottomNavigationBar
import com.toothmate.app.ui.components.CameraPreview
import com.toothmate.app.ui.components.DynamicBrushMotionCanvas
import com.toothmate.app.utils.NativeSpeechCoach
import com.toothmate.app.viewmodel.MirrorViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SmartMirrorScreen(navController: NavController, mirrorViewModel: MirrorViewModel) {
    val context = LocalContext.current

    // Initialize Native Speech Coach TTS Engine
    val speechCoach = remember { NativeSpeechCoach(context) }

    // Clean up Speech Coach on composable disposal
    DisposableEffect(Unit) {
        onDispose {
            speechCoach.stop()
            speechCoach.shutdown()
        }
    }

    val secondsRemaining by mirrorViewModel.secondsRemaining.collectAsState()
    val isRunning by mirrorViewModel.isRunning.collectAsState()
    val currentZoneIdx by mirrorViewModel.currentZoneIdx.collectAsState()
    val activeTechnique by mirrorViewModel.selectedTechnique.collectAsState()

    val zoneTrigger by mirrorViewModel.onZoneChangeTrigger.collectAsState()
    val finishTrigger by mirrorViewModel.onFinishTrigger.collectAsState()

    var isMuted by remember { mutableStateOf(false) }
    var dropdownExpanded by remember { mutableStateOf(false) }
    var showCompletionDialog by remember { mutableStateOf(false) }

    // TTS Voice Triggers
    LaunchedEffect(zoneTrigger) {
        zoneTrigger?.let { zone ->
            if (isRunning && !isMuted) {
                speechCoach.speak(zone.script)
            }
        }
    }

    LaunchedEffect(finishTrigger) {
        finishTrigger?.let { finishScript ->
            if (!isMuted) {
                speechCoach.speak(finishScript)
            }
            showCompletionDialog = true
        }
    }

    // Camera Permission State
    var hasCameraPermission by remember {
        mutableStateOf(
            ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.CAMERA
            ) == PackageManager.PERMISSION_GRANTED
        )
    }

    val launcher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.RequestPermission(),
        onResult = { granted -> hasCameraPermission = granted }
    )

    LaunchedEffect(Unit) {
        if (!hasCameraPermission) {
            launcher.launch(Manifest.permission.CAMERA)
        }
    }

    val activeZoneScript = activeTechnique.zoneScripts.getOrNull(currentZoneIdx)
        ?: activeTechnique.zoneScripts.first()

    val minutes = secondsRemaining / 60
    val seconds = secondsRemaining % 60
    val timeFormatted = String.format("%02d:%02d", minutes, seconds)
    val progressPct = ((120 - secondsRemaining) / 120f).coerceIn(0f, 1f)

    val isPrepPhase = !isRunning && secondsRemaining == 120
    val isFinishedPhase = secondsRemaining == 0

    val prefs = remember { UserPreferences(context) }
    val isDarkMode by UserPreferences.darkModeFlow.collectAsState()

    Scaffold(
        modifier = Modifier.statusBarsPadding(),
        bottomBar = { BottomNavigationBar(navController = navController, isDarkTheme = isDarkMode, onToggleTheme = { prefs.toggleDarkMode() }) }
    ) { innerPadding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .background(Color(0xFF020617))
                .padding(innerPadding)
                .verticalScroll(rememberScrollState())
                .padding(horizontal = 16.dp, vertical = 12.dp)
                .padding(bottom = 32.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            // 1. TOP APP HEADER CARD WITH SAFE-AREA INSETS & CLEAN TECHNIQUE SELECTOR DROPDOWN (NO EMOJIS)
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF1E293B)))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            IconButton(
                                onClick = {
                                    speechCoach.stop()
                                    navController.navigate("dashboard")
                                },
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(RoundedCornerShape(12.dp))
                                    .background(Color(0xFF1E293B))
                            ) {
                                Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = "Back", tint = Color.White)
                            }

                            Column {
                                Text(
                                    text = "Brushing Coach",
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color.White
                                )
                                Text(
                                    text = "Real-Time AI Speech Guidance",
                                    fontSize = 11.sp,
                                    color = Color(0xFF94A3B8)
                                )
                            }
                        }
                    }

                    // CLEAN TECHNIQUE SELECTOR DROPDOWN MENU (NO EMOJIS)
                    Box(modifier = Modifier.fillMaxWidth()) {
                        Surface(
                            onClick = { dropdownExpanded = true },
                            modifier = Modifier.fillMaxWidth(),
                            shape = RoundedCornerShape(16.dp),
                            color = Color(0xFF1E293B),
                            border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF06B6D4).copy(alpha = 0.5f)))
                        ) {
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(horizontal = 14.dp, vertical = 10.dp),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Column {
                                    Text("Selected Technique", fontSize = 9.sp, fontWeight = FontWeight.Bold, color = Color(0xFF94A3B8))
                                    Text(activeTechnique.name, fontSize = 13.sp, fontWeight = FontWeight.ExtraBold, color = Color(0xFF67E8F9))
                                }
                                Text("▼", color = Color(0xFF06B6D4), fontSize = 12.sp)
                            }
                        }

                        DropdownMenu(
                            expanded = dropdownExpanded,
                            onDismissRequest = { dropdownExpanded = false },
                            modifier = Modifier.background(Color(0xFF0F172A))
                        ) {
                            ClinicalTechniquesRepository.TECHNIQUES.forEach { tech ->
                                DropdownMenuItem(
                                    text = {
                                        Text(
                                            tech.name,
                                            color = if (tech.id == activeTechnique.id) Color(0xFF67E8F9) else Color.White,
                                            fontWeight = if (tech.id == activeTechnique.id) FontWeight.Black else FontWeight.Medium
                                        )
                                    },
                                    onClick = {
                                        dropdownExpanded = false
                                        mirrorViewModel.selectTechnique(tech.id)
                                        speechCoach.stop()
                                    }
                                )
                            }
                        }
                    }
                }
            }

            // 2. MAIN DYNAMIC GRID: CAMERAX VIEWPORT CARD & DYNAMIC BRUSH CANVAS
            Column(
                modifier = Modifier.fillMaxWidth(),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // CAMERAX VIEWPORT CARD
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(240.dp),
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF020617)),
                    border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF1E293B)))
                ) {
                    Box(modifier = Modifier.fillMaxSize()) {
                        if (hasCameraPermission) {
                            CameraPreview(
                                modifier = Modifier.fillMaxSize(),
                                useFrontCamera = true
                            )
                            // Live badge overlay
                            Box(
                                modifier = Modifier
                                    .padding(12.dp)
                                    .align(Alignment.TopStart)
                                    .clip(RoundedCornerShape(10.dp))
                                    .background(Color(0xFF0F172A).copy(alpha = 0.85f))
                                    .padding(horizontal = 10.dp, vertical = 4.dp)
                            ) {
                                Text(
                                    text = "LIVE MIRROR",
                                    color = Color(0xFF10B981),
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        } else {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(16.dp),
                                horizontalAlignment = Alignment.CenterHorizontally,
                                verticalArrangement = Arrangement.Center
                            ) {
                                Text("Camera Access Required", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Spacer(modifier = Modifier.height(6.dp))
                                Text(
                                    "Allow camera access to align mouth posture with live visual instructions.",
                                    color = Color(0xFF94A3B8),
                                    fontSize = 12.sp,
                                    textAlign = androidx.compose.ui.text.style.TextAlign.Center
                                )
                                Spacer(modifier = Modifier.height(14.dp))
                                Button(
                                    onClick = { launcher.launch(Manifest.permission.CAMERA) },
                                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF10B981)),
                                    shape = RoundedCornerShape(14.dp),
                                    modifier = Modifier.height(44.dp)
                                ) {
                                    Text("Enable Camera Access", color = Color(0xFF020617), fontWeight = FontWeight.Black, fontSize = 13.sp)
                                }
                            }
                        }
                    }
                }

                // DYNAMIC BRUSH MOTION CANVAS WITH PREP & FINISH STAGES
                DynamicBrushMotionCanvas(
                    motionType = activeTechnique.motionType,
                    angleDegrees = activeTechnique.angleDegrees,
                    activeZoneIndex = currentZoneIdx,
                    isBrushing = isRunning,
                    quadrantName = activeZoneScript.quadrantName,
                    isPrepPhase = isPrepPhase,
                    isFinishedPhase = isFinishedPhase
                )
            }

            // 3. 2-MINUTE TIMER & CONTROLS CARD WITH FULLY VISIBLE PROMINENT ACTION BUTTONS
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF1E293B)))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Left Side: Countdown Ring & Text (weighted to prevent clipping right buttons)
                        Row(
                            modifier = Modifier.weight(1f),
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            // Circular Progress Ring Indicator
                            Box(
                                modifier = Modifier.size(58.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(
                                    progress = { progressPct },
                                    modifier = Modifier.fillMaxSize(),
                                    color = Color(0xFF06B6D4),
                                    strokeWidth = 4.dp,
                                    trackColor = Color(0xFF1E293B)
                                )
                                Text(
                                    text = timeFormatted,
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.Black,
                                    color = Color(0xFF67E8F9)
                                )
                            }

                            Column(modifier = Modifier.weight(1f, fill = false)) {
                                Text(
                                    text = "2-Minute Hygiene Timer",
                                    fontSize = 14.sp,
                                    fontWeight = FontWeight.ExtraBold,
                                    color = Color.White,
                                    maxLines = 1
                                )
                                Text(
                                    text = if (isRunning) "Zone ${currentZoneIdx + 1}: ${activeZoneScript.title}" else "Press Start to begin",
                                    fontSize = 11.sp,
                                    color = Color(0xFF94A3B8),
                                    maxLines = 1
                                )
                            }
                        }

                        Spacer(modifier = Modifier.width(8.dp))

                        // Right Side: Speaker Mute Toggle, High-Contrast Emerald/Amber Start Button & Reset Button
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            // Speaker / Mute Toggle Button
                            IconButton(
                                onClick = {
                                    isMuted = !isMuted
                                    speechCoach.setMuted(isMuted)
                                },
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF334155))
                                    .border(1.dp, if (!isMuted) Color(0xFF10B981) else Color(0xFFF87171), CircleShape)
                            ) {
                                Icon(
                                    imageVector = if (isMuted) Icons.AutoMirrored.Filled.VolumeOff else Icons.AutoMirrored.Filled.VolumeUp,
                                    contentDescription = "Toggle Audio",
                                    tint = if (isMuted) Color(0xFFF87171) else Color(0xFF10B981),
                                    modifier = Modifier.size(20.dp)
                                )
                            }

                            // High-Contrast Emerald / Amber 52dp Start/Pause Action Button
                            Button(
                                onClick = {
                                    if (isRunning) {
                                        mirrorViewModel.pauseTimer()
                                        speechCoach.stop()
                                    } else {
                                        if (secondsRemaining == 120 && !isMuted) {
                                            speechCoach.speak(activeTechnique.prepScript)
                                        }
                                        mirrorViewModel.startTimer()
                                    }
                                },
                                shape = CircleShape,
                                colors = ButtonDefaults.buttonColors(
                                    containerColor = if (isRunning) Color(0xFFF59E0B) else Color(0xFF10B981)
                                ),
                                contentPadding = PaddingValues(0.dp),
                                modifier = Modifier.size(52.dp)
                            ) {
                                Icon(
                                    imageVector = if (isRunning) Icons.Filled.Pause else Icons.Filled.PlayArrow,
                                    contentDescription = if (isRunning) "Pause" else "Start",
                                    tint = Color(0xFF020617),
                                    modifier = Modifier.size(28.dp)
                                )
                            }

                            // Reset Button
                            IconButton(
                                onClick = {
                                    mirrorViewModel.resetTimer()
                                    speechCoach.stop()
                                },
                                modifier = Modifier
                                    .size(42.dp)
                                    .clip(CircleShape)
                                    .background(Color(0xFF334155))
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = "Reset",
                                    tint = Color.White,
                                    modifier = Modifier.size(20.dp)
                                )
                            }
                        }
                    }

                    // 4. 6-ZONE QUADRANT PROGRESS MAP WITH INSTANT MILESTONE JUMP
                    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween
                        ) {
                            Text(
                                text = "6-ZONE SEXTANT PROGRESSION",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF94A3B8)
                            )
                            Text(
                                text = "Zone ${currentZoneIdx + 1} of ${activeTechnique.zoneScripts.size}",
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Black,
                                color = Color(0xFF67E8F9)
                            )
                        }

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(6.dp)
                        ) {
                            activeTechnique.zoneScripts.forEachIndexed { idx, _ ->
                                val isActive = idx == currentZoneIdx
                                val isPast = idx < currentZoneIdx

                                Box(
                                    modifier = Modifier
                                        .weight(1f)
                                        .clip(RoundedCornerShape(12.dp))
                                        .background(
                                            when {
                                                isActive -> Color(0xFF06B6D4).copy(alpha = 0.3f)
                                                isPast -> Color(0xFF10B981).copy(alpha = 0.2f)
                                                else -> Color(0xFF1E293B)
                                            }
                                        )
                                        .border(
                                            width = if (isActive) 1.5.dp else 0.5.dp,
                                            color = if (isActive) Color(0xFF06B6D4) else Color.Transparent,
                                            shape = RoundedCornerShape(12.dp)
                                        )
                                        .clickable {
                                            mirrorViewModel.selectZone(idx)
                                        }
                                        .padding(vertical = 8.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "Z${idx + 1}",
                                        fontSize = 11.sp,
                                        fontWeight = if (isActive) FontWeight.Black else FontWeight.Bold,
                                        color = if (isActive) Color(0xFF67E8F9) else if (isPast) Color(0xFF34D399) else Color(0xFF94A3B8)
                                    )
                                }
                            }
                        }
                    }
                }
            }

            // 5. SPOKEN ZONE SCRIPT & CLINICAL INSTRUCTION CARD
            Card(
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(24.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
                border = CardDefaults.outlinedCardBorder().copy(brush = androidx.compose.ui.graphics.SolidColor(Color(0xFF1E293B)))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Zone ${currentZoneIdx + 1}: ${activeZoneScript.title}",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.ExtraBold,
                            color = Color.White
                        )
                        Text(
                            text = "${activeZoneScript.startTimeSeconds}s Milestone",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF06B6D4)
                        )
                    }

                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(16.dp))
                            .background(Color(0xFF020617))
                            .padding(14.dp)
                    ) {
                        Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                            Text(
                                text = "\"${activeZoneScript.script}\"",
                                fontSize = 13.sp,
                                fontWeight = FontWeight.Medium,
                                color = Color(0xFFE2E8F0)
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                Icon(Icons.Default.CheckCircle, contentDescription = null, tint = Color(0xFF06B6D4), modifier = Modifier.size(14.dp))
                                Text(
                                    text = "Clinical Tip: ${activeZoneScript.clinicalTip}",
                                    fontSize = 11.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = Color(0xFF67E8F9)
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    // 6. REDESIGNED CELEBRATION POPUP MODAL (NO WHITE CLIPPING, FULLY TRANSPARENT OVERLAY)
    if (showCompletionDialog) {
        Dialog(
            onDismissRequest = { showCompletionDialog = false },
            properties = DialogProperties(usePlatformDefaultWidth = false)
        ) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .background(Color(0xCC020617))
                    .padding(24.dp),
                contentAlignment = Alignment.Center
            ) {
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(28.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
                    border = BorderStroke(1.dp, Color(0xFF1E293B))
                ) {
                    Column(
                        modifier = Modifier.padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        // Glow Badge Avatar
                        Box(
                            modifier = Modifier
                                .size(72.dp)
                                .clip(CircleShape)
                                .background(
                                    Brush.radialGradient(
                                        colors = listOf(Color(0xFF06B6D4), Color(0xFF10B981))
                                    )
                                ),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(text = "✨", fontSize = 36.sp)
                        }

                        // Title & Subtitle
                        Column(horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(
                                text = "Brushing Complete!",
                                fontSize = 22.sp,
                                fontWeight = FontWeight.ExtraBold,
                                color = Color.White
                            )
                            Spacer(modifier = Modifier.height(4.dp))
                            Text(
                                text = "Your teeth are sparkling clean!",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color(0xFF34D399)
                            )
                        }

                        // Instruction Steps List
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(16.dp))
                                .background(Color(0xFF020617))
                                .padding(16.dp),
                            verticalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            listOf(
                                "💧 Spit out the toothpaste foam",
                                "🚰 Rinse thoroughly with clean water",
                                "🪥 Wash and store your toothbrush upright"
                            ).forEach { stepText ->
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = Color(0xFF10B981),
                                        modifier = Modifier.size(18.dp)
                                    )
                                    Text(
                                        text = stepText,
                                        fontSize = 13.sp,
                                        color = Color(0xFFE2E8F0),
                                        fontWeight = FontWeight.Medium
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(4.dp))

                        // Action Button: Complete & Return
                        Button(
                            onClick = {
                                showCompletionDialog = false
                                mirrorViewModel.resetTimer()
                                navController.navigate("dashboard")
                            },
                            shape = RoundedCornerShape(16.dp),
                            colors = ButtonDefaults.buttonColors(containerColor = Color.Transparent),
                            contentPadding = PaddingValues(0.dp),
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(52.dp)
                                .background(
                                    brush = Brush.horizontalGradient(
                                        colors = listOf(Color(0xFF10B981), Color(0xFF059669))
                                    ),
                                    shape = RoundedCornerShape(16.dp)
                                )
                        ) {
                            Text(
                                text = "Complete & Return",
                                color = Color.White,
                                fontWeight = FontWeight.Black,
                                fontSize = 16.sp
                            )
                        }
                    }
                }
            }
        }
    }
}
