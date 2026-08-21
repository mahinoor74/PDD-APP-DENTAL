package com.toothmate.app.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.toothmate.app.data.model.CariesRiskLevel
import com.toothmate.app.ui.theme.RiskHighRed
import com.toothmate.app.ui.theme.RiskLowGreen
import com.toothmate.app.ui.theme.RiskModerateYellow

@Composable
fun RiskBadge(riskLevel: CariesRiskLevel, modifier: Modifier = Modifier) {
    val (bgColor, text) = when (riskLevel) {
        CariesRiskLevel.LOW -> Pair(RiskLowGreen, "LOW RISK")
        CariesRiskLevel.MODERATE -> Pair(RiskModerateYellow, "MODERATE RISK")
        CariesRiskLevel.HIGH -> Pair(RiskHighRed, "HIGH RISK")
    }

    Box(
        modifier = modifier
            .background(color = bgColor, shape = RoundedCornerShape(12.dp))
            .padding(horizontal = 12.dp, vertical = 6.dp)
    ) {
        Text(
            text = text,
            color = Color.White,
            fontWeight = FontWeight.Bold,
            fontSize = 12.sp
        )
    }
}
