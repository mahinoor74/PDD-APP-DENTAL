import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Clock,
  Globe,
  Save,
  LogOut,
  Bell,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../api/apiService';
import { Toast } from '../components/Toast';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Mandarin', native: '中文', flag: '🇨🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
];

export const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, reminders, updateProfile, setReminders, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [ageGroup, setAgeGroup] = useState(user?.ageGroup || 'adult');
  const [gender, setGender] = useState(user?.gender || 'other');

  const [morningTime, setMorningTime] = useState(reminders?.morningTime || '08:00');
  const [nightTime, setNightTime] = useState(reminders?.nightTime || '21:30');

  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (user?.id) {
        await apiService.updateDemographics({
          userId: user.id,
          name,
          ageGroup,
          gender,
        });
      }
      updateProfile({ name, ageGroup, gender });
      setToastMessage({ message: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      updateProfile({ name, ageGroup, gender });
      setToastMessage({ message: 'Profile updated locally.', type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReminders = async () => {
    setLoading(true);
    try {
      if (user?.id) {
        await apiService.saveReminders({
          userId: user.id,
          morningTime24h: morningTime,
          nightTime24h: nightTime,
        });
      }
      setReminders({ morningTime, nightTime });
      setToastMessage({ message: 'Brushing reminders saved!', type: 'success' });
    } catch (err) {
      setReminders({ morningTime, nightTime });
      setToastMessage({ message: 'Reminders saved locally.', type: 'info' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Hero Profile Card */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-violet-700 text-white p-6 sm:p-8 rounded-3xl shadow-2xl shadow-indigo-950/40 border border-indigo-400/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 p-0.5 shadow-xl flex items-center justify-center backdrop-blur-md">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-xl font-black text-indigo-950">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">{user?.name || 'Mahin'}</h1>
            <p className="text-xs text-indigo-100 font-medium">{user?.email || 'mahin@toothmate.com'}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white uppercase backdrop-blur-md">
                {user?.ageGroup || 'Adult'} Care Profile
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            logout();
            navigate('/auth');
          }}
          className="px-4 py-2.5 rounded-2xl bg-white/20 hover:bg-white/30 text-white border border-white/35 text-xs font-black flex items-center gap-2 transition backdrop-blur-md cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('nav_sign_out')}</span>
        </button>
      </div>

      {/* Demographics Form */}
      <form onSubmit={handleSaveProfile} className="bg-slate-900/90 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl space-y-4 backdrop-blur-xl text-white">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-black text-white">{t('prof_demographics_title')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-black text-slate-300 uppercase">{t('demo_name_label')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-indigo-500/40 text-xs font-semibold text-white focus:outline-none focus:border-indigo-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-300 uppercase">{t('demo_age_label')}</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-indigo-500/40 text-xs font-semibold text-white focus:outline-none focus:border-indigo-400"
            >
              <option value="child" className="bg-slate-900 text-white">{t('demo_child')}</option>
              <option value="adult" className="bg-slate-900 text-white">{t('demo_adult')}</option>
              <option value="senior" className="bg-slate-900 text-white">{t('demo_senior')}</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-black text-slate-300 uppercase">{t('demo_gender_label')}</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/90 border border-indigo-500/40 text-xs font-semibold text-white focus:outline-none focus:border-indigo-400"
            >
              <option value="male" className="bg-slate-900 text-white">{t('demo_male')}</option>
              <option value="female" className="bg-slate-900 text-white">{t('demo_female')}</option>
              <option value="other" className="bg-slate-900 text-white">{t('demo_other')}</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white font-black text-xs flex items-center gap-1.5 transition ml-auto shadow-lg shadow-indigo-500/30 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{t('btn_save')}</span>
        </button>
      </form>

      {/* Reminder Schedule Settings */}
      <div className="bg-slate-900/90 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl space-y-4 backdrop-blur-xl text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-black text-white">{t('prof_reminders_title')}</h2>
          </div>
          <span className="text-[11px] text-indigo-300 font-mono font-black">24H TIMERS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Morning Reminder Container */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/40 space-y-2">
            <label className="text-xs font-black text-amber-300">{t('prof_morning_alarm')}</label>
            <input
              type="time"
              value={morningTime}
              onChange={(e) => setMorningTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-amber-400/50 text-sm font-mono text-amber-200 font-bold focus:outline-none"
            />
          </div>

          {/* Night Reminder Container */}
          <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-400/40 space-y-2">
            <label className="text-xs font-black text-purple-300">{t('prof_night_alarm')}</label>
            <input
              type="time"
              value={nightTime}
              onChange={(e) => setNightTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900 border border-purple-400/50 text-sm font-mono text-purple-200 font-bold focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSaveReminders}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white font-black text-xs flex items-center gap-1.5 transition ml-auto shadow-lg shadow-indigo-500/30 cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{t('prof_save_reminders')}</span>
        </button>
      </div>

      {/* Language Preferences */}
      <div className="bg-slate-900/90 border border-indigo-500/30 p-6 rounded-3xl shadow-2xl space-y-4 backdrop-blur-xl text-white">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-400" />
          <h2 className="text-base font-black text-white">{t('prof_lang_title')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code);
                  setToastMessage({ message: `Language set to ${lang.name}`, type: 'success' });
                }}
                className={`py-3 px-3.5 rounded-2xl border text-xs font-bold transition flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-500/20 border-indigo-400 text-indigo-200 font-black shadow-md'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-700/80'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
                {isSelected && <Check className="w-4 h-4 text-indigo-400 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
