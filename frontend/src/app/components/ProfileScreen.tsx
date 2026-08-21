import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, ArrowLeft, Bell, Lightbulb, RefreshCw, ChevronRight, Moon, Sun, 
  Check, LogOut, Sparkles, Edit3, PhoneCall, CheckCircle, Clock, Volume2, AlertCircle
} from "lucide-react";
import { useLanguage } from "./LanguageContext";
import { 
  scheduleDailyReminders, 
  triggerInstantNotification, 
  requestCapacitorPermission,
  syncSettingsWithServiceWorker,
  scheduleCapacitorReminder
} from "./useReminders";

const MOTIVATIONAL_TIPS = [
  {
    id: 1,
    category: "DAILY HABITS",
    title: "2-Minute Rule",
    text: "Brushing twice daily for 2 full minutes removes 99% of soft plaque buildup and maintains your natural white smile."
  },
  {
    id: 2,
    category: "INTERDENTAL CARE",
    title: "Reach Hidden Surfaces",
    text: "Flossing once a day reaches 35% of tooth surfaces that toothbrush bristles can never access."
  },
  {
    id: 3,
    category: "BREATH FRESHNESS",
    title: "Clean Your Tongue",
    text: "Gently cleaning your tongue from back to front eliminates over 85% of bad breath bacteria."
  },
  {
    id: 4,
    category: "BRISTLE HYGIENE",
    title: "Rotate Your Brush",
    text: "Replace your toothbrush head every 3 months or as soon as bristles flare to prevent germ accumulation."
  },
  {
    id: 5,
    category: "GUM RECOVERY",
    title: "Sulcular 45° Angle",
    text: "Positioning bristles at a 45-degree angle to the gum line gently cleans the sulcus without receding gums."
  },
  {
    id: 6,
    category: "ENAMEL PROTECTION",
    title: "Wait 30 Mins After Eating",
    text: "Wait 30 minutes after acidic foods before brushing to prevent scrubbing weakened enamel."
  },
  {
    id: 7,
    category: "DENTAL CONSISTENCY",
    title: "0.3% of Your Day",
    text: "4 minutes of daily brushing is just 0.3% of your day—a tiny investment for a lifetime of healthy teeth!"
  }
];

// Helper to convert 24h "HH:mm" to 12h "07:30 AM" or "09:30 PM"
const formatTo12Hour = (time24: string): string => {
  if (!time24) return "07:30 AM";
  const clean = time24.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return time24;
  let hour = parseInt(match[1], 10);
  const minute = match[2];
  let period = match[3] ? match[3].toUpperCase() : null;

  if (!period) {
    period = hour >= 12 ? "PM" : "AM";
    if (hour > 12) hour -= 12;
    if (hour === 0) hour = 12;
  }
  return `${String(hour).padStart(2, "0")}:${minute} ${period}`;
};

// Helper to convert any time string ("07:30", "7:30 AM", "09:30 PM", "21:30") to 24h "HH:mm"
const formatTo24Hour = (timeStr: string): string => {
  if (!timeStr) return "07:30";
  const clean = timeStr.trim();
  const match = clean.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  if (!match) return "07:30";
  let hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const ampm = match[3] ? match[3].toUpperCase() : null;

  if (ampm === "PM" && hour < 12) hour += 12;
  if (ampm === "AM" && hour === 12) hour = 0;

  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
};

// Helper to extract 12-hour hour string "01" to "12" from 24h "HH:mm"
const getHour12Str = (time24: string): string => {
  if (!time24) return "07";
  const parts = time24.split(":");
  let h = parseInt(parts[0] || "7", 10);
  if (h > 12) h -= 12;
  if (h === 0) h = 12;
  return String(h).padStart(2, "0");
};

// Helper to extract minute string "00" to "59" from 24h "HH:mm"
const getMinuteStr = (time24: string): string => {
  if (!time24) return "30";
  const parts = time24.split(":");
  const m = parseInt(parts[1] || "30", 10);
  return String(m).padStart(2, "0");
};

// Helper to extract AM/PM from 24h "HH:mm"
const getAmPmStr = (time24: string): "AM" | "PM" => {
  if (!time24) return "AM";
  const parts = time24.split(":");
  const h = parseInt(parts[0] || "7", 10);
  return h >= 12 ? "PM" : "AM";
};

// Build 24h time string from typed hour, minute, and AM/PM
const build24HourTime = (h12Str: string, mStr: string, ampm: "AM" | "PM"): string => {
  let h = parseInt(h12Str || "7", 10);
  let m = parseInt(mStr || "0", 10);

  if (isNaN(h) || h < 1) h = 1;
  if (h > 12) h = 12;
  if (isNaN(m) || m < 0) m = 0;
  if (m > 59) m = 59;

  if (ampm === "PM" && h < 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;

  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
};

// Helper to step hour up or down (24-hour time string)
const stepHour = (current24: string, direction: "up" | "down"): string => {
  const parts = current24.split(":");
  let h = parseInt(parts[0] || "7", 10);
  const m = parts[1] || "30";

  if (direction === "up") {
    h = (h + 1) % 24;
  } else {
    h = (h - 1 + 24) % 24;
  }
  return `${String(h).padStart(2, "0")}:${m}`;
};

// Helper to step minute up or down (24-hour time string)
const stepMinute = (current24: string, direction: "up" | "down"): string => {
  const parts = current24.split(":");
  const h = parts[0] || "07";
  let m = parseInt(parts[1] || "30", 10);

  if (direction === "up") {
    m = (m + 1) % 60;
  } else {
    m = (m - 1 + 60) % 60;
  }
  return `${h}:${String(m).padStart(2, "0")}`;
};

// Helper to toggle AM / PM
const toggleAmPm = (current24: string): string => {
  const parts = current24.split(":");
  let h = parseInt(parts[0] || "7", 10);
  const m = parts[1] || "30";

  if (h >= 12) {
    h -= 12;
  } else {
    h += 12;
  }
  return `${String(h).padStart(2, "0")}:${m}`;
};

export default function ProfileScreen() {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId") || "32";
  const { t } = useLanguage();
  
  // Theme Mode State ('light' | 'dark')
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "light");
  const isDark = theme === "dark";

  // Dynamic Profile States
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "Mahinoor");
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("userEmail") || "user@toothmate.ai");
  const [userMode, setUserMode] = useState(() => localStorage.getItem("userAgeGroup") || "Adult Mode");
  const [userTechnique, setUserTechnique] = useState(() => localStorage.getItem("recommendedTechnique") || "Modified Bass Technique");

  // Modal & Notification Overlay States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showSaveSuccessModal, setShowSaveSuccessModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Form Inputs
  const [editNameInput, setEditNameInput] = useState(userName);
  const [editAgeGroupInput, setEditAgeGroupInput] = useState(userMode);
  const [editTechniqueInput, setEditTechniqueInput] = useState(userTechnique);

  const API_BASE_URL = "http://localhost:8000/api";

  // Scheduled Alarm Times stored in 24-hour HH:mm format
  const [morningTime, setMorningTime] = useState<string>(() => {
    const saved = localStorage.getItem("morning_time") || localStorage.getItem("morningReminderTime") || "07:30";
    return formatTo24Hour(saved);
  });

  const [nightTime, setNightTime] = useState<string>(() => {
    const saved = localStorage.getItem("night_time") || localStorage.getItem("nightReminderTime") || "21:30";
    return formatTo24Hour(saved);
  });

  const [morningActive, setMorningActive] = useState(() => localStorage.getItem("morningActive") !== "false");
  const [nightActive, setNightActive] = useState(() => localStorage.getItem("nightActive") !== "false");

  // Time Picker Modal State
  const [timePickerTarget, setTimePickerTarget] = useState<"morning" | "night" | null>(null);
  const [modalHourInput, setModalHourInput] = useState("07");
  const [modalMinInput, setModalMinInput] = useState("30");
  const [modalAmPmInput, setModalAmPmInput] = useState<"AM" | "PM">("AM");

  // Track last triggered minute to prevent repeated alarms in the same minute
  const [lastTriggeredMinute, setLastTriggeredMinute] = useState<string>("");

  // Motivational Tip Index State
  const [tipIndex, setTipIndex] = useState(0);
  const [isTipSpinning, setIsTipSpinning] = useState(false);

  useEffect(() => {
    localStorage.setItem("morning_time", morningTime);
    localStorage.setItem("night_time", nightTime);
    localStorage.setItem("morningReminderTime", morningTime);
    localStorage.setItem("nightReminderTime", nightTime);
    localStorage.setItem("morningActive", String(morningActive));
    localStorage.setItem("nightActive", String(nightActive));
    localStorage.setItem("theme", theme);
    
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [morningTime, nightTime, morningActive, nightActive, theme]);

  // REAL-TIME CLOCK TICKER: Checks every 1 second and fires notification instantly when alarm time hits!
  useEffect(() => {
    const checkClock = () => {
      const now = new Date();
      const current24 = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      const minuteKey = `${current24}-${now.getDate()}`;

      if (minuteKey === lastTriggeredMinute) return;

      if (morningActive && current24 === morningTime) {
        setLastTriggeredMinute(minuteKey);
        triggerInstantNotification(
          "☀️ Morning Brush Time!",
          `It's ${formatTo12Hour(morningTime)}! Time for your 2-minute ToothMate morning toothbrushing session to start your day with a clean smile. 🪥✨`,
          false
        );
      } else if (nightActive && current24 === nightTime) {
        setLastTriggeredMinute(minuteKey);
        triggerInstantNotification(
          "🌙 Night Brush Time!",
          `It's ${formatTo12Hour(nightTime)}! Protect your enamel before bed with your 2-minute night toothbrushing routine. ✨`,
          false
        );
      }
    };

    checkClock();
    const interval = setInterval(checkClock, 1000);
    return () => clearInterval(interval);
  }, [morningTime, nightTime, morningActive, nightActive, lastTriggeredMinute]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    showToast(`Switched to ${nextTheme === "dark" ? "🌙 Dark Mode" : "☀️ Light Mode"}`);
  };

  const handleNextMotivationalTip = () => {
    setIsTipSpinning(true);
    setTimeout(() => {
      setTipIndex(prev => (prev + 1) % MOTIVATIONAL_TIPS.length);
      setIsTipSpinning(false);
      showToast("💡 Updated Motivational Hygiene Tip!");
    }, 250);
  };

  // Open Direct Text Input Modal
  const openTimePickerModal = (target: "morning" | "night") => {
    const time24 = target === "morning" ? morningTime : nightTime;
    setModalHourInput(getHour12Str(time24));
    setModalMinInput(getMinuteStr(time24));
    setModalAmPmInput(getAmPmStr(time24));
    setTimePickerTarget(target);
  };

  // Confirm Time Picker Dialog Selection
  const confirmTimePickerModal = async () => {
    const time24 = build24HourTime(modalHourInput, modalMinInput, modalAmPmInput);

    if (timePickerTarget === "morning") {
      setMorningTime(time24);
    } else if (timePickerTarget === "night") {
      setNightTime(time24);
    }
    setTimePickerTarget(null);

    const nextMorning = timePickerTarget === "morning" ? time24 : morningTime;
    const nextNight = timePickerTarget === "night" ? time24 : nightTime;

    localStorage.setItem("morning_time", nextMorning);
    localStorage.setItem("night_time", nextNight);
    localStorage.setItem("morningReminderTime", nextMorning);
    localStorage.setItem("nightReminderTime", nextNight);

    try {
      await scheduleDailyReminders(
        morningActive ? nextMorning : "",
        nightActive ? nextNight : ""
      );
    } catch (e) {}

    showToast(`⏰ ${timePickerTarget === "morning" ? "Morning" : "Night"} Alarm set to ${formatTo12Hour(time24)}!`);
  };

  // Save Alarm Times: Saves settings, schedules notifications, and triggers Pop-Up Modal Message!
  const handleSaveReminders = async () => {
    // 1. Save active settings to local storage immediately across all keys
    localStorage.setItem("morning_time", morningTime);
    localStorage.setItem("night_time", nightTime);
    localStorage.setItem("morningReminderTime", morningTime);
    localStorage.setItem("nightReminderTime", nightTime);
    localStorage.setItem("morningActive", String(morningActive));
    localStorage.setItem("nightActive", String(nightActive));

    // 2. Schedule native OS & Browser notifications
    try {
      await scheduleDailyReminders(
        morningActive ? morningTime : "",
        nightActive ? nightTime : ""
      );
    } catch (e) {
      console.warn("Background reminder schedule error:", e);
    }

    // 3. Show prominent Pop-Up Confirmation Modal!
    setShowSaveSuccessModal(true);
  };

  // Save Profile Edits
  const handleSaveProfile = async () => {
    const trimmedName = editNameInput.trim();
    if (!trimmedName) return;

    setUserName(trimmedName);
    setUserMode(editAgeGroupInput);
    setUserTechnique(editTechniqueInput);

    localStorage.setItem("userName", trimmedName);
    localStorage.setItem("userAgeGroup", editAgeGroupInput);
    localStorage.setItem("recommendedTechnique", editTechniqueInput);

    setIsEditModalOpen(false);
    showToast("🎉 Profile & preferences updated successfully!");

    try {
      await fetch(`${API_BASE_URL}/auth/demographics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(currentUserId, 10),
          name: trimmedName,
          ageGroup: editAgeGroupInput,
          technique: editTechniqueInput
        })
      });
    } catch (err) {
      console.log("Updated locally.");
    }
  };

  const handlePerformLogout = () => {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    showToast("Signed out successfully.");
    setTimeout(() => {
      navigate("/auth");
    }, 400);
  };

  const currentTip = MOTIVATIONAL_TIPS[tipIndex] || MOTIVATIONAL_TIPS[0];

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-6 pb-28 pt-2 font-sans transition-colors duration-300 ${
      isDark ? "text-slate-100" : "text-slate-800"
    }`}>
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-top duration-300">
          <div className="px-5 py-3 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-2xl text-xs font-black flex items-center gap-2 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* 1. TOP HERO BLUE BANNER CARD */}
      <div className="w-full bg-gradient-to-r from-sky-600 via-sky-700 to-cyan-800 text-white p-6 md:p-8 rounded-3xl relative shadow-xl overflow-hidden">
        <div className="flex flex-col space-y-4 relative z-10">
          
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate("/dashboard")} 
                className="w-10 h-10 rounded-2xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors cursor-pointer shrink-0 active:scale-95"
                title="Back to Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
              
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md shrink-0">
                <User className="w-7 h-7 text-cyan-200" />
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-extrabold text-2xl md:text-3xl tracking-tight">Hello, {userName}!</h1>
                  <span className="px-3 py-1 rounded-full bg-cyan-300 text-slate-950 text-xs font-black uppercase tracking-wider shadow-sm border border-cyan-100">
                    {userMode}
                  </span>
                </div>
                <p className="text-xs text-sky-100/90 font-medium mt-1">{userEmail}</p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={toggleTheme}
                className="p-3 bg-white/15 hover:bg-white/25 text-white rounded-2xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer border border-white/20 active:scale-95"
                title="Toggle Theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-sky-200" />}
              </button>

              <button 
                onClick={() => {
                  setEditNameInput(userName);
                  setEditAgeGroupInput(userMode);
                  setEditTechniqueInput(userTechnique);
                  setIsEditModalOpen(true);
                }}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-2xl text-xs font-extrabold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer border border-white/20 active:scale-95"
              >
                <Edit3 className="w-4 h-4" />
                <span className="hidden sm:inline">Edit Profile</span>
              </button>

              <button 
                onClick={() => setShowLogoutModal(true)}
                className="px-4 py-2.5 bg-rose-500/30 hover:bg-rose-500/40 text-white rounded-2xl text-xs font-extrabold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer border border-rose-300/30 active:scale-95"
                title="Logout"
              >
                <LogOut className="w-4 h-4 text-rose-200" />
                <span>Logout</span>
              </button>
            </div>
          </div>

          <div className="w-full pt-1">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm shadow-md border border-cyan-100">
              <Sparkles className="w-4 h-4 text-slate-900 shrink-0" />
              <span>Recommended Technique: {userTechnique}</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. RESPONSIVE 2-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Daily Reminders & Motivational Tips */}
        <div className={`p-6 md:p-8 rounded-3xl border shadow-sm space-y-6 transition-colors duration-300 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80"
        }`}>
          
          <div className="space-y-3 border-b pb-4 border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base flex items-center gap-2">
                  <Bell className="w-5 h-5 text-sky-500" /> Daily Hygiene Reminders
                </h3>
                <p className="text-[11px] text-emerald-500 font-bold mt-0.5 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Active • Alarms Will Ring at Scheduled Times</span>
                </p>
              </div>

              {/* Instant Test Pop-Up Button */}
              <button 
                onClick={() => triggerInstantNotification("☀️ ToothMate Hygiene Reminder", "Test alarm sound and pop-up modal triggered successfully!", true)}
                className={`text-xs font-extrabold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs border ${
                  isDark ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30" : "bg-cyan-50 text-cyan-700 border-cyan-200 hover:bg-cyan-100"
                }`}
                title="Test Alarm Pop-Up Overlay Now"
              >
                Test Alert 🔔
              </button>
            </div>

            {/* UN-CLIPPED SAVE ALARM TIMES BUTTON */}
            <button 
              onClick={handleSaveReminders}
              className="w-full py-3.5 px-5 bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm rounded-2xl shadow-md shadow-sky-600/20 transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Save Alarm Times</span>
            </button>
          </div>

          {/* Morning Brush Alarm - Direct Text Input Boxes */}
          <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
            isDark ? "bg-amber-950/20 border-amber-900/40" : "bg-amber-50/60 border-amber-100"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Sun className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold">Morning Brush Alarm</h4>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold">Type exact time in text boxes</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={morningActive} onChange={() => setMorningActive(!morningActive)} className="sr-only peer" />
                <div className="w-12 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Direct Text Input Controls for Morning Alarm */}
            <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                
                {/* Hour Direct Text Box */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase mb-0.5">HOUR</span>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => setMorningTime(prev => stepHour(prev, "down"))}
                      className="w-7 h-10 rounded-lg bg-amber-200 dark:bg-slate-700 text-amber-900 dark:text-amber-200 font-black text-sm flex items-center justify-center cursor-pointer hover:bg-amber-300 active:scale-95"
                      title="Decrease Hour"
                    >
                      -
                    </button>

                    <input 
                      type="number"
                      min="1"
                      max="12"
                      value={getHour12Str(morningTime)}
                      onChange={(e) => {
                        const val = e.target.value;
                        const currentMin = getMinuteStr(morningTime);
                        const currentAmPm = getAmPmStr(morningTime);
                        setMorningTime(build24HourTime(val, currentMin, currentAmPm));
                      }}
                      className="w-14 h-10 text-center font-black text-base rounded-xl border-2 border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                      placeholder="09"
                    />

                    <button 
                      type="button"
                      onClick={() => setMorningTime(prev => stepHour(prev, "up"))}
                      className="w-7 h-10 rounded-lg bg-amber-200 dark:bg-slate-700 text-amber-900 dark:text-amber-200 font-black text-sm flex items-center justify-center cursor-pointer hover:bg-amber-300 active:scale-95"
                      title="Increase Hour"
                    >
                      +
                    </button>
                  </div>
                </div>

                <span className="font-black text-xl text-slate-400 mt-4">:</span>

                {/* Minute Direct Text Box */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-amber-700 dark:text-amber-300 uppercase mb-0.5">MIN</span>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => setMorningTime(prev => stepMinute(prev, "down"))}
                      className="w-7 h-10 rounded-lg bg-amber-200 dark:bg-slate-700 text-amber-900 dark:text-amber-200 font-black text-sm flex items-center justify-center cursor-pointer hover:bg-amber-300 active:scale-95"
                      title="Decrease Minute"
                    >
                      -
                    </button>

                    <input 
                      type="number"
                      min="0"
                      max="59"
                      value={getMinuteStr(morningTime)}
                      onChange={(e) => {
                        const val = e.target.value;
                        const currentH = getHour12Str(morningTime);
                        const currentAmPm = getAmPmStr(morningTime);
                        setMorningTime(build24HourTime(currentH, val, currentAmPm));
                      }}
                      className="w-14 h-10 text-center font-black text-base rounded-xl border-2 border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-amber-500 shadow-xs"
                      placeholder="39"
                    />

                    <button 
                      type="button"
                      onClick={() => setMorningTime(prev => stepMinute(prev, "up"))}
                      className="w-7 h-10 rounded-lg bg-amber-200 dark:bg-slate-700 text-amber-900 dark:text-amber-200 font-black text-sm flex items-center justify-center cursor-pointer hover:bg-amber-300 active:scale-95"
                      title="Increase Minute"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* AM / PM Segment Switch */}
                <div className="flex flex-col items-center mt-4">
                  <button
                    type="button"
                    onClick={() => setMorningTime(prev => toggleAmPm(prev))}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs border ${
                      getAmPmStr(morningTime) === "PM"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-amber-400 text-slate-950 border-amber-300"
                    }`}
                  >
                    {getAmPmStr(morningTime)}
                  </button>
                </div>

              </div>

              {/* Time Modal Trigger Button */}
              <button
                type="button"
                onClick={() => openTimePickerModal("morning")}
                className="mt-4 px-3 py-2 rounded-xl bg-amber-100/80 dark:bg-slate-800 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-slate-700 text-xs font-black hover:bg-amber-200 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                title="Open Direct Input Modal"
              >
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>Modal ▾</span>
              </button>
            </div>
          </div>

          {/* Night Brush Alarm - Direct Text Input Boxes */}
          <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
            isDark ? "bg-indigo-950/20 border-indigo-900/40" : "bg-indigo-50/60 border-indigo-100"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Moon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-extrabold">Night Brush Alarm</h4>
                  <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">Type exact time in text boxes</p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={nightActive} onChange={() => setNightActive(!nightActive)} className="sr-only peer" />
                <div className="w-12 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Direct Text Input Controls for Night Alarm */}
            <div className="flex items-center justify-between pt-1 gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                
                {/* Hour Direct Text Box */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase mb-0.5">HOUR</span>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => setNightTime(prev => stepHour(prev, "down"))}
                      className="w-7 h-10 rounded-lg bg-indigo-200 dark:bg-slate-700 text-indigo-900 dark:text-indigo-200 font-black text-sm flex items-center justify-center cursor-pointer hover:bg-indigo-300 active:scale-95"
                      title="Decrease Hour"
                    >
                      -
                    </button>

                    <input 
                      type="number"
                      min="1"
                      max="12"
                      value={getHour12Str(nightTime)}
                      onChange={(e) => {
                        const val = e.target.value;
                        const currentMin = getMinuteStr(nightTime);
                        const currentAmPm = getAmPmStr(nightTime);
                        setNightTime(build24HourTime(val, currentMin, currentAmPm));
                      }}
                      className="w-14 h-10 text-center font-black text-base rounded-xl border-2 border-indigo-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                      placeholder="09"
                    />

                    <button 
                      type="button"
                      onClick={() => setNightTime(prev => stepHour(prev, "up"))}
                      className="w-7 h-10 rounded-lg bg-indigo-200 dark:bg-slate-700 text-indigo-900 dark:text-indigo-200 font-black text-sm flex items-center justify-center cursor-pointer hover:bg-indigo-300 active:scale-95"
                      title="Increase Hour"
                    >
                      +
                    </button>
                  </div>
                </div>

                <span className="font-black text-xl text-slate-400 mt-4">:</span>

                {/* Minute Direct Text Box */}
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-indigo-700 dark:text-indigo-300 uppercase mb-0.5">MIN</span>
                  <div className="flex items-center gap-1">
                    <button 
                      type="button"
                      onClick={() => setNightTime(prev => stepMinute(prev, "down"))}
                      className="w-7 h-10 rounded-lg bg-indigo-200 dark:bg-slate-700 text-indigo-900 dark:text-indigo-200 font-black text-sm flex items-center justify-center cursor-pointer hover:bg-indigo-300 active:scale-95"
                      title="Decrease Minute"
                    >
                      -
                    </button>

                    <input 
                      type="number"
                      min="0"
                      max="59"
                      value={getMinuteStr(nightTime)}
                      onChange={(e) => {
                        const val = e.target.value;
                        const currentH = getHour12Str(nightTime);
                        const currentAmPm = getAmPmStr(nightTime);
                        setNightTime(build24HourTime(currentH, val, currentAmPm));
                      }}
                      className="w-14 h-10 text-center font-black text-base rounded-xl border-2 border-indigo-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
                      placeholder="30"
                    />

                    <button 
                      type="button"
                      onClick={() => setNightTime(prev => stepMinute(prev, "up"))}
                      className="w-7 h-10 rounded-lg bg-indigo-200 dark:bg-slate-700 text-indigo-900 dark:text-indigo-200 font-black text-sm flex items-center justify-center cursor-pointer hover:bg-indigo-300 active:scale-95"
                      title="Increase Minute"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* AM / PM Segment Switch */}
                <div className="flex flex-col items-center mt-4">
                  <button
                    type="button"
                    onClick={() => setNightTime(prev => toggleAmPm(prev))}
                    className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer shadow-xs border ${
                      getAmPmStr(nightTime) === "PM"
                        ? "bg-indigo-600 text-white border-indigo-500"
                        : "bg-amber-400 text-slate-950 border-amber-300"
                    }`}
                  >
                    {getAmPmStr(nightTime)}
                  </button>
                </div>

              </div>

              {/* Time Modal Trigger Button */}
              <button
                type="button"
                onClick={() => openTimePickerModal("night")}
                className="mt-4 px-3 py-2 rounded-xl bg-indigo-100/80 dark:bg-slate-800 text-indigo-900 dark:text-indigo-300 border border-indigo-300 dark:border-slate-700 text-xs font-black hover:bg-indigo-200 cursor-pointer active:scale-95 transition-all flex items-center gap-1"
                title="Open Direct Input Modal"
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Modal ▾</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC ROTATING MOTIVATIONAL HYGIENE TIP CARD */}
          <div className={`p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
            isDark ? "bg-emerald-950/20 border-emerald-800/40" : "bg-emerald-50/70 border-emerald-100"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Lightbulb className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Motivational Tip #{currentTip?.id || 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentTip?.title || "2-Minute Rule"}</h4>
                </div>
              </div>

              <button 
                onClick={handleNextMotivationalTip}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold active:scale-95 ${
                  isDark ? "bg-slate-800 border-slate-700 text-emerald-300 hover:bg-slate-700" : "bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                }`}
                title="Refresh Motivational Tip"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTipSpinning ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">New Tip</span>
              </button>
            </div>

            <p className="text-xs leading-relaxed font-semibold text-slate-700 dark:text-slate-300 italic bg-white/60 dark:bg-slate-900/50 p-3 rounded-xl border border-emerald-200/40 dark:border-slate-800">
              "{currentTip?.text || ""}"
            </p>
          </div>

        </div>

        {/* Right Column: Preferences, Assessment & Sign Out */}
        <div className={`p-6 md:p-8 rounded-3xl border shadow-sm space-y-4 transition-colors duration-300 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80"
        }`}>
          <h3 className="font-extrabold text-base border-b pb-4 border-slate-200 dark:border-slate-800">
            Account Preferences
          </h3>

          {/* Retake Diagnostic Quiz */}
          <div 
            onClick={() => navigate("/assessment")}
            className="p-4 rounded-2xl border border-teal-200 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/40 dark:to-cyan-950/40 hover:scale-[1.01] transition-all cursor-pointer shadow-sm flex items-center justify-between group active:scale-95"
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md shrink-0">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 group-hover:text-teal-600 transition-colors">
                  Retake Diagnostic Assessment
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Re-evaluate dental age, plaque risk & technique</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-teal-600 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>

          {/* Edit Profile */}
          <div 
            onClick={() => {
              setEditNameInput(userName);
              setEditAgeGroupInput(userMode);
              setEditTechniqueInput(userTechnique);
              setIsEditModalOpen(true);
            }}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
              isDark ? "bg-slate-800/80 border-slate-700 hover:bg-slate-800" : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Edit Profile & Technique</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update display name, mode & technique</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </div>

          {/* Theme Switcher */}
          <div 
            onClick={toggleTheme}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
              isDark ? "bg-slate-800/80 border-slate-700 hover:bg-slate-800" : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold">App Appearance Theme</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Currently: {isDark ? "Dark Mode 🌙" : "Light Mode ☀️"}</p>
              </div>
            </div>
            <span className={`text-xs font-black px-3 py-1 rounded-full shrink-0 ${
              isDark ? "bg-amber-400/20 text-amber-300" : "bg-sky-100 text-sky-700"
            }`}>
              {isDark ? "DARK" : "LIGHT"}
            </span>
          </div>

          {/* Emergency Dental Helpline */}
          <div 
            onClick={() => alert("📞 Dental Helpline: Call 1-800-TOOTHMATE for 24/7 care")}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer active:scale-98 ${
              isDark ? "bg-slate-800/80 border-slate-700 hover:bg-slate-800" : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Emergency Dental Helpline</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">24/7 instant oral care guidance</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 shrink-0" />
          </div>

          {/* Sign Out Button */}
          <div className="pt-2">
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-full py-4 min-h-[52px] bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm rounded-2xl transition-all cursor-pointer shadow-lg shadow-rose-600/30 flex items-center justify-center gap-2 active:scale-95 border border-rose-500"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out Account</span>
            </button>
          </div>

        </div>

      </div>

      {/* 🪟 DIRECT TEXT INPUT TIME PICKER MODAL */}
      {timePickerTarget && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 max-w-sm w-full rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-5 animate-in zoom-in-95 duration-200">
            
            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center justify-center gap-2">
                <Clock className="w-5 h-5 text-sky-500" />
                <span>Select {timePickerTarget === "morning" ? "Morning ☀️" : "Night 🌙"} Alarm Time</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Type exact hour and minute in text boxes</p>
            </div>

            {/* Direct Text Input Box Row */}
            <div className="p-5 bg-slate-50 dark:bg-slate-800/80 rounded-3xl border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-3">
              
              {/* Hour Input Box */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase mb-1">HOUR</span>
                <input 
                  type="number"
                  min="1"
                  max="12"
                  value={modalHourInput}
                  onChange={(e) => setModalHourInput(e.target.value)}
                  className="w-16 h-14 text-center font-black text-2xl rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-sky-500 shadow-sm"
                  placeholder="09"
                />
              </div>

              <span className="font-black text-3xl text-slate-400 mt-5">:</span>

              {/* Minute Input Box */}
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-black text-slate-400 uppercase mb-1">MIN</span>
                <input 
                  type="number"
                  min="0"
                  max="59"
                  value={modalMinInput}
                  onChange={(e) => setModalMinInput(e.target.value)}
                  className="w-16 h-14 text-center font-black text-2xl rounded-2xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:border-sky-500 shadow-sm"
                  placeholder="39"
                />
              </div>

              {/* AM / PM Buttons */}
              <div className="flex flex-col items-center ml-2">
                <span className="text-[10px] font-black text-slate-400 uppercase mb-1">PERIOD</span>
                <div className="flex flex-col gap-1.5">
                  <button
                    type="button"
                    onClick={() => setModalAmPmInput("AM")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      modalAmPmInput === "AM" 
                        ? "bg-amber-400 text-slate-950 shadow-md scale-105" 
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    type="button"
                    onClick={() => setModalAmPmInput("PM")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      modalAmPmInput === "PM" 
                        ? "bg-indigo-600 text-white shadow-md scale-105" 
                        : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-1">
              <button 
                onClick={() => setTimePickerTarget(null)}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-extrabold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={confirmTimePickerModal}
                className="flex-1 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md shadow-sky-600/20 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Confirm</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🔔 SAVE TIMES SUCCESS POP-UP MODAL */}
      {showSaveSuccessModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className={`max-w-md w-full rounded-3xl p-6 shadow-2xl border space-y-5 animate-in zoom-in-95 duration-200 ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center gap-3 border-b pb-4 border-slate-200 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-lg shadow-emerald-500/30 shrink-0">
                🎉
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-500">ALARM TIMES SAVED</span>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Alarms Set Successfully!</h3>
              </div>
            </div>

            <div className="space-y-3 text-xs leading-relaxed font-medium text-slate-600 dark:text-slate-300">
              <p className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 text-emerald-900 dark:text-emerald-200 font-semibold">
                ✅ Your toothbrushing alarms have been saved. A pop-up notification with sound chime will trigger on screen at your exact selected time!
              </p>

              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <span className="font-bold flex items-center gap-2">
                    <Sun className="w-4 h-4 text-amber-500" /> Morning Brush Alarm:
                  </span>
                  <span className="font-extrabold text-amber-600 dark:text-amber-400">
                    {morningActive ? formatTo12Hour(morningTime) : "Disabled"}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80">
                  <span className="font-bold flex items-center gap-2">
                    <Moon className="w-4 h-4 text-indigo-500" /> Night Brush Alarm:
                  </span>
                  <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
                    {nightActive ? formatTo12Hour(nightTime) : "Disabled"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  setShowSaveSuccessModal(false);
                  triggerInstantNotification("🔔 ToothMate Pop-Up Test", "This is how your scheduled toothbrushing alarm will pop up at the selected time!", true);
                }}
                className="flex-1 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Bell className="w-4 h-4" />
                <span>Test Pop-Up Now</span>
              </button>

              <button
                onClick={() => setShowSaveSuccessModal(false)}
                className="flex-1 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs shadow-md cursor-pointer"
              >
                Got It, Thanks!
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT PROFILE MODAL */}
      {isEditModalOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4"
          onClick={() => setIsEditModalOpen(false)}
        >
          <div 
            className={`w-full max-w-md p-6 md:p-8 rounded-3xl border shadow-2xl space-y-5 animate-in zoom-in-95 duration-200 ${
              isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b pb-3 border-slate-200 dark:border-slate-800">
              <h3 className="font-extrabold text-lg flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-sky-500" /> Edit Profile Details
              </h3>
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Display Name</label>
                <input 
                  type="text" 
                  value={editNameInput} 
                  onChange={(e) => setEditNameInput(e.target.value)}
                  placeholder="Enter your display name"
                  className={`w-full p-3.5 min-h-[48px] rounded-xl border font-bold text-sm outline-none focus:ring-2 focus:ring-sky-500 ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                />
              </div>

              <div>
                <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Age Mode Category</label>
                <select 
                  value={editAgeGroupInput}
                  onChange={(e) => setEditAgeGroupInput(e.target.value)}
                  className={`w-full p-3.5 min-h-[48px] rounded-xl border font-bold text-sm outline-none ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  <option value="Child Mode">Child Mode</option>
                  <option value="Teen Mode">Teen Mode</option>
                  <option value="Adult Mode">Adult Mode</option>
                  <option value="Senior Mode">Senior Mode</option>
                  <option value="Orthodontic Care">Orthodontic Care</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-500 dark:text-slate-400 block mb-1">Brushing Technique</label>
                <select 
                  value={editTechniqueInput}
                  onChange={(e) => setEditTechniqueInput(e.target.value)}
                  className={`w-full p-3.5 min-h-[48px] rounded-xl border font-bold text-sm outline-none ${
                    isDark ? "bg-slate-800 border-slate-700 text-white" : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                >
                  <option value="Modified Bass Technique">Modified Bass Technique</option>
                  <option value="The Stillman Technique">The Stillman Technique</option>
                  <option value="Magic Circular Fones Method">Magic Circular Fones Method</option>
                  <option value="Smith-Bell Sulcular Implant Care">Smith-Bell Sulcular Implant Care</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="flex-1 py-3.5 min-h-[48px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveProfile}
                className="flex-1 py-3.5 min-h-[48px] bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`w-full max-w-sm p-6 rounded-3xl border shadow-2xl space-y-4 text-center animate-in zoom-in-95 duration-200 ${
            isDark ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 mx-auto flex items-center justify-center">
              <LogOut className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-extrabold text-base">Sign Out of ToothMate?</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                You will need to sign back in to access your custom brushing routines and AI Coach.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-3.5 min-h-[44px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 font-bold text-xs rounded-xl cursor-pointer active:scale-95"
              >
                Cancel
              </button>
              <button 
                onClick={handlePerformLogout}
                className="flex-1 py-3.5 min-h-[44px] bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs shadow-md cursor-pointer active:scale-95"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
