import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Save, ArrowLeft, Bell, Lightbulb, RefreshCw, ChevronRight, Moon, Sun, Check } from "lucide-react";

// 🛠️ DYNAMIC RESOLVER MATRIX: Automatically switches hosts depending on active client view port
const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://127.0.0.1:8000"
  : "http://10.127.81.158:8000";

export default function ProfileScreen() {
  const navigate = useNavigate();
  const currentUserId = localStorage.getItem("userId") || "32";
  
  // Dynamic Profile States
  const [userName, setUserName] = useState(() => localStorage.getItem("userName") || "Arshin");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editInputName, setEditInputName] = useState(userName);

  const userMode = localStorage.getItem("userAgeGroup") || "Teen Mode";
  const userTechnique = localStorage.getItem("recommendedTechnique") || "Standard Bass Technique";

  // Reminder Configuration State Management
  const [morningTime, setMorningTime] = useState(() => localStorage.getItem("morningReminderTime") || "07:30");
  const [nightTime, setNightTime] = useState(() => localStorage.getItem("nightReminderTime") || "22:45");
  const [morningActive, setMorningActive] = useState(() => localStorage.getItem("morningActive") !== "false");
  const [nightActive, setNightActive] = useState(() => localStorage.getItem("nightActive") !== "false");
  
  // Theme Configuration Logic mapping
  const [themeToggle, setThemeToggle] = useState(() => localStorage.getItem("themeLightMode") !== "false");

  // Auto-sync persistent client layers
  useEffect(() => {
    localStorage.setItem("morningReminderTime", morningTime);
    localStorage.setItem("nightReminderTime", nightTime);
    localStorage.setItem("morningActive", String(morningActive));
    localStorage.setItem("nightActive", String(nightActive));
    localStorage.setItem("themeLightMode", String(themeToggle));
  }, [morningTime, nightTime, morningActive, nightActive, themeToggle]);

  // Real-Time Background Notification Engine Hook (Upgraded matching logic)
  useEffect(() => {
    const checkRemindersInterval = setInterval(() => {
      const now = new Date();
      const currentHoursNum = now.getHours();
      const currentMinutes = String(now.getMinutes()).padStart(2, "0");
      
      // 24-Hour String matching (e.g., "22:45")
      const currentHours24 = String(currentHoursNum).padStart(2, "0");
      const timeString24 = `${currentHours24}:${currentMinutes}`;

      // 12-Hour Conversion String matching as a fallback (e.g., "10:45")
      const hours12 = currentHoursNum % 12 || 12;
      const currentHours12 = String(hours12).padStart(2, "0");
      const timeString12 = `${currentHours12}:${currentMinutes}`;

      // Helper match checker function
      const checkMatch = (settingTime: string) => {
        return settingTime === timeString24 || settingTime === timeString12;
      };

      if (morningActive && checkMatch(morningTime)) {
        triggerNotificationAlert("☀️ Morning Brush Time!", "Time to maintain your white, confident smile with your recommended technique!");
      }
      if (nightActive && checkMatch(nightTime)) {
        triggerNotificationAlert("🌙 Night Brush Time!", "Protect your teeth before bed! Ensure thorough coverage across subgingival pocket zones.");
      }
    }, 1000); // Increased check loop sampling frequency to 1 second to eliminate matching thread skips

    return () => clearInterval(checkRemindersInterval);
  }, [morningTime, nightTime, morningActive, nightActive]);

  const triggerNotificationAlert = (title: string, message: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message, icon: "/favicon.ico" });
    } else {
      // Direct, reliable browser alert fallback context
      alert(`⏰ ${title}\n\n${message}`);
    }
  };

  // Request browser push notification context access channels on initial save action
  const handleSaveReminders = async () => {
    if ("Notification" in window && Notification.permission !== "granted") {
      await Notification.requestPermission();
    }

    try {
      const payload = {
        userId: parseInt(currentUserId, 10),
        morningTime24h: morningTime,
        nightTime24h: nightTime,
        deviceToken: "web_browser_session_token_placeholder" 
      };

      const response = await fetch(`${API_BASE}/api/reminders/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      if (response.ok && data.success) {
        alert(`Success! Reminders set for ${morningTime} and ${nightTime} synced to storage engine database.`);
      } else {
        alert(data.detail || "Validation Error saving settings.");
      }
    } catch (error) {
      alert("Failed to communicate with database engine server resource.");
    }
  };

  const handleSaveProfileName = async () => {
    if (!editInputName.trim()) return;
    try {
      const response = await fetch(`${API_BASE}/api/auth/demographics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(currentUserId, 10),
          name: editInputName,
          ageGroup: userMode,
          gender: "Other"
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setUserName(editInputName);
        localStorage.setItem("userName", editInputName);
        setIsEditingProfile(false);
        alert("Profile name updated successfully.");
      }
    } catch (err) {
      setUserName(editInputName);
      localStorage.setItem("userName", editInputName);
      setIsEditingProfile(false);
    }
  };

  return (
    <div className={`w-full max-w-md mx-auto min-h-screen pb-24 shadow-2xl font-sans flex flex-col box-border overflow-x-hidden transition-colors duration-300 ${
      themeToggle ? "bg-[#F8FAFC]" : "bg-slate-900 text-slate-100"
    }`}>
      
      {/* Settings Profile Header */}
      <div className="bg-[#0F4C81] text-white p-6 pt-6 pb-8 rounded-b-[2.5rem] shadow-md relative">
        <button 
          onClick={() => navigate("/dashboard")} 
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>

        <div className="mt-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center shadow-inner shrink-0">
            <User className="w-7 h-7 text-[#0F4C81]" />
          </div>
          <div className="flex-1 min-w-0">
            {isEditingProfile ? (
              <div className="flex gap-2 items-center mr-2">
                <input 
                  type="text" 
                  value={editInputName} 
                  onChange={(e) => setEditInputName(e.target.value)}
                  className="bg-white/20 text-white font-black text-xl tracking-tight rounded-lg px-2 py-1 outline-none w-full border border-white/30 focus:bg-white/30"
                  autoFocus
                />
                <button onClick={handleSaveProfileName} className="p-2 bg-emerald-500 rounded-lg shrink-0"><Check className="w-4 h-4 text-white" /></button>
              </div>
            ) : (
              <h1 className="font-black text-xl tracking-tight truncate">Hello, {userName}!</h1>
            )}
            <p className="text-xs text-white/70 font-medium mt-0.5">{userMode} - {userTechnique}</p>
          </div>
        </div>
      </div>

      {/* Control Panels Workspace */}
      <div className="p-5 space-y-4 flex-1">
        
        {/* Reminders Panel */}
        <div className={`p-5 rounded-3xl border shadow-xs space-y-4 transition-colors ${
          themeToggle ? "bg-white border-slate-100" : "bg-slate-800 border-slate-700/60"
        }`}>
          <div className="flex justify-between items-center border-b border-slate-50 pb-3 dark:border-slate-700/40">
            <h3 className={`font-black text-sm flex items-center gap-2 ${themeToggle ? "text-[#1E293B]" : "text-white"}`}>
              <Bell className="w-4 h-4 text-[#0F4C81]" /> Reminders
            </h3>
            <button 
              onClick={handleSaveReminders}
              className="text-[10px] font-extrabold text-[#0F4C81] bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-wider cursor-pointer hover:bg-blue-100/70 transition-colors"
            >
              Set Reminders
            </button>
          </div>

          {/* Morning Reminder */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Sun className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-black ${themeToggle ? "text-slate-800" : "text-slate-200"}`}>Morning Brush Reminder</h4>
                <input 
                  type="time" 
                  value={morningTime} 
                  onChange={(e) => setMorningTime(e.target.value)} 
                  className={`text-xs font-bold mt-0.5 p-1 rounded-sm border-none outline-none focus:ring-1 focus:ring-[#0F4C81] ${
                    themeToggle ? "text-slate-700 bg-slate-50" : "text-slate-200 bg-slate-700"
                  }`}
                />
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={morningActive} onChange={() => setMorningActive(!morningActive)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2D9CDB]"></div>
            </label>
          </div>

          {/* Night Reminder */}
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                <Moon className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-xs font-black ${themeToggle ? "text-slate-800" : "text-slate-200"}`}>Night Brush Reminder</h4>
                <input 
                  type="time" 
                  value={nightTime} 
                  onChange={(e) => setNightTime(e.target.value)} 
                  className={`text-xs font-bold mt-0.5 p-1 rounded-sm border-none outline-none focus:ring-1 focus:ring-[#0F4C81] ${
                    themeToggle ? "text-slate-700 bg-slate-50" : "text-slate-200 bg-slate-700"
                  }`}
                />
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={nightActive} onChange={() => setNightActive(!nightActive)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2D9CDB]"></div>
            </label>
          </div>

          {/* Motivational Tip Section */}
          <div className="bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100/40 flex gap-3 items-start mt-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
              <Lightbulb className="w-4 h-4 fill-white/10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wide">Motivational Tip</span>
              </div>
              <p className={`text-xs font-medium mt-1 leading-relaxed ${themeToggle ? "text-slate-600" : "text-slate-300"}`}>
                Consistent brushing keeps your smile naturally white and highly confident!
              </p>
            </div>
          </div>

        </div>

        {/* Actions Rows */}
        <div className="space-y-2.5">
          <div 
            onClick={() => { setIsEditingProfile(!isEditingProfile); setEditInputName(userName); }}
            className={`w-full flex items-center justify-between p-4 rounded-2xl border shadow-xs cursor-pointer transition-all ${
              themeToggle ? "bg-white border-slate-100 hover:bg-slate-50" : "bg-slate-800 border-slate-700/60 hover:bg-slate-750"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                <User className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">Edit Profile Details</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </div>

          <div className={`w-full flex items-center justify-between p-4 rounded-2xl border shadow-xs transition-colors ${
            themeToggle ? "bg-white border-slate-100" : "bg-slate-800 border-slate-700/60"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span className="text-xs font-bold">Change Mode (Light/Dark Theme)</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" checked={themeToggle} onChange={() => setThemeToggle(!themeToggle)} className="sr-only peer" />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2D9CDB]"></div>
            </label>
          </div>

          {/* Questionnaire container with enhanced border/background styling layout for contrast visibility */}
          <div className={`p-4 rounded-3xl border transition-all ${
            themeToggle ? "bg-slate-50/50 border-slate-200/60" : "bg-slate-800/40 border-slate-700/50"
          }`}>
            <button 
              onClick={() => navigate("/onboarding")}
              className="w-full py-4 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-extrabold text-xs rounded-2xl border border-slate-200/40 tracking-wide transition-all cursor-pointer shadow-xs"
            >
              Retake Diagnostic Questionnaire
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}