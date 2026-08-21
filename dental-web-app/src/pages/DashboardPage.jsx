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
      if (data.success) {
        setMetrics(data);
      }
    } catch (err) {
      console.warn("Failed to load metrics, using default state:", err);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [user]);

  const handleManualBrushLog = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await apiService.logManualBrush(user.id);
      setToastMessage({ message: res.message || 'Brushing session logged!', type: 'success' });
      fetchMetrics();
    } catch (err) {
      const errorDetail = err.response?.data?.detail || 'Daily brushing goals already met for today!';
      setToastMessage({ message: errorDetail, type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  const daysList = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Today's Goal Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-teal-900/20 border border-teal-400/30">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/20 border border-white/30 text-white text-xs font-black backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-200 animate-pulse" />
              <span>{t('dash_tag')}</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
              {t('dash_welcome')}, {user?.name || 'Mahin'}! 👋
            </h1>
            <p className="text-teal-100 text-xs sm:text-sm max-w-lg font-medium">
              {t('dash_technique_prefix')}{' '}
              <span className="text-amber-300 font-black underline underline-offset-4">
                {latestAssessment?.technique || metrics.recommendedTechnique}
              </span>.
            </p>
          </div>

          {/* Quick Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleManualBrushLog}
              disabled={loading}
              className="px-5 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/35 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md backdrop-blur-md transition cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 text-emerald-300" />
              <span>{t('btn_log_brush')}</span>
            </button>

            <button
              onClick={() => navigate('/smart-mirror')}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-teal-50 text-teal-900 font-black text-xs sm:text-sm shadow-lg flex items-center justify-center gap-2 transition transform hover:scale-[1.02] cursor-pointer"
            >
              <Play className="w-4 h-4 fill-teal-900 text-teal-900" />
              <span>{t('btn_start_mirror')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Row: Streak, Clean Sessions, Compliance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Streak Card */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white rounded-3xl p-5 shadow-lg shadow-orange-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-orange-100">
              {t('dash_streak_label')}
            </span>
            <div className="text-3xl font-black text-white flex items-baseline gap-1">
              <span>{metrics.streakDays}</span>
              <span className="text-xs text-orange-100 font-bold">{t('dash_days')}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md">
            <Flame className="w-7 h-7 text-white animate-pulse" />
          </div>
        </div>

        {/* Trophy Card */}
        <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-3xl p-5 shadow-lg shadow-cyan-500/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-100">
              {t('dash_sessions_label')}
            </span>
            <div className="text-3xl font-black text-white flex items-baseline gap-1">
              <span>{metrics.totalSessions}</span>
              <span className="text-xs text-cyan-100 font-bold">{t('dash_sessions')}</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md">
            <Trophy className="w-7 h-7 text-white" />
          </div>
        </div>

        {/* Compliance Card */}
        <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-3xl p-5 shadow-lg shadow-teal-600/20 flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-teal-100">
              {t('dash_compliance_label')}
            </span>
            <div className="text-3xl font-black text-white flex items-baseline gap-1">
              <span>{metrics.weeklyCompliancePct}%</span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md">
            <Calendar className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      {/* Weekly Compliance Calendar & Daily Reminders Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mon-Sun Compliance Calendar (2 Columns) */}
        <div className="lg:col-span-2 bg-white border border-teal-100 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-black text-slate-900">
                {t('dash_weekly_title')}
              </h2>
            </div>
            <span className="text-xs font-mono font-black text-teal-800 px-3 py-1 rounded-full bg-teal-50 border border-teal-200">
              {metrics.weekRangeLabel}
            </span>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2.5 pt-2">
            {daysList.map((day) => {
              const dayData = metrics.weeklyHistory[day] || { completed: false, count: 0 };
              const isDone = dayData.completed;
              return (
                <div
                  key={day}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition ${
                    isDone
                      ? 'bg-gradient-to-tr from-teal-600 to-emerald-600 text-white font-black shadow-md border-teal-500'
                      : 'bg-slate-50 border-slate-200 text-slate-400 font-semibold'
                  }`}
                >
                  <span className="text-xs font-black uppercase">{day}</span>
                  <div className="my-2">
                    {isDone ? (
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    ) : (
                      <Circle className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <span className={`text-[10px] font-bold ${isDone ? 'text-teal-100' : 'text-slate-400'}`}>
                    {dayData.count > 0 ? `${dayData.count}x` : t('dash_missed')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Daily Reminders Card */}
        <div className="bg-white border border-teal-100 rounded-3xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-5 h-5 text-teal-600" />
              <h2 className="text-base font-black text-slate-900">{t('dash_reminders_title')}</h2>
            </div>

            <div className="space-y-3">
              {/* Morning Reminder Card */}
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-bold rounded-2xl p-4 shadow-md shadow-amber-500/20 border border-amber-300 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-950/20 text-slate-950 font-black text-xs flex items-center justify-center">
                    AM
                  </div>
                  <div>
                    <div className="text-xs font-black">{t('dash_morning_title')}</div>
                    <div className="text-[11px] text-slate-900 font-bold">{reminders.morningTime} AM</div>
                  </div>
                </div>
                {metrics.morningCompletedToday ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-950 text-emerald-300 shadow-xs">
                    {t('dash_done')}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-slate-950/20 text-slate-950 border border-slate-950/30">
                    {t('dash_pending')}
                  </span>
                )}
              </div>

              {/* Night Reminder Card */}
              <div className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-2xl p-4 shadow-md shadow-indigo-500/20 border border-indigo-300/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white/20 text-white font-black text-xs flex items-center justify-center">
                    PM
                  </div>
                  <div>
                    <div className="text-xs font-black">{t('dash_night_title')}</div>
                    <div className="text-[11px] text-purple-100 font-bold">{reminders.nightTime} PM</div>
                  </div>
                </div>
                {metrics.nightCompletedToday ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-400 text-slate-950 shadow-xs">
                    {t('dash_done')}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30">
                    {t('dash_pending')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/profile')}
            className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 flex items-center justify-center gap-1 transition cursor-pointer border border-slate-200"
          >
            <span>{t('dash_edit_schedule')}</span>
            <ChevronRight className="w-3.5 h-3.5 text-teal-600" />
          </button>
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Smart Mirror Card */}
        <div
          onClick={() => navigate('/smart-mirror')}
          className="bg-white border border-teal-100 rounded-3xl p-6 shadow-sm cursor-pointer group hover:border-teal-400 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-4 group-hover:bg-teal-600 transition group-hover:text-white">
            <Play className="w-6 h-6 text-teal-600 fill-teal-600 group-hover:fill-white group-hover:text-white transition" />
          </div>
          <h3 className="text-base font-black text-slate-900 mb-1">{t('dash_card_mirror_title')}</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {t('dash_card_mirror_desc')}
          </p>
        </div>

        {/* Diagnostic Assessment Card */}
        <div
          onClick={() => navigate('/assessment')}
          className="bg-white border border-emerald-100 rounded-3xl p-6 shadow-sm cursor-pointer group hover:border-emerald-400 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition">
            <ClipboardCheck className="w-6 h-6 text-emerald-600 group-hover:text-white transition" />
          </div>
          <h3 className="text-base font-black text-slate-900 mb-1">{t('dash_card_survey_title')}</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {t('dash_card_survey_desc')}
          </p>
        </div>

        {/* Dr Minty Chat Card */}
        <div
          onClick={() => navigate('/chat')}
          className="bg-white border border-indigo-100 rounded-3xl p-6 shadow-sm cursor-pointer group hover:border-indigo-400 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition">
            <MessageSquare className="w-6 h-6 text-indigo-600 group-hover:text-white transition" />
          </div>
          <h3 className="text-base font-black text-slate-900 mb-1">{t('dash_card_chat_title')}</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {t('dash_card_chat_desc')}
          </p>
        </div>

        {/* Prescription Card */}
        <div
          onClick={() => navigate('/prescription')}
          className="bg-white border border-teal-100 rounded-3xl p-6 shadow-sm cursor-pointer group hover:border-teal-400 hover:shadow-md transition-all"
        >
          <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mb-4 group-hover:bg-teal-600 transition">
            <FileText className="w-6 h-6 text-teal-600 group-hover:text-white transition" />
          </div>
          <h3 className="text-base font-black text-slate-900 mb-1">{t('dash_card_rx_title')}</h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            {t('dash_card_rx_desc')}
          </p>
        </div>
      </div>
    </div>
  );
};
