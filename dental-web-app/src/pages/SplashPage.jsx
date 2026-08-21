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
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,rgba(129,140,248,0.28)_0%,transparent_50%),radial-gradient(circle_at_85%_15%,rgba(192,132,252,0.28)_0%,transparent_50%),radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.22)_0%,transparent_60%),radial-gradient(circle_at_85%_85%,rgba(236,72,153,0.2)_0%,transparent_50%),#0F172A] text-slate-100 flex flex-col items-center justify-between p-6 relative overflow-hidden">
      {/* Soft Decorative Glow Circles */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md mx-auto my-auto flex flex-col items-center text-center z-10 space-y-8 py-12">
        {/* Animated Brand Logo Icon */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000 animate-pulse" />
          <div className="relative w-28 h-28 rounded-3xl bg-slate-900 border border-indigo-400/50 flex items-center justify-center shadow-2xl">
            <Sparkles className="w-14 h-14 text-indigo-300 animate-bounce" />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black shadow-sm">
            <HeartPulse className="w-4 h-4 text-purple-400" />
            <span>{t('splash_tag')}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            ToothMate{' '}
            <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">
              AI
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-xs mx-auto font-medium leading-relaxed">
            {t('splash_desc')}
          </p>
        </div>

        {/* Action Button */}
        <div className="w-full space-y-4 pt-4">
          <button
            onClick={handleStart}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-base shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 group transition duration-300 transform hover:-translate-y-0.5 cursor-pointer"
          >
            <span>{t('btn_get_started')}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-white" />
          </button>

          <button
            onClick={() => navigate('/auth')}
            className="w-full py-3.5 px-6 rounded-2xl bg-slate-900/90 border border-indigo-500/40 hover:border-indigo-400 text-slate-200 text-sm font-black shadow-lg transition cursor-pointer"
          >
            {t('splash_already_registered')}
          </button>
        </div>
      </div>

      {/* Footer info */}
      <div className="z-10 text-center pb-4 text-xs text-slate-400 flex items-center gap-1.5 font-semibold">
        <ShieldCheck className="w-4 h-4 text-purple-400" />
        <span>{t('splash_footer')}</span>
      </div>
    </div>
  );
};
