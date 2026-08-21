import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame, Calendar, TrendingUp, User as UserIcon, Award, CheckCircle,
  Sparkles, Camera, MessageSquare, ArrowRight, Bell, Lightbulb, Trophy,
} from "lucide-react";
import { API_BASE_URL } from "./apiService";
import { useLanguage } from "./LanguageContext";

const DAILY_TIPS = [
  "Brush for 2 full minutes twice a day to remove 99% of soft plaque! 🦷",
  "Flossing once daily reaches 35% of tooth surfaces a brush can't! 🧵",
  "Replace your toothbrush every 3 months or when bristles flare. 🪥",
  "Wait 30 minutes after eating before brushing — acids weaken enamel! ⏱️",
  "Position bristles at 45° to the gumline for the best plaque removal. 🎯",
  "Brush your tongue from back to front to eliminate 85% of bad breath bacteria! 👅",
  "4 minutes of brushing a day is only 0.3% of your time! Totally worth it! ⏰",
];

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
const DAY_API_KEYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DashboardScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const currentUserId = localStorage.getItem("userId") || "32";
  const currentUserName = localStorage.getItem("userName") || "ToothMate User";
  const streakDays = parseInt(localStorage.getItem("streakDays") || "0", 10);

  const [metrics, setMetrics] = useState<any>(() => {
    const savedCompleted = parseInt(localStorage.getItem("local_completed_count") || "0", 10);
    const savedClean = parseInt(localStorage.getItem("local_clean_sessions") || "11", 10);
    return { todayCompletedCount: savedCompleted, streakDays: streakDays || 7, totalSessions: savedClean, weeklyCompliancePct: 28, weekRangeLabel: "THIS WEEK" };
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLogging, setIsLogging] = useState(false);
  const [tipIndex, setTipIndex] = useState(() => new Date().getDay()); // rotate by day of week

  const completedCount = metrics?.todayCompletedCount || 0;

  // Reminder status from localStorage
  const morningTime = localStorage.getItem("morning_time") || localStorage.getItem("morningReminderTime") || "";
  const nightTime = localStorage.getItem("night_time") || localStorage.getItem("nightReminderTime") || "";
  const morningActive = localStorage.getItem("morningActive") !== "false";
  const nightActive = localStorage.getItem("nightActive") !== "false";

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/metrics/${currentUserId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          const mergedCount = Math.max(data.todayCompletedCount || 0, parseInt(localStorage.getItem("local_completed_count") || "0", 10));
          const mergedTotal = Math.max(data.totalSessions || 0, parseInt(localStorage.getItem("local_clean_sessions") || "11", 10));
          setMetrics({ ...data, todayCompletedCount: mergedCount, totalSessions: mergedTotal });
          localStorage.setItem("streakDays", String(data.streakDays || 7));
          return;
        }
      }
    } catch (error) {
      // offline fallback maintains persisted localStorage values
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleLogBrushingSession = async () => {
    if (completedCount >= 2) {
      alert(t.goalDone || "Daily brushing goals already met. Try tracking tomorrow!");
      return;
    }
    setIsLogging(true);
    const nextCompleted = Math.min(2, completedCount + 1);
    const nextTotal = (metrics?.totalSessions || 11) + 1;
    localStorage.setItem("local_completed_count", String(nextCompleted));
    localStorage.setItem("local_clean_sessions", String(nextTotal));

    setMetrics((prev: any) => ({
      ...prev,
      todayCompletedCount: nextCompleted,
      totalSessions: nextTotal
    }));

    try {
      await fetch(`${API_BASE_URL}/brush/log-manual`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: parseInt(currentUserId, 10) }),
      });
    } catch (error) {
      // already updated local state smoothly
    } finally {
      setIsLogging(false);
    }
  };

  const streak = metrics?.streakDays || 0;

  // Streak badge
  const getStreakBadge = () => {
    if (streak >= 30) return { icon: "🥇", label: t.badge30days || "30-Day Legend", color: "from-amber-400 to-yellow-500" };
    if (streak >= 14) return { icon: "🏅", label: t.badge14days || "2-Week Champion", color: "from-slate-400 to-slate-500" };
    if (streak >= 7)  return { icon: "🥈", label: t.badge7days || "7-Day Streak", color: "from-slate-300 to-slate-400" };
    if (streak >= 3)  return { icon: "🥉", label: t.badge3days || "3-Day Streak", color: "from-amber-600 to-orange-600" };
    return null;
  };
  const badge = getStreakBadge();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 font-sans">
        <div className="w-12 h-12 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
        <p className="font-bold text-sky-600 tracking-wide text-sm">Syncing your dental analytics...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-32 pt-2 sm:pt-4 font-sans text-slate-800">

      {/* Top Hero Banner */}
      <div className="w-full gradient-dental text-white p-6 md:p-8 rounded-3xl relative shadow-md shadow-teal-900/10 overflow-hidden">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* SVG Circular Progress Ring */}
            <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path className="text-white/20" strokeWidth="3.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path className="text-cyan-300 transition-all duration-700 ease-out" strokeDasharray={`${(completedCount / 2) * 100}, 100`} strokeWidth="3.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              </svg>
              <div className="absolute font-black text-xl text-white">{completedCount}/2</div>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-cyan-200 text-xs font-semibold backdrop-blur-md mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{t.todaysGoal || "Today's Hygiene Goal"}</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {t.welcomeBack || "Welcome back"}, {currentUserName}!
              </h2>
              <p className="text-sm text-sky-100/90 font-medium mt-1">
                {completedCount === 2
                  ? (t.bothSessionsDone || "Great job! Both daily sessions completed!")
                  : `${2 - completedCount} ${t.moreSessions || "more session(s) to complete today's goal."}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:shrink-0">
            {/* Goal Completed / Log Session Button - Flexible wrapping without text truncation */}
            <button
              onClick={handleLogBrushingSession}
              disabled={isLogging || completedCount >= 2}
              className="px-5 py-3.5 min-h-[48px] h-auto bg-cyan-400 hover:bg-cyan-300 text-slate-950 rounded-2xl font-extrabold text-xs sm:text-sm tracking-wide shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-90 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 leading-tight whitespace-normal text-center"
            >
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="leading-snug">
                {completedCount >= 2
                  ? (t.goalDone || "Goal Completed Today")
                  : isLogging ? (t.loggingSession || "Logging...")
                  : (t.logSession || "Log Brushing Session")}
              </span>
            </button>

            {/* Profile Button with Prominent White Background */}
            <button
              onClick={() => navigate("/profile")}
              className="px-5 py-3.5 min-h-[48px] h-auto bg-white hover:bg-teal-50 text-teal-900 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 border border-teal-100 shrink-0"
            >
              <UserIcon className="w-4 h-4 text-teal-900 shrink-0" />
              <span>{t.profile || "Profile"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reminder Status Strip */}
      {(morningTime || nightTime) && (
        <div className="flex gap-3">
          <div className={`flex-1 flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold ${morningActive ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            <Bell className="w-4 h-4" />
            <span>Morning: {morningTime || "--:--"}</span>
            <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black ${morningActive ? "bg-amber-200 text-amber-800" : "bg-slate-200 text-slate-500"}`}>
              {morningActive ? (t.reminderActive || "Active") : (t.reminderInactive || "Off")}
            </span>
          </div>
          <div className={`flex-1 flex items-center gap-2 p-3 rounded-2xl border text-xs font-bold ${nightActive ? "bg-indigo-50 border-indigo-200 text-indigo-700" : "bg-slate-50 border-slate-200 text-slate-400"}`}>
            <Bell className="w-4 h-4" />
            <span>Night: {nightTime || "--:--"}</span>
            <span className={`ml-auto px-2 py-0.5 rounded-full text-[10px] font-black ${nightActive ? "bg-indigo-200 text-indigo-800" : "bg-slate-200 text-slate-500"}`}>
              {nightActive ? (t.reminderActive || "Active") : (t.reminderInactive || "Off")}
            </span>
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Left 2 Columns */}
        <div className="md:col-span-2 space-y-6">

          {/* Weekly Progress Tracker */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200/80">
            <div className="flex justify-between items-center mb-6">
              <h4 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-teal-700" />
                {t.weeklyTracker || "Weekly Compliance Tracker"}
              </h4>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{metrics?.weekRangeLabel || "AUG 17 - AUG 23"}</span>
            </div>

            <div className="grid grid-cols-7 gap-1.5 sm:gap-3">
              {DAY_KEYS.map((dayKey, i) => {
                const dayData = metrics?.weeklyHistory?.[DAY_API_KEYS[i]];
                const isDone = i < 2 || (i === 2 && completedCount > 0);
                const sessionCount = i < 2 ? 1 : (i === 2 ? completedCount : 0);
                const dateNums = ["17", "18", "19", "20", "21", "22", "23"];
                return (
                  <div key={i} className="flex flex-col items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400">{t[dayKey] || DAY_API_KEYS[i]}</span>
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex flex-col items-center justify-center font-extrabold text-xs sm:text-sm transition-all relative ${
                      isDone ? "bg-teal-700 text-white shadow-md scale-105" : "bg-slate-50 text-slate-400 border border-slate-200"
                    }`}>
                      <span>{dateNums[i]}</span>
                      {isDone && (
                        <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                          {sessionCount}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => setActiveModal("clean")}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer active:scale-98"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{metrics?.totalSessions || 11}</h3>
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{t.totalCleanSessions || "Total Clean Sessions"}</p>
              </div>
            </div>

            <div 
              onClick={() => setActiveModal("compliance")}
              className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col justify-between hover:shadow-md transition-all cursor-pointer active:scale-98"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{metrics?.weeklyCompliancePct || 28}%</h3>
                <p className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{t.weeklyCompliancePct || "Weekly Compliance"}</p>
              </div>
            </div>
          </div>

          {/* Daily Tip of the Day */}
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 border border-teal-200/60 rounded-3xl p-5 flex items-start gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-teal-700 flex items-center justify-center shrink-0 shadow-md">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-black uppercase tracking-widest text-teal-700 mb-1">{t.dailyTipTitle || "Dental Tip of the Day"}</p>
              <p className="text-sm font-semibold text-slate-700 leading-relaxed">{DAILY_TIPS[tipIndex % DAILY_TIPS.length]}</p>
            </div>
            <button
              onClick={() => setTipIndex(i => (i + 1) % DAILY_TIPS.length)}
              className="shrink-0 text-teal-700 hover:text-teal-900 transition-colors cursor-pointer text-xs font-extrabold px-3 py-1.5 rounded-xl bg-teal-100/80 hover:bg-teal-200 active:scale-95"
            >
              {t.dailyTipNextBtn || "Next Tip"}
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">

          {/* Streak Card */}
          <div 
            onClick={() => setActiveModal("streak")}
            className="bg-gradient-to-br from-amber-50 to-orange-50/60 p-6 rounded-3xl border border-amber-200/60 shadow-sm space-y-3 cursor-pointer hover:shadow-md transition-all active:scale-98"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/20 animate-pulse-glow">
                  <Flame className="w-7 h-7 text-white fill-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-extrabold text-slate-900">{streak || 7} Days</h3>
                  <p className="text-xs font-bold text-amber-700/80 mt-0.5">{t.unbokenStreak || "Unbroken Brushing Streak"}</p>
                </div>
              </div>
            </div>

            {/* Streak Badge */}
            {badge ? (
              <div className={`flex items-center gap-2 p-3 rounded-2xl bg-gradient-to-r ${badge.color} text-white`}>
                <span className="text-xl">{badge.icon}</span>
                <div>
                  <p className="font-black text-sm">{badge.label}</p>
                  <p className="text-[10px] opacity-80">Achievement Unlocked!</p>
                </div>
                <Trophy className="w-5 h-5 ml-auto opacity-80" />
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-100 border border-slate-200 text-center">
                <p className="text-xs text-slate-500 font-medium">{t.badgeLocked || "Keep brushing to unlock badges!"}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">3-day streak earns your first badge</p>
              </div>
            )}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wider">{t.quickActions || "Quick Actions"}</h4>

            <button
              onClick={() => navigate("/chatbot")}
              className="w-full p-4 min-h-[48px] rounded-2xl bg-slate-50 hover:bg-teal-50/80 border border-slate-200/60 transition-all flex items-center justify-between text-left group cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center shrink-0">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-800 group-hover:text-teal-700 transition-colors">{t.drMintyAssistant || "Dr. Minty AI Assistant"}</h5>
                  <p className="text-xs text-slate-500">{t.askDentalQuestions || "Ask dental health questions"}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>

            <button
              onClick={() => navigate("/mirror")}
              className="w-full p-4 min-h-[48px] rounded-2xl bg-slate-50 hover:bg-teal-50/80 border border-slate-200/60 transition-all flex items-center justify-between text-left group cursor-pointer active:scale-95"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-700 flex items-center justify-center shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="font-bold text-sm text-slate-800 group-hover:text-teal-700 transition-colors">{t.smartMirrorCoach || "Smart Mirror Coach"}</h5>
                  <p className="text-xs text-slate-500">{t.guidedTechniqueMirror || "Guided technique mirror"}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform shrink-0" />
            </button>
          </div>

        </div>
      </div>

      {/* Interactive Detail Modals */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-4">
            {activeModal === "streak" && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold">
                    <Flame className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Brushing Streak Breakdown</h3>
                    <p className="text-xs text-slate-500">Unbroken Consistency Milestone</p>
                  </div>
                </div>
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/80 space-y-2">
                  <p className="text-sm font-bold text-amber-900">Current Streak: {streak || 7} Days in a row!</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Brushing 2 minutes twice daily preserves enamel & prevents bacterial bio-film accumulation. Keep going to unlock 14-day Champion status!
                  </p>
                </div>
              </>
            )}

            {activeModal === "clean" && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Total Clean Sessions</h3>
                    <p className="text-xs text-slate-500">Lifetime Brushing History</p>
                  </div>
                </div>
                <div className="bg-teal-50 rounded-2xl p-4 border border-teal-200/80 space-y-2">
                  <p className="text-sm font-bold text-teal-900">Lifetime Clean Sessions: {metrics?.totalSessions || 11}</p>
                  <p className="text-xs text-teal-700 leading-relaxed">
                    Each logged session reflects 2 minutes of active clinical plaque removal. Consistent sessions reduce tooth decay risks by over 80%!
                  </p>
                </div>
              </>
            )}

            {activeModal === "compliance" && (
              <>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Weekly Compliance Rate</h3>
                    <p className="text-xs text-slate-500">Hygiene Goal Analysis</p>
                  </div>
                </div>
                <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-200/80 space-y-2">
                  <p className="text-sm font-bold text-emerald-900">Current Rate: {metrics?.weeklyCompliancePct || 28}%</p>
                  <p className="text-xs text-emerald-700 leading-relaxed">
                    Calculated based on 14 weekly recommended sessions (morning & night). Complete today's second session to boost your rate!
                  </p>
                </div>
              </>
            )}

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-all cursor-pointer"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
