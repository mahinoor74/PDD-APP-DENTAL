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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 text-slate-900 flex flex-col items-center justify-between p-6 relative overflow-hidden">
      <div className="w-full max-w-md mx-auto my-auto space-y-6 py-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-100/80 border border-teal-200 text-teal-800 text-xs font-bold">
            <Globe className="w-4 h-4 text-teal-600" />
            <span>{t('lang_tag')}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {t('lang_title')}
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm">
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
                className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-teal-50 to-emerald-50 border-teal-500 text-teal-900 shadow-md shadow-teal-600/10'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-teal-200 hover:bg-teal-50/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{lang.flag}</span>
                  <div className="text-left">
                    <div className="text-sm font-extrabold">{lang.name}</div>
                    <div className="text-xs text-slate-500">{lang.native}</div>
                  </div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-sm">
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
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-extrabold text-base shadow-lg shadow-teal-600/25 flex items-center justify-center gap-2 transition duration-300"
        >
          <span>{t('btn_continue')}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
