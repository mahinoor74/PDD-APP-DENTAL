import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const SplashPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  const handleStart = () => {
    if (user?.hasCompletedOnboarding) {
      navigate('/dashboard');
    } else {
      navigate('/language');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 text-slate-900 flex flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Soft Decorative Glow Circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-200/40 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-200/40 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center text-center z-10 space-y-8 py-12">
        {/* Animated Brand Logo Icon */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-400 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-1000 animate-pulse" />
          <div className="relative w-28 h-28 rounded-3xl bg-white border border-teal-100 flex items-center justify-center shadow-xl">
            <Sparkles className="w-14 h-14 text-teal-600 animate-bounce" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold">
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span>{t('splash_tag')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            ToothMate{' '}
            <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
              AI
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base max-w-xs mx-auto font-normal leading-relaxed">
            {t('splash_desc')}
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full space-y-4 pt-4">
          <button
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-base shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 group transition duration-300 transform hover:-translate-y-0.5"
          >
            <span>{t('btn_get_started')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => navigate('/auth')}
            className="w-full py-3.5 px-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-200 text-slate-700 text-sm font-bold shadow-sm transition"
          >
            {t('splash_already_registered')}
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="z-10 text-center pb-4 text-xs text-slate-500 flex items-center gap-1.5 font-medium">
        <ShieldCheck className="w-4 h-4 text-teal-600" />
        <span>{t('splash_footer')}</span>
      </div>
    </div>
  );
};
