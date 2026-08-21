package com.toothmate.app.receiver

import android.app.AlarmManager
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationCompat
import com.toothmate.app.MainActivity
import com.toothmate.app.ToothMateApp
import java.util.Calendar

object NotificationHelper {

    private const val MORNING_ALARM_ID = 2001
    private const val NIGHT_ALARM_ID = 2002

    fun showBrushingNotification(context: Context, title: String, message: String) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("OPEN_SMART_MIRROR", true)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            System.currentTimeMillis().toInt(),
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val builder = NotificationCompat.Builder(context, ToothMateApp.CHANNEL_ID_REMINDERS)
            .setSmallIcon(android.R.drawable.ic_lock_idle_alarm)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)

        val notificationManager =
            context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(System.currentTimeMillis().toInt(), builder.build())
    }

    fun scheduleAlarm(context: Context, timeStr: String, title: String, message: String, requestCode: Int) {
        if (timeStr.isBlank()) return

        try {
            val calendar = parseTimeStringToCalendar(timeStr) ?: return
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as AlarmManager

            val intent = Intent(context, AlarmReceiver::class.java).apply {
                putExtra("ALARM_TITLE", title)
                putExtra("ALARM_MSG", message)
            }

            val pendingIntent = PendingIntent.getBroadcast(
                context,
                requestCode,
                intent,
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            // If time has passed today, schedule for tomorrow
            if (calendar.timeInMillis <= System.currentTimeMillis()) {
                calendar.add(Calendar.DAY_OF_YEAR, 1)
            }

            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
            } else {
                alarmManager.setExact(
                    AlarmManager.RTC_WAKEUP,
                    calendar.timeInMillis,
                    pendingIntent
                )
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    fun scheduleDailyReminders(context: Context, morningTime: String, nightTime: String, morningOn: Boolean, nightOn: Boolean) {
        if (morningOn && morningTime.isNotBlank()) {
            scheduleAlarm(
                context,
                morningTime,
                "☀️ Morning Brush Time!",
                "Start your brushing! It only takes 2 minutes for a clean, confident smile. 🪥✨",
                MORNING_ALARM_ID
            )
        }

        if (nightOn && nightTime.isNotBlank()) {
            scheduleAlarm(
                context,
                nightTime,
                "🌙 Night Brush Time!",
                "Protect your enamel before bed! Complete your 2-minute night toothbrushing routine. ✨",
                NIGHT_ALARM_ID
            )
        }
    }

    private fun parseTimeStringToCalendar(timeStr: String): Calendar? {
        val clean = timeStr.trim()
        val regex = Regex("""^(\d{1,2}):(\d{2})\s*(AM|PM)?$""", RegexOption.IGNORE_CASE)
        val match = regex.find(clean) ?: return null

        var hour = match.groupValues[1].toIntOrNull() ?: return null
        val minute = match.groupValues[2].toIntOrNull() ?: return null
        val ampm = match.groupValues[3].uppercase()

        if (ampm == "PM" && hour < 12) hour += 12
        if (ampm == "AM" && hour == 12) hour = 0

        return Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, hour)
            set(Calendar.MINUTE, minute)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }
    }
}
