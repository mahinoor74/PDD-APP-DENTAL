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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 border-t border-teal-100 shadow-lg backdrop-blur-md px-2 py-1.5">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                  isActive
                    ? 'text-teal-700 font-bold scale-105'
                    : 'text-slate-400 hover:text-slate-700'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-semibold tracking-tight truncate max-w-[64px]">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
