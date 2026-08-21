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
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,rgba(129,140,248,0.28)_0%,transparent_50%),radial-gradient(circle_at_85%_15%,rgba(192,132,252,0.28)_0%,transparent_50%),radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.22)_0%,transparent_60%),radial-gradient(circle_at_85%_85%,rgba(236,72,153,0.2)_0%,transparent_50%),#0F172A] text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
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
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black shadow-sm">
            <User className="w-4 h-4 text-indigo-400" />
            <span>{t('demo_tag')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t('demo_title')}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm font-medium">
            {t('demo_desc')}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
              {t('demo_name_label')}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('demo_name_placeholder')}
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-900/90 border border-indigo-500/40 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-400 transition shadow-lg font-bold"
            />
          </div>

          {/* Age Group Selection */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
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
                    className={`flex items-center gap-3 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border-2 border-indigo-400 text-white shadow-xl shadow-indigo-500/25'
                        : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-indigo-400/60'
                    }`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <div>
                      <div className="text-sm font-black">{opt.label}</div>
                      <div className="text-xs text-slate-400 font-medium">{opt.desc}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-300 uppercase tracking-wider">
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
                  className={`py-2.5 rounded-xl border text-xs font-black transition cursor-pointer ${
                    gender === g.id
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white font-black border-indigo-400 shadow-md'
                      : 'bg-slate-900/90 border-slate-700/80 text-slate-300 hover:border-indigo-400/60'
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
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-base shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition duration-300 disabled:opacity-50 cursor-pointer transform hover:scale-[1.01]"
          >
            <span>{loading ? t('btn_saving') : t('btn_save_continue')}</span>
            <ArrowRight className="w-5 h-5 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
};
