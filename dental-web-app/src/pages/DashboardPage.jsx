import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Calendar,
  CheckCircle2,
  Circle,
  Play,
  ClipboardCheck,
  MessageSquare,
  FileText,
  Clock,
  Sparkles,
  PlusCircle,
  ChevronRight,
  Trophy,
  RefreshCw,
  Bot,
  FileCheck,
  Camera,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../api/apiService';
import { Toast } from '../components/Toast';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const { user, reminders, latestAssessment } = useAuth();
  const { t } = useLanguage();

  const [metrics, setMetrics] = useState({
    streakDays: 3,
    totalSessions: 14,
    weeklyCompliancePct: 85,
    morningCompletedToday: true,
    nightCompletedToday: false,
    todayCompletedCount: 1,
    weeklyHistory: {
      Mon: { completed: true, count: 2, dayNumber: 17 },
      Tue: { completed: true, count: 2, dayNumber: 18 },
      Wed: { completed: true, count: 2, dayNumber: 19 },
      Thu: { completed: true, count: 1, dayNumber: 20 },
      Fri: { completed: true, count: 1, dayNumber: 21 },
      Sat: { completed: false, count: 0, dayNumber: 22 },
      Sun: { completed: false, count: 0, dayNumber: 23 },
    },
    weekRangeLabel: 'MON - SUN',
    recommendedTechnique: 'Modified Bass Technique',
  });

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchMetrics = async () => {
    if (!user?.id) return;
    try {
      const data = await apiService.getDashboardMetrics(user.id);
      if (data?.success) {
        setMetrics(data);
      }
    } catch (err) {
      console.warn('Failed to load metrics, using default state:', err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [user]);

  // Current local device hour check (04:00 to 15:59 = Morning, 16:00 to 03:59 = Night)
  const currentHour = new Date().getHours();
  const isMorningTime = currentHour >= 4 && currentHour <= 15;

  const handleManualBrushLog = async () => {
    if (!user?.id) return;
    if (metrics.todayCompletedCount >= 2) return;

    setLoading(true);
    try {
      const res = await apiService.logManualBrush(user.id);
      setToastMessage({ message: res.message || 'Brushing session logged!', type: 'success' });
      
      const currentDayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date().getDay()];
      const nextCount = Math.min(2, metrics.todayCompletedCount + 1);

      setMetrics((prev) => ({
        ...prev,
        todayCompletedCount: nextCount,
        streakDays: nextCount === 2 ? prev.streakDays + 1 : prev.streakDays,
        totalSessions: prev.totalSessions + 1,
        morningCompletedToday: nextCount >= 1,
        nightCompletedToday: nextCount >= 2,
        weeklyHistory: {
          ...prev.weeklyHistory,
          [currentDayName]: {
            ...(prev.weeklyHistory[currentDayName] || { dayNumber: new Date().getDate() }),
            completed: true,
            count: nextCount,
          },
        },
      }));

      fetchMetrics();
    } catch (err) {
      const errorDetail = err.response?.data?.detail || 'Daily brushing goals already met for today!';
      setToastMessage({ message: errorDetail, type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const userName = user?.name || 'Mahin';
  const recommendedTechniqueName = latestAssessment?.technique || metrics.recommendedTechnique || 'Modified Bass Technique';

  // Subtitle / Title logic based on completed count & time of day
  const getHeroSubtitle = () => {
    if (metrics.todayCompletedCount >= 2) {
      return "🎉 Today's Goal Completed! Fantastic job!";
    } else if (metrics.todayCompletedCount === 1) {
      return "Halfway there! Complete your night brush later.";
    } else {
      return isMorningTime
        ? "Ready to brush? Complete your morning session!"
        : "Wind down for bed. Complete your night session!";
    }
  };

  // Badge label logic
  const getBadgeText = () => {
    if (metrics.todayCompletedCount >= 2) return "2/2 ✨";
    if (metrics.todayCompletedCount === 1) return "1/2";
    return "0/2";
  };

  // Launcher button text logic
  const getLauncherButtonText = () => {
    if (metrics.todayCompletedCount >= 2) {
      return "✓ Goal Completed Today";
    }
    return isMorningTime ? "Start Morning Brushing ▶" : "Start Night Brushing ▶";
  };

  // Log brush button text logic
  const getLogButtonText = () => {
    if (metrics.todayCompletedCount === 0) return "Log Brush Now (Morning)";
    if (metrics.todayCompletedCount === 1) return "Log Brush Now (Night)";
    return "✓ Goal Completed Today";
  };

  const isGoalFinished = metrics.todayCompletedCount >= 2;

  return (
    <div className="space-y-8 pb-24 md:pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-700 via-purple-600 to-violet-700 text-white p-6 sm:p-8 shadow-2xl shadow-indigo-950/50 border border-indigo-400/30">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-black border border-white/30 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-purple-200" />
                <span>{t('dash_tag')}</span>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-200 text-xs font-black border border-amber-300/40">
                Goal: {getBadgeText()}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              {t('dash_welcome')}, {userName}! 👋
            </h1>

            <p className="text-indigo-100 text-sm font-semibold leading-relaxed">
              {getHeroSubtitle()}
            </p>

            <p className="text-indigo-200/90 text-xs font-medium">
              {t('dash_technique_prefix')}: <span className="font-extrabold text-white underline decoration-purple-300 underline-offset-4">{recommendedTechniqueName}</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
            {/* Interactive "Log Brush Now" Button */}
            <button
              onClick={handleManualBrushLog}
              disabled={isGoalFinished || loading}
              className={`w-full sm:w-auto px-5 py-3.5 rounded-2xl font-bold text-xs sm:text-sm backdrop-blur-md flex items-center justify-center gap-2 transition ${
                isGoalFinished
                  ? 'bg-emerald-950/60 text-emerald-200 border border-emerald-500/40 opacity-80 cursor-not-allowed'
                  : 'bg-white/20 hover:bg-white/30 text-white border border-white/35 cursor-pointer active:scale-95'
              }`}
            >
              {isGoalFinished ? (
                <Lock className="w-4 h-4 text-emerald-300" />
              ) : (
                <PlusCircle className="w-4 h-4 text-purple-200" />
              )}
              <span>{getLogButtonText()}</span>
            </button>

            {/* Time-Based Brushing Session Launcher Button */}
            <button
              onClick={() => {
                if (!isGoalFinished) {
                  navigate('/smart-mirror');
                }
              }}
              disabled={isGoalFinished}
              className={`w-full sm:w-auto px-6 py-3.5 rounded-2xl font-black text-xs sm:text-sm shadow-xl flex items-center justify-center gap-2 transition ${
                isGoalFinished
                  ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40 cursor-not-allowed opacity-75'
                  : 'bg-white text-indigo-950 hover:bg-indigo-50 shadow-indigo-950/20 transform hover:scale-105 cursor-pointer'
              }`}
            >
              {isGoalFinished ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <Play className="w-4 h-4 fill-indigo-950" />
              )}
              <span>{getLauncherButtonText()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Streak Counter Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white p-6 shadow-xl shadow-orange-500/25 border border-amber-300/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-100">
              {t('dash_streak_label')}
            </span>
            <div className="p-2.5 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md">
              <Flame className="w-5 h-5 text-amber-200 fill-amber-200 animate-bounce" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight">{metrics.streakDays}</span>
            <span className="text-sm font-bold text-amber-100">{t('dash_days')}</span>
          </div>
          <p className="text-xs font-medium text-amber-100">
            🔥 Keep your clinical streak alive!
          </p>
        </div>

        {/* Total Sessions Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500 via-blue-600 to-indigo-600 text-white p-6 shadow-xl shadow-cyan-500/25 border border-cyan-300/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-100">
              {t('dash_sessions_label')}
            </span>
            <div className="p-2.5 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md">
              <Trophy className="w-5 h-5 text-cyan-200" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight">{metrics.totalSessions}</span>
            <span className="text-sm font-bold text-cyan-100">{t('dash_sessions')}</span>
          </div>
          <p className="text-xs font-medium text-cyan-100">
            🎯 {metrics.totalSessions * 2} Minutes of hygiene practice!
          </p>
        </div>

        {/* Weekly Adherence Rate */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 text-white p-6 shadow-xl shadow-indigo-500/25 border border-indigo-300/40 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-purple-200">
              {t('dash_compliance_label')}
            </span>
            <div className="p-2.5 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md">
              <CheckCircle2 className="w-5 h-5 text-purple-200" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-black tracking-tight">{metrics.weeklyCompliancePct}%</span>
            <span className="text-sm font-bold text-purple-200">Adherence</span>
          </div>
          <p className="text-xs font-medium text-purple-200">
            ✨ Excellent plaque control habits!
          </p>
        </div>
      </div>

      {/* Weekly Compliance & Alarm Tracker Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Adherence Tracker */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/30 rounded-3xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Calendar className="w-5 h-5 text-teal-600 dark:text-indigo-400" />
              <h2 className="text-base font-black text-slate-900 dark:text-white">{t('dash_weekly_title')}</h2>
            </div>
            <span className="text-[11px] font-extrabold text-teal-700 dark:text-indigo-300 bg-teal-50 dark:bg-indigo-950/90 px-3 py-1 rounded-full border border-teal-200 dark:border-indigo-500/40">
              {metrics.weekRangeLabel}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-2">
            {daysList.map((day) => {
              const dayData = metrics.weeklyHistory[day] || { completed: false, count: 0 };
              const isDone = dayData.completed || dayData.count > 0;
              return (
                <div
                  key={day}
                  className={`flex flex-col items-center justify-between p-3 rounded-2xl border transition-all ${
                    isDone
                      ? 'bg-gradient-to-tr from-teal-500 via-emerald-500 to-indigo-600 dark:from-indigo-500 dark:via-purple-500 dark:to-violet-600 border-teal-400 dark:border-indigo-400 text-white shadow-lg shadow-teal-500/25'
                      : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  <span className="text-[10px] font-black uppercase tracking-wider">{day}</span>
                  <div className="my-2">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-400 dark:text-slate-600" />
                    )}
                  </div>
                  <span className="text-[9px] font-bold opacity-90">{isDone ? `${dayData.count || 1}x` : t('dash_missed')}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Alarms Container */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/30 rounded-3xl p-6 shadow-xl dark:shadow-2xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-teal-600 dark:text-indigo-400" />
              <h2 className="text-base font-black text-slate-900 dark:text-white">{t('dash_reminders_title')}</h2>
            </div>
            <button
              onClick={() => navigate('/profile')}
              className="text-xs text-teal-600 dark:text-indigo-300 hover:underline font-bold cursor-pointer flex items-center gap-1"
            >
              <span>{t('dash_edit_schedule')}</span>
              <ChevronRight className="w-3.5 h-3.5 text-teal-600 dark:text-indigo-400" />
            </button>
          </div>

          <div className="space-y-3">
            {/* Morning Alarm Card */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 text-slate-950 font-black shadow-lg border border-amber-300">
              <div className="flex items-center gap-3">
                <span className="text-xl">☀️</span>
                <div>
                  <div className="text-xs font-black uppercase text-slate-950/80">{t('dash_morning_title')}</div>
                  <div className="text-lg font-mono font-black text-slate-950">{reminders.morningTime || '08:00'} AM</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-950/15 text-slate-950 text-xs font-black">
                {metrics.morningCompletedToday ? t('dash_done') : t('dash_pending')}
              </span>
            </div>

            {/* Night Alarm Card */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold shadow-lg border border-purple-300/40">
              <div className="flex items-center gap-3">
                <span className="text-xl">🌙</span>
                <div>
                  <div className="text-xs font-black uppercase text-purple-200">{t('dash_night_title')}</div>
                  <div className="text-lg font-mono font-black text-white">{reminders.nightTime || '21:30'} PM</div>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black backdrop-blur-md">
                {metrics.nightCompletedToday ? t('dash_done') : t('dash_pending')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Navigation Cards Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>Clinical Features</span>
          <span className="w-2 h-2 rounded-full bg-teal-500 dark:bg-purple-400" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Smart Mirror Feature */}
          <div
            onClick={() => navigate('/smart-mirror')}
            className="group rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/35 hover:border-teal-400 dark:hover:border-indigo-400 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 via-indigo-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-indigo-300 transition">
                {t('dash_card_mirror_title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                {t('dash_card_mirror_desc')}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-teal-600 dark:text-indigo-300 group-hover:translate-x-1 transition-transform">
              <span>{t('btn_start_mirror')}</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Dr. Minty AI Chatbot */}
          <div
            onClick={() => navigate('/chat')}
            className="group rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/35 hover:border-purple-400 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 via-indigo-500 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 transition">
                {t('dash_card_chat_title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                {t('dash_card_chat_desc')}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-purple-600 dark:text-purple-300 group-hover:translate-x-1 transition-transform">
              <span>Consult Dr. Minty</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Diagnostic Assessment */}
          <div
            onClick={() => navigate('/assessment')}
            className="group rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/35 hover:border-cyan-400 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
              <FileCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition">
                {t('dash_card_survey_title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                {t('dash_card_survey_desc')}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-cyan-600 dark:text-cyan-300 group-hover:translate-x-1 transition-transform">
              <span>Take Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Rx Prescription Document */}
          <div
            onClick={() => navigate('/prescription')}
            className="group rounded-3xl p-6 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-indigo-500/35 hover:border-rose-400 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all cursor-pointer space-y-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-pink-300 transition">
                {t('dash_card_rx_title')}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                {t('dash_card_rx_desc')}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-black text-rose-600 dark:text-pink-300 group-hover:translate-x-1 transition-transform">
              <span>View Prescription</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
