import { useEffect, useRef } from "react";
import { triggerInstantNotification } from "./useReminders";

export const useGlobalReminders = () => {
  const lastFiredMinute = useRef<string>("");

  useEffect(() => {
    // Ensure default saved times exist in LocalStorage
    if (!localStorage.getItem("morning_time")) {
      localStorage.setItem("morning_time", "07:30");
    }
    if (!localStorage.getItem("night_time")) {
      localStorage.setItem("night_time", "21:30");
    }

    const checkTimeAndTrigger = () => {
      const rawMorning = localStorage.getItem("morning_time") || localStorage.getItem("morningReminderTime") || "07:30";
      const rawNight = localStorage.getItem("night_time") || localStorage.getItem("nightReminderTime") || "21:30";
      const morningActive = localStorage.getItem("morningActive") !== "false";
      const nightActive = localStorage.getItem("nightActive") !== "false";

      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

      // Helper to format any time string ("07:30", "7:30 AM", "9:30 PM", "09:39 AM") to "HH:mm" 24h format
      const formatHHMM = (tStr: string): string => {
        if (!tStr) return "";
        const clean = tStr.trim();
        const parts = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
        if (!parts) return "";
        let h = parseInt(parts[1], 10);
        const m = parseInt(parts[2], 10);
        const ampm = parts[3] ? parts[3].toUpperCase() : null;

        if (ampm === "PM" && h < 12) h += 12;
        if (ampm === "AM" && h === 12) h = 0;
        return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
      };

      const morningTime = formatHHMM(rawMorning);
      const nightTime = formatHHMM(rawNight);

      // Avoid firing multiple times within the same minute
      if (lastFiredMinute.current === currentTime) {
        return;
      }

      if (morningActive && morningTime && currentTime === morningTime) {
        lastFiredMinute.current = currentTime;
        triggerInstantNotification(
          "☀️ Morning Brush Time!",
          "Start your day with a clean, confident smile! Log your morning toothbrushing session now.",
          false
        );
      } else if (nightActive && nightTime && currentTime === nightTime) {
        lastFiredMinute.current = currentTime;
        triggerInstantNotification(
          "🌙 Night Brush Time!",
          "Protect your enamel before bed! Complete your night toothbrushing routine now.",
          false
        );
      }
    };

    // Run check immediately on mount
    checkTimeAndTrigger();

    // Clean, lightweight interval every 1 second for exact instant trigger
    const interval = setInterval(checkTimeAndTrigger, 1000);

    return () => clearInterval(interval);
  }, []);
};

export default useGlobalReminders;
