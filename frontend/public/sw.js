// ToothMate Background Service Worker for Closed-App System Alarms (WhatsApp Style)
const CACHE_NAME = "toothmate-sw-v4";

let activeTimeouts = {};

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    self.clients.claim().then(() => {
      return self.clients.matchAll({ type: "window" }).then((clients) => {
        clients.forEach((client) => {
          client.postMessage({ type: "REQUEST_REMINDER_SETTINGS" });
        });
      });
    })
  );
});

function scheduleAlarmNotification(alarmId, title, body, time24h) {
  if (activeTimeouts[alarmId]) {
    clearTimeout(activeTimeouts[alarmId]);
    delete activeTimeouts[alarmId];
  }

  if (!time24h) return;

  const timeParts = time24h.trim().toUpperCase().match(/(\d{1,2}):(\d{2})/);
  if (!timeParts) return;

  let setH = parseInt(timeParts[1], 10);
  const setM = parseInt(timeParts[2], 10);
  if (time24h.toUpperCase().includes("PM") && setH < 12) setH += 12;
  if (time24h.toUpperCase().includes("AM") && setH === 12) setH = 0;

  const now = new Date();
  let scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    setH,
    setM,
    0,
    0
  );

  if (scheduledTime.getTime() <= now.getTime()) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }

  const delayMs = scheduledTime.getTime() - now.getTime();
  console.log(`[ServiceWorker] ${title} scheduled in ${Math.round(delayMs / 1000)} seconds (At ${scheduledTime.toLocaleTimeString()}).`);

  activeTimeouts[alarmId] = setTimeout(() => {
    self.registration.showNotification(title, {
      body: body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: alarmId,
      requireInteraction: true,
      renotify: true,
      vibrate: [500, 200, 500, 200, 500],
      data: { url: "/mirror" },
      actions: [
        { action: "start_mirror", title: "🪥 Start Guided Session" },
        { action: "dismiss", title: "Dismiss" }
      ]
    });

    // Re-schedule for next day
    scheduleAlarmNotification(alarmId, title, body, time24h);
  }, delayMs);
}

// Listen for updated alarm settings & instant 5-second test triggers from React App
self.addEventListener("message", (event) => {
  if (!event.data) return;

  if (event.data.type === "UPDATE_REMINDER_SETTINGS") {
    const payload = event.data.payload || {};
    
    if (payload.morningActive !== false && payload.morningTime) {
      scheduleAlarmNotification(
        "toothmate-morning-alarm",
        "☀️ Morning Brush Time!",
        "It's time for your morning brushing session! Protect your smile and keep your streak alive. 🪥✨",
        payload.morningTime
      );
    }

    if (payload.nightActive !== false && payload.nightTime) {
      scheduleAlarmNotification(
        "toothmate-night-alarm",
        "🌙 Night Brush Time!",
        "Protect your enamel before bed! Ensure thorough coverage to complete today's goal. ✨",
        payload.nightTime
      );
    }
  }

  if (event.data.type === "SCHEDULE_5SEC_TEST") {
    const { title, body, delayMs } = event.data.payload || {};
    setTimeout(() => {
      self.registration.showNotification(title || "🪥 Time to Brush!", {
        body: body || "Keep your streak going! Tap to start Smart Mirror.",
        icon: "/favicon.ico",
        badge: "/favicon.ico",
        tag: "toothmate-5s-test",
        requireInteraction: true,
        renotify: true,
        vibrate: [500, 200, 500],
        data: { url: "/mirror" },
        actions: [
          { action: "start_mirror", title: "🪥 Start Guided Session" },
          { action: "dismiss", title: "Dismiss" }
        ]
      });
    }, delayMs || 5000);
  }
});

// Open app directly when user clicks OS notification banner or action button
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  if (event.action === "dismiss") return;

  const targetUrl = (event.notification.data && event.notification.data.url) || "/mirror";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
