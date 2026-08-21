import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Camera,
  ClipboardList,
  MessageSquare,
  FileText,
  User,
  LogOut,
  Sparkles,
  ShieldCheck,
  Globe,
  ChevronDown,
} from 'lucide-react';

const LANG_OPTIONS = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ta', name: 'தமிழ்', flag: '🇮🇳' },
];

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  const currentLangObj = LANG_OPTIONS.find((l) => l.code === language) || LANG_OPTIONS[0];

  const navItems = [
    { label: t('nav_dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('nav_smart_mirror'), path: '/smart-mirror', icon: Camera },
    { label: t('nav_assessment'), path: '/assessment', icon: ClipboardList },
    { label: t('nav_dr_minty'), path: '/chat', icon: MessageSquare },
    { label: t('nav_prescription'), path: '/prescription', icon: FileText },
    { label: t('nav_profile'), path: '/profile', icon: User },
  ];

  return (
    <header className="bg-white/85 backdrop-blur-xl border-b border-teal-100 shadow-sm px-8 py-3.5 flex justify-between items-center sticky top-0 z-50">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3.5 cursor-pointer shrink-0" onClick={() => navigate('/dashboard')}>
          <div className="bg-gradient-to-tr from-teal-600 via-emerald-500 to-cyan-500 text-white font-bold p-2.5 rounded-2xl shadow-md shadow-teal-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                ToothMate <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                {t('nav_pro_badge')}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
              {t('nav_subtitle')}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-4 py-2 text-xs lg:text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold shadow-md shadow-teal-600/25'
                      : 'text-slate-600 hover:text-teal-700 hover:bg-teal-50 font-semibold'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-2" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Language Selector & User Action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Global Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-teal-50 shadow-xs transition cursor-pointer"
            >
              <span>{currentLangObj.flag}</span>
              <span className="hidden sm:inline">{currentLangObj.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white border border-teal-100 shadow-xl py-1.5 z-50 overflow-hidden">
                {LANG_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      language === opt.code
                        ? 'bg-teal-50 text-teal-700 font-extrabold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span>{opt.flag}</span>
                      <span>{opt.name}</span>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="hidden sm:flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 shadow-xs text-xs font-semibold text-slate-800">
            <span className="font-bold text-slate-900">
              {user?.name || 'Mahin'}
            </span>
            <span className="text-[10px] text-teal-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              {user?.ageGroup ? user.ageGroup.toUpperCase() : 'ADULT'}
            </span>
          </div>

          {user ? (
            <button
              onClick={handleLogout}
              title={t('nav_sign_out')}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <NavLink
              to="/auth"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20 transition"
            >
              {t('nav_sign_in')}
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};
