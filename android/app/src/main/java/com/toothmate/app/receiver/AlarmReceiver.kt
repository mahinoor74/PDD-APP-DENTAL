package com.toothmate.app.receiver

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class AlarmReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val title = intent.getStringExtra("ALARM_TITLE") ?: "🪥 Toothbrushing Reminder"
        val message = intent.getStringExtra("ALARM_MSG") ?: "Time for your 2-minute ToothMate toothbrushing session!"
        NotificationHelper.showBrushingNotification(context, title, message)
    }
}
