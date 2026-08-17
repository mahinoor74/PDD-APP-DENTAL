import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, ArrowLeft, Bell, Lightbulb, RefreshCw, ChevronRight, Moon, Sun, 
  Check, LogOut, ShieldCheck, Sparkles, Key, Lock, Edit3, Heart, Clock, AlertCircle
} from "lucide-react";
import PermissionModal from "./PermissionModal";
import { LocalNotifications } from "@capacitor/local-notifications";
import { 
  triggerInstantNotification, 
  requestNotificationPermission, 
  requestCapacitorPermission,
  scheduleCapacitorReminder,
  schedule5SecTestNotification,
  scheduleDailyReminders
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

export default function ProfileScreen() {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId") || "32";
  
  // Theme State ('light' | 'dark')
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "light");
  const isDark = theme === "dark";

  // Dynamic Profile States
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "Mahinoor");
  const [userEmail, setUserEmail] = useState(() => localStorage.getItem("userEmail") || "user@toothmate.ai");
  const [userMode, setUserMode] = useState(() => localStorage.getItem("userAgeGroup") || "Adult Mode");
  const [userTechnique, setUserTechnique] = useState(() => localStorage.getItem("recommendedTechnique") || "Modified Bass Technique");

  // Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Edit Form Fields
  const [editNameInput, setEditNameInput] = useState(userName);
  const [editAgeGroupInput, setEditAgeGroupInput] = useState(userMode);
  const [editTechniqueInput, setEditTechniqueInput] = useState(userTechnique);
  const [editPasswordInput, setEditPasswordInput] = useState("");

  const API_BASE_URL = "http://localhost:8000/api";

  // Reminder Configuration State
  const [morningTime, setMorningTime] = useState(() => localStorage.getItem("morning_time") || localStorage.getItem("morningReminderTime") || "07:30");
  const [nightTime, setNightTime] = useState(() => localStorage.getItem("night_time") || localStorage.getItem("nightReminderTime") || "21:30");
  const [morningActive, setMorningActive] = useState(() => localStorage.getItem("morningActive") !== "false");
  const [nightActive, setNightActive] = useState(() => localStorage.getItem("nightActive") !== "false");

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

  const [osPermission, setOsPermission] = useState<string>(() => {
    try {
      if (typeof window !== "undefined" && "Notification" in window && window.Notification) {
        return window.Notification.permission || "granted";
      }
    } catch (e) {}
    return "granted";
  });
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Force permission sync on component mount
  useEffect(() => {
    const syncPermissionsOnMount = async () => {
      try {
        const granted = await requestCapacitorPermission();
        if (granted || (typeof window !== "undefined" && window.Notification && window.Notification.permission === "granted")) {
          setOsPermission("granted");
        } else if (typeof window !== "undefined" && window.Notification && window.Notification.permission) {
          setOsPermission(window.Notification.permission);
        }
      } catch (e) {
        console.warn("syncPermissionsOnMount fallback:", e);
      }
    };
    syncPermissionsOnMount();
  }, []);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice?.outcome === "accepted") {
        showToast("🎉 ToothMate Installed as Windows Desktop App!");
      }
      setDeferredPrompt(null);
    } else {
      showToast("💡 To install, click the 'Install App' icon in your browser address bar!");
    }
  };

  const handleEnableOSNotifications = async () => {
    try {
      const granted = await requestCapacitorPermission();
      if (granted) {
        setOsPermission("granted");
        showToast("🟢 System OS Notifications Enabled! Alarms will pop up on your mobile lock screen.");
      } else {
        if (typeof window !== "undefined" && window.Notification) setOsPermission(window.Notification.permission || "default");
        setShowPermissionModal(true);
      }
    } catch (e) {
      setShowPermissionModal(true);
    }
  };

  const handleTestClosedTabNotification = async () => {
    try {
      await LocalNotifications.createChannel({
        id: 'reminders',
        name: 'Hygiene Reminders',
        importance: 5,
        visibility: 1,
        vibration: true,
      });

      await LocalNotifications.schedule({
        notifications: [{
          title: "🪥 ToothMate Immediate Test",
          body: "If you see this, your phone notifications are 100% working!",
          id: Date.now(),
          channelId: 'reminders',
          actionTypeId: "",
          extra: null
        }]
      });
      showToast("🔔 Immediate test notification sent!");
    } catch (error) {
      console.error("Scheduling fallback:", error);
      showToast("🔔 Test alarm fallback triggered!");
    }
  };

  const handleTestMorningModal = () => {
    window.dispatchEvent(
      new CustomEvent("toothmate-alarm-triggered", {
        detail: {
          title: "☀️ Morning Brush Time!",
          body: "Start your day with a clean, confident smile! Log your morning brushing session now.",
          message: "Start your day with a clean, confident smile! Log your morning brushing session now.",
          type: "morning",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          badge: "TEST MORNING MODAL"
        }
      })
    );
    showToast("☀️ Morning Alarm Modal Triggered!");
  };

  const handleTestNightModal = () => {
    window.dispatchEvent(
      new CustomEvent("toothmate-alarm-triggered", {
        detail: {
          title: "🌙 Night Brush Time!",
          body: "Protect your enamel before bed! Ensure thorough coverage to complete today's goal.",
          message: "Protect your enamel before bed! Ensure thorough coverage to complete today's goal.",
          type: "night",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          badge: "TEST NIGHT MODAL"
        }
      })
    );
    showToast("🌙 Night Alarm Modal Triggered!");
  };

  const handleSaveReminders = async () => {
    // 1. Save active settings to local storage immediately under both key names
    localStorage.setItem("morning_time", morningTime);
    localStorage.setItem("night_time", nightTime);
    localStorage.setItem("morningReminderTime", morningTime);
    localStorage.setItem("nightReminderTime", nightTime);
    localStorage.setItem("morningActive", String(morningActive));
    localStorage.setItem("nightActive", String(nightActive));

    // Show toast immediately so user gets instant confirmation
    showToast(`✅ Alarms set! Morning (${morningTime}) & Night (${nightTime}).`);

    // 2. Schedule native OS background notifications safely
    try {
      await scheduleDailyReminders(morningTime, nightTime);
    } catch (e) {
      console.warn("Background notification schedule error:", e);
    }

    // 3. Sync to backend API if available
    try {
      const payload = {
        userId: parseInt(currentUserId, 10),
        morningTime24h: morningTime,
        nightTime24h: nightTime,
        deviceToken: "mobile_device_session_token" 
      };

      await fetch(`${API_BASE_URL}/reminders/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
    } catch (error) {
      console.log("Saved locally.");
    }
  };

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

  const currentTip = (MOTIVATIONAL_TIPS && MOTIVATIONAL_TIPS[tipIndex]) || MOTIVATIONAL_TIPS[0];

  return (
    <div className={`w-full max-w-5xl mx-auto space-y-6 pb-12 font-sans transition-colors duration-300 ${
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

      {/* HEADER BANNER */}
      <div className="w-full gradient-dental text-white p-6 md:p-8 rounded-3xl relative shadow-xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate("/dashboard")} 
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-md">
              <User className="w-8 h-8 text-cyan-300" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-2xl md:text-3xl tracking-tight">Hello, {userName}!</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider text-cyan-100 border border-white/20">
                  {userMode}
                </span>
              </div>
              <p className="text-xs md:text-sm text-sky-100/90 font-medium mt-1">Recommended Technique: {userTechnique}</p>
            </div>
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2">
            
            {/* Dark Mode / Light Mode Switch */}
            <button
              onClick={toggleTheme}
              className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer border border-white/20"
              title="Toggle Theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-sky-200" />}
              <span className="hidden sm:inline">{isDark ? "Light Mode" : "Dark Mode"}</span>
            </button>

            {/* Edit Profile Button */}
            <button 
              onClick={() => {
                setEditNameInput(userName);
                setEditAgeGroupInput(userMode);
                setEditTechniqueInput(userTechnique);
                setIsEditModalOpen(true);
              }}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer border border-white/20"
            >
              <Edit3 className="w-4 h-4" />
              <span className="hidden sm:inline">Edit Profile</span>
            </button>

            {/* Header Logout Button */}
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 rounded-2xl text-xs font-bold backdrop-blur-md transition-all flex items-center gap-2 cursor-pointer border border-rose-300/30"
              title="Logout"
            >
              <LogOut className="w-4 h-4 text-rose-200" />
              <span>Logout</span>
            </button>

          </div>

        </div>
      </div>

      {/* RESPONSIVE 2-COLUMN WORKSPACE GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left Column: Daily Reminders & Rotating Motivational Tips */}
        <div className={`p-6 md:p-8 rounded-3xl border shadow-sm space-y-6 transition-colors duration-300 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80"
        }`}>
          
          <div className="flex justify-between items-center border-b pb-4 border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-sky-500" /> Daily Hygiene Reminders
              </h3>
              <p className="text-[11px] text-emerald-500 font-semibold mt-0.5 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active • Alarms Will Ring at Scheduled Times</span>
              </p>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => triggerInstantNotification("☀️ ToothMate Hygiene Reminder", "Test alarm sound and pop-up triggered!", true)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm ${
                  isDark ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-500/30" : "bg-cyan-50 text-cyan-700 border border-cyan-200 hover:bg-cyan-100"
                }`}
              >
                Test Alert
              </button>
              <button 
                onClick={handleSaveReminders}
                className="text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 px-4 py-1.5 rounded-xl shadow-md shadow-sky-600/20 transition-all cursor-pointer"
              >
                Save Times
              </button>
            </div>
          </div>



          {/* Morning Reminder */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
            isDark ? "bg-amber-950/20 border-amber-900/40" : "bg-amber-50/60 border-amber-100"
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Morning Brush Alarm</h4>
                <input 
                  type="time" 
                  value={morningTime} 
                  onChange={(e) => setMorningTime(e.target.value)} 
                  className={`text-sm font-extrabold px-2.5 py-1 rounded-xl border mt-1 outline-none focus:ring-2 focus:ring-amber-500 ${
                    isDark ? "bg-slate-800 text-slate-100 border-slate-700" : "bg-white text-slate-800 border-amber-200"
                  }`}
                />
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={morningActive} onChange={() => setMorningActive(!morningActive)} className="sr-only peer" />
              <div className="w-12 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {/* Night Reminder */}
          <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
            isDark ? "bg-indigo-950/20 border-indigo-900/40" : "bg-indigo-50/60 border-indigo-100"
          }`}>
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shrink-0">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Night Brush Alarm</h4>
                <input 
                  type="time" 
                  value={nightTime} 
                  onChange={(e) => setNightTime(e.target.value)} 
                  className={`text-sm font-extrabold px-2.5 py-1 rounded-xl border mt-1 outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark ? "bg-slate-800 text-slate-100 border-slate-700" : "bg-white text-slate-800 border-indigo-200"
                  }`}
                />
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={nightActive} onChange={() => setNightActive(!nightActive)} className="sr-only peer" />
              <div className="w-12 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
            </label>
          </div>

          {/* DYNAMIC ROTATING MOTIVATIONAL HYGIENE TIP CARD */}
          <div className={`p-5 rounded-2xl border transition-all space-y-3 relative overflow-hidden ${
            isDark ? "bg-emerald-950/20 border-emerald-800/40" : "bg-emerald-50/70 border-emerald-100"
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-sm shrink-0">
                  <Lightbulb className="w-4 h-4 fill-white" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Motivational Hygiene Tip #{currentTip?.id || 1}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">{currentTip?.title || "2-Minute Rule"}</h4>
                </div>
              </div>

              {/* Refresh Tip Button */}
              <button 
                onClick={handleNextMotivationalTip}
                className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                  isDark ? "bg-slate-800 border-slate-700 text-emerald-300 hover:bg-slate-700" : "bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                }`}
                title="Refresh Motivational Tip"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTipSpinning ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">New Tip</span>
              </button>
            </div>

            <p className="text-xs leading-relaxed font-medium text-slate-700 dark:text-slate-300 italic bg-white/50 dark:bg-slate-900/50 p-3 rounded-xl border border-emerald-200/40 dark:border-slate-800">
              "{currentTip?.text || ""}"
            </p>
          </div>

        </div>

        {/* Right Column: Account Preferences & System Controls */}
        <div className={`p-6 md:p-8 rounded-3xl border shadow-sm space-y-5 transition-colors duration-300 ${
          isDark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200/80"
        }`}>
          <h3 className="font-extrabold text-base border-b pb-4 border-slate-200 dark:border-slate-800">
            Account & App Preferences
          </h3>

          {/* Theme Switch Control */}
          <div 
            onClick={toggleTheme}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              isDark ? "bg-slate-800/80 border-slate-700 hover:bg-slate-800" : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold">App Appearance Theme</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Currently: {isDark ? "Dark Mode" : "Light Mode"}</p>
              </div>
            </div>
            <span className={`text-xs font-black px-3 py-1 rounded-full ${
              isDark ? "bg-amber-400/20 text-amber-300" : "bg-sky-100 text-sky-700"
            }`}>
              {isDark ? "DARK" : "LIGHT"}
            </span>
          </div>

          {/* Edit Profile Entry */}
          <div 
            onClick={() => {
              setEditNameInput(userName);
              setEditAgeGroupInput(userMode);
              setEditTechniqueInput(userTechnique);
              setIsEditModalOpen(true);
            }}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              isDark ? "bg-slate-800/80 border-slate-700 hover:bg-slate-800" : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Edit Name & Credentials</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update display name, mode & technique</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>

          {/* Retake Assessment Action */}
          <div 
            onClick={() => navigate("/assessment")}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
              isDark ? "bg-slate-800/80 border-slate-700 hover:bg-slate-800" : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-500 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold">Retake Diagnostic Quiz</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Re-evaluate dental age & technique</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </div>

          {/* LOGOUT BUTTON CARD */}
          <div className="pt-2">
            <button 
              onClick={() => setShowLogoutModal(true)}
              className="w-full py-4 min-h-[48px] bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-sm rounded-2xl transition-all cursor-pointer shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 active:scale-95"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out of ToothMate</span>
            </button>
          </div>

        </div>

      </div>

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
                className="flex-1 py-3.5 min-h-[48px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl cursor-pointer active:scale-95 transition-all"
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleSaveProfile}
                className="flex-1 py-3.5 min-h-[48px] bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs rounded-xl shadow-md shadow-sky-600/20 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-1.5"
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
                className="flex-1 py-3.5 min-h-[44px] bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer active:scale-95"
              >
                Yes, Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔔 EXPLICIT NOTIFICATION PERMISSION REQUEST MODAL */}
      <PermissionModal
        isOpen={showPermissionModal}
        onAllow={async () => {
          setShowPermissionModal(false);
          try {
            const granted = await requestCapacitorPermission();
            if (typeof window !== "undefined" && window.Notification) setOsPermission(window.Notification.permission || "granted");
            if (granted) {
              showToast("✅ Notification permission granted!");
              handleSaveReminders();
            }
          } catch (e) {}
        }}
        onDismiss={() => setShowPermissionModal(false)}
        isDark={isDark}
      />

    </div>
  );
}