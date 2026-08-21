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
    <header className="sticky top-0 z-50 w-full bg-slate-900/90 backdrop-blur-2xl border-b border-indigo-500/30 shadow-2xl px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        {/* Logo & Brand */}
        <div className="flex items-center gap-3.5 cursor-pointer shrink-0" onClick={() => navigate('/dashboard')}>
          <div className="bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 text-white font-black p-2.5 rounded-2xl shadow-lg shadow-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight text-white">
                ToothMate <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">AI</span>
              </span>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/40 shadow-sm">
                {t('nav_pro_badge')}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
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
                  `flex items-center rounded-xl px-4 py-2.5 text-xs lg:text-sm transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white font-black shadow-lg shadow-indigo-500/30 scale-105'
                      : 'text-slate-300 hover:text-white hover:bg-white/10 font-bold'
                  }`
                }
              >
                <Icon className="w-4 h-4 mr-2" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Language Selector & User Profile Badge */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Global Language Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-slate-800/90 px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-slate-700/80 shadow-md transition cursor-pointer"
            >
              <span>{currentLangObj.flag}</span>
              <span className="hidden sm:inline">{currentLangObj.name}</span>
              <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
            </button>

            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-40 rounded-2xl bg-slate-900 border border-indigo-500/40 shadow-2xl py-1.5 z-50 overflow-hidden backdrop-blur-2xl">
                {LANG_OPTIONS.map((opt) => (
                  <button
                    key={opt.code}
                    onClick={() => {
                      setLanguage(opt.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      language === opt.code
                        ? 'bg-indigo-500/20 text-indigo-300 font-black'
                        : 'text-slate-300 hover:bg-slate-800'
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

          {/* User Profile Badge */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/90 border border-indigo-500/40 rounded-full px-4 py-1.5 shadow-md">
            <span className="font-black text-white text-xs">
              {user?.name || 'Mahin'}
            </span>
            <span className="text-[10px] text-indigo-300 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
              {user?.ageGroup ? user.ageGroup.toUpperCase() : 'ADULT'}
            </span>
          </div>

          {user ? (
            <button
              onClick={handleLogout}
              title={t('nav_sign_out')}
              className="p-2.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <NavLink
              to="/auth"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-black shadow-lg shadow-indigo-500/25 hover:brightness-110 transition"
            >
              {t('nav_sign_in')}
            </NavLink>
          )}
        </div>
      </div>
    </header>
  );
};
