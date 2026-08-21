import { useEffect, useRef } from "react";
import { LocalNotifications } from "@capacitor/local-notifications";

const CHANNEL_ID = "reminders";

// Audio chime helper using Web Audio API (works without external asset files)
export const playAlarmChime = () => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    // Play two pleasant notification notes
    const playNote = (freq: number, startTime: number, duration: number) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.15, ctx.currentTime + startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + startTime);
      osc.stop(ctx.currentTime + startTime + duration);
    };

    playNote(587.33, 0, 0.25);   // D5
    playNote(880.00, 0.2, 0.45);  // A5
  } catch (e) {
    // Ignore audio error
  }
};

// Create Android High-Importance Notification Channel
const createAndroidChannel = async () => {
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "Hygiene Reminders",
      description: "Pop-up notifications for your morning & night dental habits",
      importance: 5, // 5 = High importance (causes Heads-Up banner pop-up on Android)
      visibility: 1, // Public lock screen visibility
      sound: "default",
      vibration: true,
    });
  } catch (e) {
    console.log("Channel setup handled or non-Capacitor environment.", e);
  }
};

// Service Worker Background Registration & Synchronization
export const syncSettingsWithServiceWorker = () => {
  if ("serviceWorker" in navigator) {
    const morningTime = localStorage.getItem("morningReminderTime") || localStorage.getItem("morning_time") || "07:30";
    const nightTime = localStorage.getItem("nightReminderTime") || localStorage.getItem("night_time") || "21:45";
    const morningActive = localStorage.getItem("morningActive") !== "false";
    const nightActive = localStorage.getItem("nightActive") !== "false";

    const payload = { morningTime, nightTime, morningActive, nightActive };

    if (navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "UPDATE_REMINDER_SETTINGS",
        payload: payload
      });
    }

    navigator.serviceWorker.ready.then((reg) => {
      if (reg.active) reg.active.postMessage({ type: "UPDATE_REMINDER_SETTINGS", payload });
      if (reg.waiting) reg.waiting.postMessage({ type: "UPDATE_REMINDER_SETTINGS", payload });
      if (reg.installing) reg.installing.postMessage({ type: "UPDATE_REMINDER_SETTINGS", payload });
    });
  }
};

export const registerServiceWorkerReminders = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      console.log("ToothMate Background Service Worker active:", reg.scope);

      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "REQUEST_REMINDER_SETTINGS") {
          syncSettingsWithServiceWorker();
        }
      });

      syncSettingsWithServiceWorker();
    } catch (e) {
      console.warn("Service Worker registration fallback:", e);
    }
  }
};

// Explicitly check & request Notification permission from Capacitor and Browser
export const requestCapacitorPermission = async (): Promise<boolean> => {
  let granted = false;

  // 1. Capacitor Native Notification permission request sync
  try {
    let status = await LocalNotifications.checkPermissions();
    if (status.display !== "granted") {
      const perm = await LocalNotifications.requestPermissions();
      status = perm;
    }
    if (status.display === "granted") {
      granted = true;
      await createAndroidChannel();
    }
  } catch (e) {
    console.warn("Capacitor permissions request fallback to browser API", e);
  }

  // 2. Web Browser Notification permission request sync
  try {
    if (typeof window !== "undefined" && "Notification" in window && window.Notification) {
      if (window.Notification.permission === "granted") {
        granted = true;
      } else if (window.Notification.permission !== "denied") {
        try {
          const result = await window.Notification.requestPermission();
          if (result === "granted") granted = true;
        } catch (e) {
          console.warn("Browser Notification permission failed", e);
        }
      }
    }
  } catch (e) {}

  await registerServiceWorkerReminders();
  return granted;
};

// Request Notification Permission from Browser and Capacitor
export const requestNotificationPermission = async () => {
  return await requestCapacitorPermission();
};

// Parse time string e.g. "07:30" or "21:30" or "9:30 PM"
export const parseTimeString = (timeStr: string) => {
  if (!timeStr) return { hour: 7, minute: 30 };
  const clean = timeStr.trim().toUpperCase();
  const match = clean.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/);
  if (!match) return { hour: 7, minute: 30 };
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;
  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;
  return { hour, minute };
};

export function getNextAlarmDate(hour: number, minute: number): Date {
  const now = new Date();
  const alarm = new Date();
  alarm.setHours(hour, minute, 0, 0);
  if (alarm.getTime() <= now.getTime()) {
    alarm.setDate(alarm.getDate() + 1); // Schedule for tomorrow if time already passed today
  }
  return alarm;
}

// Schedule daily recurring morning & evening reminders
export const scheduleDailyReminders = async (morningTimeStr: string, eveningTimeStr: string) => {
  const morning = parseTimeString(morningTimeStr);
  const evening = parseTimeString(eveningTimeStr);

  try {
    await requestCapacitorPermission();
    await createAndroidChannel();

    try {
      await LocalNotifications.cancel({ notifications: [{ id: 1001 }, { id: 1002 }] });
    } catch (e) {}

    const morningDate = getNextAlarmDate(morning.hour, morning.minute);
    const eveningDate = getNextAlarmDate(evening.hour, evening.minute);

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "☀️ Morning Brush Time!",
          body: "Start your day with a clean, confident smile! Log your morning brushing session now.",
          id: 1001,
          schedule: {
            at: morningDate,
            every: "day",
            allowWhileIdle: true,
            on: { hour: morning.hour, minute: morning.minute }
          },
          channelId: CHANNEL_ID,
          sound: "default",
          actionTypeId: "",
          extra: { alarmType: "morning" }
        },
        {
          title: "🌙 Night Brush Time!",
          body: "Protect your enamel before bed! Ensure thorough coverage to complete today's goal.",
          id: 1002,
          schedule: {
            at: eveningDate,
            every: "day",
            allowWhileIdle: true,
            on: { hour: evening.hour, minute: evening.minute }
          },
          channelId: CHANNEL_ID,
          sound: "default",
          actionTypeId: "",
          extra: { alarmType: "night" }
        }
      ]
    });
    console.log(`✅ Native OS Daily reminders scheduled: Morning (${morning.hour}:${morning.minute} -> ${morningDate.toLocaleTimeString()}), Evening (${evening.hour}:${evening.minute} -> ${eveningDate.toLocaleTimeString()})`);
  } catch (e) {
    console.error("Local Notification Schedule Error:", e);
  }
};

// Schedule 5-second test notification
export const schedule5SecTestNotification = async () => {
  const title = "🪥 ToothMate Hygiene Reminder";
  const body = "Great job! Your notification system is working perfectly.";
  const fireDate = new Date(Date.now() + 5000);
  const notificationId = 9999;

  await requestCapacitorPermission();
  await createAndroidChannel();

  try {
    const status = await LocalNotifications.checkPermissions();
    if (status.display !== "granted") {
      await LocalNotifications.requestPermissions();
    }
    
    try { await LocalNotifications.cancel({ notifications: [{ id: notificationId }] }); } catch (e) {}

    await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body,
          id: notificationId,
          schedule: { at: fireDate, allowWhileIdle: true },
          channelId: CHANNEL_ID,
          sound: "default",
          actionTypeId: "",
          extra: { url: "/mirror" }
        },
      ],
    });
  } catch (e) {
    console.warn("Capacitor 5s notification schedule fallback:", e);
  }

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    try {
      navigator.serviceWorker.controller.postMessage({
        type: "SCHEDULE_5SEC_TEST",
        payload: { title, body, delayMs: 5000 }
      });
    } catch (e) {}
  }

  setTimeout(() => {
    triggerInstantNotification(title, body, true);
  }, 5000);
};

// Speech synthesis alert helper
export const speakAlarm = (text: string) => {
  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  } catch (e) {
    console.warn("Speech synthesis unavailable for alarm", e);
  }
};

// Helper to trigger an instant pop-up notification test & live alarm
export const triggerInstantNotification = async (title: string, message: string, isTest: boolean = false) => {
  // Play sound & vibration feedback immediately
  playAlarmChime();
  speakAlarm(`${title}. ${message}`);
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try { navigator.vibrate([300, 100, 300]); } catch (e) {}
  }

  // Dispatch custom event for in-app floating pop-up alarm modal
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("toothmate-alarm-triggered", {
        detail: { 
          title, 
          message, 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          badge: isTest ? "MANUAL TEST ALERT" : "SCHEDULED HYGIENE ALARM"
        }
      })
    );
  }

  // 1. Try Capacitor Local Notifications (Android / Native pop-up heads-up notification)
  try {
    await requestCapacitorPermission();
    await createAndroidChannel();
    await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: message,
          id: Math.floor(Math.random() * 900000) + 100000,
          schedule: { at: new Date(Date.now() + 1000), allowWhileIdle: true },
          channelId: CHANNEL_ID,
          sound: "default",
          actionTypeId: "",
          extra: null
        },
      ],
    });
  } catch (e) {
    console.warn("Capacitor local notification schedule fallback:", e);
  }

  // 2. Service Worker or Browser Notification fallback
  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    try {
      const reg = await navigator.serviceWorker.ready;
      reg.showNotification(title, {
        body: message,
        icon: "/favicon.ico",
        tag: isTest ? "toothmate-test-alarm" : "toothmate-alarm",
        requireInteraction: true,
        data: { url: "/mirror" }
      });
      return;
    } catch (e) {}
  }

  try {
    if (typeof window !== "undefined" && "Notification" in window && window.Notification) {
      if (window.Notification.permission === "granted") {
        new window.Notification(title, {
          body: message,
          icon: "/favicon.ico",
        });
      }
    }
  } catch (e) {}
};

// Schedule Capacitor Local Notifications at specific 24h time ("07:30", "22:45")
export const scheduleCapacitorReminder = async (
  id: number,
  title: string,
  time24h: string,
  bodyText?: string,
  isActive: boolean = true
) => {
  syncSettingsWithServiceWorker();

  try {
    await LocalNotifications.cancel({ notifications: [{ id }] });
  } catch (e) {}

  if (!isActive || !time24h) {
    console.log(`⏰ Notification ID ${id} disabled or cleared.`);
    return;
  }

  try {
    await createAndroidChannel();

    const clean = time24h.trim().toUpperCase();
    const timeParts = clean.match(/(\d{1,2}):(\d{2})/);
    if (!timeParts) return;

    let hours = parseInt(timeParts[1], 10);
    const minutes = parseInt(timeParts[2], 10);

    if (clean.includes("PM") && hours < 12) hours += 12;
    if (clean.includes("AM") && hours === 12) hours = 0;

    const now = new Date();
    const scheduledTime = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      hours,
      minutes,
      0,
      0
    );

    if (scheduledTime.getTime() <= now.getTime()) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const defaultBody = "It's time for your daily brushing session! Protect your smile and keep your streak alive. 🪥✨";

    await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: bodyText || defaultBody,
          id: id,
          schedule: {
            at: scheduledTime,
            every: "day",
            allowWhileIdle: true,
            on: {
              hour: hours,
              minute: minutes
            }
          },
          channelId: CHANNEL_ID,
          sound: "default",
          actionTypeId: "",
          extra: { alarmId: id, time24h }
        },
      ],
    });
    console.log(`✅ Native Mobile Notification scheduled successfully [ID ${id}] for ${scheduledTime.toLocaleTimeString()}`);
  } catch (e) {
    console.warn("Capacitor schedule exception handled:", e);
  }
};

// Re-export useGlobalReminders hook from dedicated useGlobalReminders module
export { useGlobalReminders, default as useGlobalRemindersDefault } from "./useGlobalReminders";
