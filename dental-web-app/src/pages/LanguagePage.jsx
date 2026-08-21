import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, ArrowRight, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: 'Mandarin', native: '中文', flag: '🇨🇳' },
  { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
];

export const LanguagePage = () => {
  const navigate = useNavigate();
  const { language, setLanguage, t } = useLanguage();

  const handleSelect = (langCode) => {
    setLanguage(langCode);
  };

  const handleContinue = () => {
    navigate('/demographics');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,rgba(129,140,248,0.28)_0%,transparent_50%),radial-gradient(circle_at_85%_15%,rgba(192,132,252,0.28)_0%,transparent_50%),radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.22)_0%,transparent_60%),radial-gradient(circle_at_85%_85%,rgba(236,72,153,0.2)_0%,transparent_50%),#0F172A] text-slate-100 flex flex-col items-center justify-between p-6 relative overflow-hidden">
      <div className="w-full max-w-md mx-auto my-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-indigo-300 text-xs font-black shadow-sm">
            <Globe className="w-4 h-4 text-indigo-400" />
            <span>{t('lang_tag')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            {t('lang_title')}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm font-medium">
            {t('lang_desc')}
          </p>
        </div>

        {/* Language Selection Grid */}
        <div className="grid grid-cols-1 gap-2.5">
          {LANGUAGES.map((lang) => {
            const isSelected = language === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-indigo-950 via-purple-950 to-slate-900 border-2 border-indigo-400 text-white shadow-xl shadow-indigo-500/25'
                    : 'bg-slate-900/90 border-slate-700/80 text-slate-200 hover:border-indigo-400/60 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <div className="text-sm font-black">{lang.name}</div>
                    <div className="text-xs text-slate-400 font-medium">{lang.native}</div>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-indigo-400 text-slate-955 flex items-center justify-center shadow-md">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <button
          onClick={handleContinue}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-black text-base shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2 transition duration-300 cursor-pointer transform hover:scale-[1.01]"
        >
          <span>{t('btn_continue')}</span>
          <ArrowRight className="w-5 h-5 text-white" />
        </button>
      </div>
    </div>
  );
};
