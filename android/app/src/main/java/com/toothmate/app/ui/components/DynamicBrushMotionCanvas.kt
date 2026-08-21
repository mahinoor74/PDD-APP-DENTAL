package com.toothmate.app.ui.components

import androidx.compose.animation.core.*
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.CornerRadius
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlin.math.cos
import kotlin.math.sin

@Composable
fun DynamicBrushMotionCanvas(
    motionType: String,
    angleDegrees: Float,
    activeZoneIndex: Int,
    isBrushing: Boolean,
    quadrantName: String,
    isPrepPhase: Boolean = false,
    isFinishedPhase: Boolean = false,
    modifier: Modifier = Modifier
) {
    // Infinite transition for continuous motion animations
    val infiniteTransition = rememberInfiniteTransition(label = "BrushMotion")
    val animationPhase by infiniteTransition.animateFloat(
        initialValue = 0f,
        targetValue = 360f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 2000, easing = LinearEasing),
            repeatMode = RepeatMode.Restart
        ),
        label = "phase"
    )

    // Pulse animation for prep water drop / finish rinse
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 0.8f,
        targetValue = 1.2f,
        animationSpec = infiniteRepeatable(
            animation = tween(durationMillis = 1000, easing = FastOutSlowInEasing),
            repeatMode = RepeatMode.Reverse
        ),
        label = "pulse"
    )

    // Active zone coordinates mapping (Zones 0-5)
    val activeZoneCoordinates = when (activeZoneIndex) {
        0 -> Offset(0.24f, 0.35f) // Upper Right Arch (45° angle)
        1 -> Offset(0.50f, 0.22f) // Upper Front Incisors
        2 -> Offset(0.76f, 0.35f) // Upper Left Arch
        3 -> Offset(0.76f, 0.68f) // Lower Left Arch (upward tilt)
        4 -> Offset(0.50f, 0.82f) // Lower Front Incisors
        else -> Offset(0.50f, 0.50f) // Flat Molar Chewing Tables
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(250.dp)
            .clip(RoundedCornerShape(24.dp))
            .background(Color(0xFF020617))
            .border(1.5.dp, Color(0xFF06B6D4).copy(alpha = 0.4f), RoundedCornerShape(24.dp))
            .padding(12.dp)
    ) {
        // Top Header
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .align(Alignment.TopStart),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = when {
                    isPrepPhase -> "Prep: Apply Paste & Wet Brush"
                    isFinishedPhase -> "Rinse & Clean Brush Head"
                    else -> "Zone ${activeZoneIndex + 1}: $quadrantName"
                },
                color = Color(0xFF67E8F9),
                fontWeight = FontWeight.Black,
                fontSize = 12.sp
            )
            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF1E293B))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text("${angleDegrees.toInt()}° Angle", color = Color.White, fontSize = 10.sp, fontWeight = FontWeight.Bold)
                }
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(8.dp))
                        .background(Color(0xFF06B6D4).copy(alpha = 0.25f))
                        .padding(horizontal = 8.dp, vertical = 2.dp)
                ) {
                    Text(motionType.uppercase().replace("_", " "), color = Color(0xFF67E8F9), fontSize = 10.sp, fontWeight = FontWeight.Black)
                }
            }
        }

        // Canvas Rendering Stage
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .padding(top = 28.dp, bottom = 22.dp)
        ) {
            val width = size.width
            val height = size.height

            // 1. PRE-SESSION PASTE & WATER PREPARATION ANIMATION
            if (isPrepPhase) {
                val centerX = width * 0.5f
                val centerY = height * 0.5f

                // Toothbrush Handle & Head
                drawRoundRect(
                    color = Color(0xFF0284C7),
                    topLeft = Offset(centerX - 12.dp.toPx(), centerY + 20.dp.toPx()),
                    size = Size(24.dp.toPx(), 70.dp.toPx()),
                    cornerRadius = CornerRadius(6.dp.toPx())
                )
                drawRoundRect(
                    color = Color.White,
                    topLeft = Offset(centerX - 20.dp.toPx(), centerY - 30.dp.toPx()),
                    size = Size(40.dp.toPx(), 50.dp.toPx()),
                    cornerRadius = CornerRadius(10.dp.toPx())
                )
                // Bristles
                drawRoundRect(
                    color = Color(0xFF06B6D4),
                    topLeft = Offset(centerX - 15.dp.toPx(), centerY - 25.dp.toPx()),
                    size = Size(30.dp.toPx(), 40.dp.toPx()),
                    cornerRadius = CornerRadius(4.dp.toPx())
                )
                // Animated Pea-Sized Toothpaste Ribbon
                drawOval(
                    color = Color(0xFF38BDF8),
                    topLeft = Offset(centerX - 10.dp.toPx(), centerY - 20.dp.toPx()),
                    size = Size(20.dp.toPx() * pulseScale, 14.dp.toPx() * pulseScale)
                )
                // Water Drops
                drawCircle(
                    color = Color(0xFF67E8F9).copy(alpha = 0.8f),
                    radius = 6.dp.toPx() * pulseScale,
                    center = Offset(centerX, centerY - 50.dp.toPx())
                )
                return@Canvas
            }

            // 2. POST-SESSION RINSE ANIMATION
            if (isFinishedPhase) {
                val centerX = width * 0.5f
                val centerY = height * 0.5f

                // Rinsing Water Swirl Circle
                drawCircle(
                    color = Color(0xFF06B6D4).copy(alpha = 0.25f),
                    radius = 55.dp.toPx() * pulseScale,
                    center = Offset(centerX, centerY)
                )
                drawCircle(
                    color = Color(0xFF38BDF8),
                    radius = 45.dp.toPx(),
                    center = Offset(centerX, centerY),
                    style = Stroke(width = 4.dp.toPx())
                )
                // Clean Water Drops Swirling
                val rad = Math.toRadians(animationPhase.toDouble())
                val dropX = centerX + (cos(rad) * 45.dp.toPx()).toFloat()
                val dropY = centerY + (sin(rad) * 45.dp.toPx()).toFloat()
                drawCircle(color = Color.White, radius = 7.dp.toPx(), center = Offset(dropX, dropY))
                return@Canvas
            }

            // 3. ANATOMICAL MOUTH MODEL & TECHNIQUE MOTION GESTURES
            val isTongueMode = motionType == "tongue_scrape"
            val isFlossMode = motionType == "c_shape_floss"

            if (isTongueMode) {
                // Tongue Visualizer
                val tonguePath = Path().apply {
                    moveTo(width * 0.30f, height * 0.15f)
                    cubicTo(
                        width * 0.30f, height * 0.05f,
                        width * 0.70f, height * 0.05f,
                        width * 0.70f, height * 0.15f
                    )
                    cubicTo(
                        width * 0.75f, height * 0.85f,
                        width * 0.25f, height * 0.85f,
                        width * 0.30f, height * 0.15f
                    )
                }
                drawPath(path = tonguePath, color = Color(0xFFF43F5E))
                drawPath(path = tonguePath, color = Color(0xFFBE123C), style = Stroke(width = 3.dp.toPx()))

                // Active Scraper Position
                val scrapeY = height * (0.20f + activeZoneIndex * 0.10f)
                val strokeOffset = if (isBrushing) (sin(Math.toRadians(animationPhase.toDouble())) * 15.dp.toPx()).toFloat() else 0f

                // Scraper tool
                drawRoundRect(
                    color = Color(0xFF0284C7),
                    topLeft = Offset(width * 0.48f, scrapeY + strokeOffset + 10.dp.toPx()),
                    size = Size(12.dp.toPx(), 45.dp.toPx()),
                    cornerRadius = CornerRadius(4.dp.toPx())
                )
                drawOval(
                    color = Color(0xFF06B6D4),
                    topLeft = Offset(width * 0.35f, scrapeY + strokeOffset - 15.dp.toPx()),
                    size = Size(width * 0.30f, 25.dp.toPx()),
                    style = Stroke(width = 4.dp.toPx())
                )
                return@Canvas
            }

            if (isFlossMode) {
                // Close-Up Interdental Teeth
                drawRoundRect(
                    color = Color.White,
                    topLeft = Offset(width * 0.22f, height * 0.20f),
                    size = Size(width * 0.26f, height * 0.60f),
                    cornerRadius = CornerRadius(16.dp.toPx())
                )
                drawRoundRect(
                    color = Color.White,
                    topLeft = Offset(width * 0.52f, height * 0.20f),
                    size = Size(width * 0.26f, height * 0.60f),
                    cornerRadius = CornerRadius(16.dp.toPx())
                )
                // Gum Margin
                val flossGumPath = Path().apply {
                    moveTo(width * 0.15f, height * 0.20f)
                    cubicTo(
                        width * 0.35f, height * 0.42f,
                        width * 0.65f, height * 0.42f,
                        width * 0.85f, height * 0.20f
                    )
                    lineTo(width * 0.85f, height * 0.10f)
                    lineTo(width * 0.15f, height * 0.10f)
                }
                drawPath(path = flossGumPath, color = Color(0xFFF43F5E))

                // C-Shape Floss Wire Animation
                val flossY = height * 0.30f + if (isBrushing) (sin(Math.toRadians(animationPhase.toDouble())) * 15.dp.toPx()).toFloat() else 0f
                val flossCurvePath = Path().apply {
                    moveTo(width * 0.40f, flossY - 20.dp.toPx())
                    cubicTo(
                        width * 0.47f, flossY + 10.dp.toPx(),
                        width * 0.53f, flossY + 10.dp.toPx(),
                        width * 0.60f, flossY - 20.dp.toPx()
                    )
                }
                drawPath(
                    path = flossCurvePath,
                    color = Color(0xFF38BDF8),
                    style = Stroke(width = 4.dp.toPx())
                )
                return@Canvas
            }

            // DEFAULT ANATOMICAL FULL DENTAL ARCH MODEL
            // Upper Gum Arch
            val upperGumPath = Path().apply {
                moveTo(width * 0.12f, height * 0.38f)
                cubicTo(
                    width * 0.12f, height * 0.08f,
                    width * 0.88f, height * 0.08f,
                    width * 0.88f, height * 0.38f
                )
            }
            drawPath(path = upperGumPath, color = Color(0xFFF43F5E).copy(alpha = 0.85f), style = Stroke(width = 26.dp.toPx()))

            // Lower Gum Arch
            val lowerGumPath = Path().apply {
                moveTo(width * 0.12f, height * 0.62f)
                cubicTo(
                    width * 0.12f, height * 0.92f,
                    width * 0.88f, height * 0.92f,
                    width * 0.88f, height * 0.62f
                )
            }
            drawPath(path = lowerGumPath, color = Color(0xFFF43F5E).copy(alpha = 0.85f), style = Stroke(width = 26.dp.toPx()))

            // Upper Teeth (Incisors, Canines, Premolars, Molars)
            val teethCount = 9
            for (i in 0 until teethCount) {
                val fraction = 0.15f + (i.toFloat() / (teethCount - 1)) * 0.70f
                val tx = fraction * width
                val ty = height * 0.32f
                drawRoundRect(
                    color = Color.White,
                    topLeft = Offset(tx - 10.dp.toPx(), ty - 10.dp.toPx()),
                    size = Size(20.dp.toPx(), 20.dp.toPx()),
                    cornerRadius = CornerRadius(6.dp.toPx())
                )
            }

            // Lower Teeth
            for (i in 0 until teethCount) {
                val fraction = 0.15f + (i.toFloat() / (teethCount - 1)) * 0.70f
                val tx = fraction * width
                val ty = height * 0.68f
                drawRoundRect(
                    color = Color.White,
                    topLeft = Offset(tx - 10.dp.toPx(), ty - 10.dp.toPx()),
                    size = Size(20.dp.toPx(), 20.dp.toPx()),
                    cornerRadius = CornerRadius(6.dp.toPx())
                )
            }

            // Orthodontic Wires for Charters
            if (motionType == "reverse_angle_vibrate") {
                val upperWire = Path().apply {
                    moveTo(width * 0.15f, height * 0.32f)
                    cubicTo(width * 0.15f, height * 0.10f, width * 0.85f, height * 0.10f, width * 0.85f, height * 0.32f)
                }
                drawPath(path = upperWire, color = Color(0xFF94A3B8), style = Stroke(width = 2.dp.toPx()))
                val lowerWire = Path().apply {
                    moveTo(width * 0.15f, height * 0.68f)
                    cubicTo(width * 0.15f, height * 0.90f, width * 0.85f, height * 0.90f, width * 0.85f, height * 0.68f)
                }
                drawPath(path = lowerWire, color = Color(0xFF94A3B8), style = Stroke(width = 2.dp.toPx()))
            }

            // Active Zone Highlight Box
            val targetX = activeZoneCoordinates.x * width
            val targetY = activeZoneCoordinates.y * height

            drawCircle(
                color = Color(0xFF06B6D4),
                radius = 26.dp.toPx(),
                center = Offset(targetX, targetY),
                style = Stroke(width = 3.dp.toPx())
            )

            // Motion animation offsets based on motionType
            val rad = Math.toRadians(animationPhase.toDouble())
            var offsetX = 0f
            var offsetY = 0f

            if (isBrushing) {
                when (motionType) {
                    "vibrate_sweep" -> {
                        offsetX = (sin(rad * 4) * 4.dp.toPx()).toFloat()
                        offsetY = (-cos(rad) * 12.dp.toPx()).toFloat()
                    }
                    "blanch_roll" -> {
                        offsetY = (-sin(rad) * 14.dp.toPx()).toFloat()
                    }
                    "reverse_angle_vibrate" -> {
                        offsetX = (sin(rad * 5) * 5.dp.toPx()).toFloat()
                        offsetY = (cos(rad * 5) * 5.dp.toPx()).toFloat()
                    }
                    "wide_circles" -> {
                        offsetX = (cos(rad) * 16.dp.toPx()).toFloat()
                        offsetY = (sin(rad) * 16.dp.toPx()).toFloat()
                    }
                    "margin_sweep" -> {
                        offsetX = (cos(rad * 2) * 10.dp.toPx()).toFloat()
                    }
                    "gum_to_crown_roll" -> {
                        offsetY = (-sin(rad) * 15.dp.toPx()).toFloat()
                    }
                }
            }

            val brushCenterX = targetX + offsetX
            val brushCenterY = targetY + offsetY

            // Draw Toothbrush Tool Head rotated by angleDegrees
            rotate(degrees = angleDegrees, pivot = Offset(brushCenterX, brushCenterY)) {
                // Handle
                drawRoundRect(
                    color = Color(0xFF0284C7),
                    topLeft = Offset(brushCenterX - 6.dp.toPx(), brushCenterY + 10.dp.toPx()),
                    size = Size(12.dp.toPx(), 45.dp.toPx()),
                    cornerRadius = CornerRadius(4.dp.toPx())
                )
                // Head
                drawRoundRect(
                    color = Color.White,
                    topLeft = Offset(brushCenterX - 10.dp.toPx(), brushCenterY - 20.dp.toPx()),
                    size = Size(20.dp.toPx(), 30.dp.toPx()),
                    cornerRadius = CornerRadius(6.dp.toPx())
                )
                // Bristles
                drawRoundRect(
                    color = Color(0xFF06B6D4),
                    topLeft = Offset(brushCenterX - 8.dp.toPx(), brushCenterY - 16.dp.toPx()),
                    size = Size(16.dp.toPx(), 22.dp.toPx()),
                    cornerRadius = CornerRadius(3.dp.toPx())
                )
            }
        }

        // Footer Clinical Angle
        Text(
            text = "Clinical Alignment: ${angleDegrees.toInt()}° Sulcular Alignment • 150g Optimal Pressure",
            color = Color(0xFF94A3B8),
            fontSize = 10.sp,
            fontWeight = FontWeight.Medium,
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 2.dp)
        )
    }
}
