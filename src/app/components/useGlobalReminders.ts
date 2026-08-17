import { useEffect, useRef } from "react";

export const useGlobalReminders = () => {
  const lastFiredMinute = useRef<string>("");

  useEffect(() => {
    // Ensure default saved times exist in LocalStorage
    if (!localStorage.getItem("morning_time")) {
      localStorage.setItem("morning_time", "08:00");
    }
    if (!localStorage.getItem("night_time")) {
      localStorage.setItem("night_time", "21:00");
    }

    const checkTimeAndTrigger = () => {
      const rawMorning = localStorage.getItem("morning_time") || localStorage.getItem("morningReminderTime") || "08:00";
      const rawNight = localStorage.getItem("night_time") || localStorage.getItem("nightReminderTime") || "21:00";
      const morningActive = localStorage.getItem("morningActive") !== "false";
      const nightActive = localStorage.getItem("nightActive") !== "false";

      const now = new Date();
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hours}:${minutes}`;

      // Helper to format any time string to "HH:mm" 24h format
      const formatHHMM = (tStr: string): string => {
        if (!tStr) return "";
        const clean = tStr.trim();
        const parts = clean.match(/^(\d{1,2}):(\d{2})/);
        if (!parts) return "";
        let h = parseInt(parts[1], 10);
        const m = parseInt(parts[2], 10);
        if (clean.toUpperCase().includes("PM") && h < 12) h += 12;
        if (clean.toUpperCase().includes("AM") && h === 12) h = 0;
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
        window.dispatchEvent(
          new CustomEvent("toothmate-alarm-triggered", {
            detail: {
              title: "☀️ Morning Brush Time!",
              body: "Start your day with a clean, confident smile! Log your morning brushing session now.",
              type: "morning",
              time: currentTime,
            },
          })
        );
      } else if (nightActive && nightTime && currentTime === nightTime) {
        lastFiredMinute.current = currentTime;
        window.dispatchEvent(
          new CustomEvent("toothmate-alarm-triggered", {
            detail: {
              title: "🌙 Night Brush Time!",
              body: "Protect your enamel before bed! Ensure thorough coverage to complete today's goal.",
              type: "night",
              time: currentTime,
            },
          })
        );
      }
    };

    // Run check immediately on mount
    checkTimeAndTrigger();

    // Clean, lightweight interval every 3 seconds
    const interval = setInterval(checkTimeAndTrigger, 3000);

    return () => clearInterval(interval);
  }, []);
};

export default useGlobalReminders;
