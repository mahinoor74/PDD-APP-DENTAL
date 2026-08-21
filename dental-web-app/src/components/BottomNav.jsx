import React from 'react';
import { NavLink } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import {
  LayoutDashboard,
  Camera,
  ClipboardList,
  MessageSquare,
  User,
} from 'lucide-react';

export const BottomNav = () => {
  const { t } = useLanguage();

  const navItems = [
    { label: t('nav_dashboard'), path: '/dashboard', icon: LayoutDashboard },
    { label: t('nav_smart_mirror'), path: '/smart-mirror', icon: Camera },
    { label: t('nav_assessment'), path: '/assessment', icon: ClipboardList },
    { label: t('nav_dr_minty'), path: '/chat', icon: MessageSquare },
    { label: t('nav_profile'), path: '/profile', icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900/95 backdrop-blur-2xl border-t border-indigo-500/30 px-3 py-2 md:hidden shadow-2xl">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 p-2 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer ${
                  isActive
                    ? 'text-indigo-300 scale-110 drop-shadow-[0_0_10px_rgba(129,140,248,0.5)]'
                    : 'text-slate-400 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </div>
  );
};
