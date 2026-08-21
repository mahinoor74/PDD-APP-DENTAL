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
      <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-teal-900/20 border border-teal-400/30 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 p-0.5 shadow-xl flex items-center justify-center backdrop-blur-md">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center text-xl font-black text-teal-800">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
            </div>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black">{user?.name || 'Mahin'}</h1>
            <p className="text-xs text-teal-100 font-medium">{user?.email || 'mahin@toothmate.com'}</p>
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
          className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs font-extrabold flex items-center gap-2 transition backdrop-blur-md cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>{t('nav_sign_out')}</span>
        </button>
      </div>

      {/* Demographics Form */}
      <form onSubmit={handleSaveProfile} className="bg-white p-6 rounded-3xl border border-teal-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="w-5 h-5 text-teal-600" />
          <h2 className="text-base font-extrabold text-slate-900">{t('prof_demographics_title')}</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-700 uppercase">{t('demo_name_label')}</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-700 uppercase">{t('demo_age_label')}</label>
            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-500"
            >
              <option value="child">{t('demo_child')}</option>
              <option value="adult">{t('demo_adult')}</option>
              <option value="senior">{t('demo_senior')}</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-extrabold text-slate-700 uppercase">{t('demo_gender_label')}</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:border-teal-500"
            >
              <option value="male">{t('demo_male')}</option>
              <option value="female">{t('demo_female')}</option>
              <option value="other">{t('demo_other')}</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 transition ml-auto shadow-md shadow-teal-600/20 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{t('btn_save')}</span>
        </button>
      </form>

      {/* Reminder Schedule Settings */}
      <div className="bg-white p-6 rounded-3xl border border-teal-100 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-600" />
            <h2 className="text-base font-extrabold text-slate-900">{t('prof_reminders_title')}</h2>
          </div>
          <span className="text-[11px] text-teal-700 font-mono font-bold">24H TIMERS</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Morning Reminder Container */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2">
            <label className="text-xs font-extrabold text-amber-900">{t('prof_morning_alarm')}</label>
            <input
              type="time"
              value={morningTime}
              onChange={(e) => setMorningTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-amber-300 text-sm font-mono text-amber-950 font-bold focus:outline-none"
            />
          </div>

          {/* Night Reminder Container */}
          <div className="p-4 rounded-2xl bg-purple-50/80 border border-purple-200 space-y-2">
            <label className="text-xs font-extrabold text-purple-900">{t('prof_night_alarm')}</label>
            <input
              type="time"
              value={nightTime}
              onChange={(e) => setNightTime(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-purple-300 text-sm font-mono text-purple-950 font-bold focus:outline-none"
            />
          </div>
        </div>

        <button
          onClick={handleSaveReminders}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-extrabold text-xs flex items-center gap-1.5 transition ml-auto shadow-md shadow-teal-600/20 cursor-pointer"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>{t('prof_save_reminders')}</span>
        </button>
      </div>

      {/* Language Preferences */}
      <div className="bg-white p-6 rounded-3xl border border-teal-100 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-extrabold text-slate-900">{t('prof_lang_title')}</h2>
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
                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-extrabold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="flex items-center gap-2">
                  <span className="text-lg">{lang.flag}</span>
                  <span>{lang.name}</span>
                </span>
                {isSelected && <Check className="w-4 h-4 text-teal-600 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
