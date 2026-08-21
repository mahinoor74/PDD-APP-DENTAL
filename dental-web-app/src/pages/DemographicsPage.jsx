import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../api/apiService';
import { Toast } from '../components/Toast';

export const DemographicsPage = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();

  const [name, setName] = useState(user?.name || '');
  const [ageGroup, setAgeGroup] = useState(user?.ageGroup || 'adult');
  const [gender, setGender] = useState(user?.gender || 'other');
  const [loading, setLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const ageOptions = [
    { id: 'child', label: t('demo_child'), icon: '🧸', desc: t('demo_child_desc') },
    { id: 'adult', label: t('demo_adult'), icon: '🧑', desc: t('demo_adult_desc') },
    { id: 'senior', label: t('demo_senior'), icon: '👴', desc: t('demo_senior_desc') },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setToastMessage({ message: 'Please enter your name.', type: 'error' });
      return;
    }

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
      updateProfile({ name, ageGroup, gender, hasCompletedOnboarding: true });
      setToastMessage({ message: 'Profile set up successfully!', type: 'success' });
      setTimeout(() => {
        navigate('/dashboard');
      }, 500);
    } catch (err) {
      console.warn("Demographics save error:", err);
      updateProfile({ name, ageGroup, gender, hasCompletedOnboarding: true });
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 text-slate-900 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {toastMessage && (
        <Toast
          message={toastMessage.message}
          type={toastMessage.type}
          onClose={() => setToastMessage(null)}
        />
      )}

      <div className="w-full max-w-md mx-auto space-y-6 py-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold">
            <User className="w-4 h-4 text-teal-600" />
            <span>{t('demo_tag')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('demo_title')}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
            {t('demo_desc')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('demo_name_label')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('demo_name_placeholder')}
              className="w-full px-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition shadow-sm font-semibold"
            />
          </div>

          {/* Age Group Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('demo_age_label')}
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {ageOptions.map((opt) => {
                const isSelected = ageGroup === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    onClick={() => setAgeGroup(opt.id)}
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-500 text-teal-900 shadow-md shadow-teal-600/10'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-teal-200'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <div className="text-sm font-extrabold">{opt.label}</div>
                      <div className="text-xs text-slate-500">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {t('demo_gender_label')}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'male', label: t('demo_male') },
                { id: 'female', label: t('demo_female') },
                { id: 'other', label: t('demo_other') },
              ].map((g) => (
                <button
                  type="button"
                  key={g.id}
                  onClick={() => setGender(g.id)}
                  className={`py-2.5 rounded-xl border text-xs font-bold transition ${
                    gender === g.id
                      ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-teal-200'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-base shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50"
          >
            <span>{loading ? t('btn_saving') : t('btn_save_continue')}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
