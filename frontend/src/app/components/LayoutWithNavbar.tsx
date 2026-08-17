import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, Camera, MessageSquare, User, Sparkles, Activity, 
  ShieldCheck, LogOut, Sun, Moon 
} from "lucide-react";
import { useGlobalReminders } from "./useReminders";
import { useLanguage } from "./LanguageContext";
import LanguageSelector from "./LanguageSelector";

export default function LayoutWithNavbar({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  const location = useLocation();
  const navigate = useNavigate();
  const activePath = location.pathname;
  const currentUserName = localStorage.getItem("userName") || "ToothMate User";

  // Global Theme Mode State ('light' | 'dark')
  const [theme, setTheme] = useState<string>(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === "dark" ? "light" : "dark"));
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out of ToothMate?")) {
      localStorage.removeItem("userId");
      localStorage.removeItem("userName");
      localStorage.removeItem("userEmail");
      navigate("/auth");
    }
  };

  const getMobileTabClass = (path: string) => {
    const isSelected = activePath === path;
    return `flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 text-[11px] font-extrabold transition-all duration-200 active:scale-95 ${
      isSelected 
        ? "text-sky-500 scale-105" 
        : theme === "dark" ? "text-slate-400 hover:text-slate-200" : "text-slate-500 hover:text-slate-800"
    }`;
  };

  const getDesktopSidebarClass = (path: string) => {
    const isSelected = activePath === path;
    if (theme === "dark") {
      return `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 min-h-[48px] ${
        isSelected
          ? "bg-sky-500/20 text-cyan-300 border border-cyan-400/30 shadow-md shadow-cyan-500/10"
          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
      }`;
    }
    return `flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200 min-h-[48px] ${
      isSelected
        ? "bg-sky-500/10 text-sky-600 border border-sky-200/80 shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;
  };

  return (
    <div className={`h-[100dvh] w-full flex flex-col md:flex-row font-sans antialiased transition-colors duration-300 selection:bg-sky-500 selection:text-white overflow-hidden ${
      theme === "dark" ? "bg-slate-950 text-slate-100 dark" : "bg-slate-50 text-slate-900"
    }`}>
      
      {/* Desktop Sticky Sidebar */}
      <aside className={`hidden md:flex flex-col w-72 h-screen sticky top-0 backdrop-blur-xl border-r p-6 z-40 justify-between shrink-0 shadow-sm transition-colors duration-300 ${
        theme === "dark" 
          ? "bg-slate-900/95 border-slate-800 text-slate-100" 
          : "bg-white/90 border-slate-200/80 text-slate-900"
      }`}>
        <div>
          {/* Logo & Brand Header */}
          <div className="flex items-center justify-between mb-6 px-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl gradient-teal flex items-center justify-center text-white shadow-md shadow-sky-500/20 animate-pulse-glow">
                <Sparkles className="w-5 h-5 text-cyan-200" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 via-teal-400 to-cyan-300 bg-clip-text text-transparent">
                  ToothMate
                </h1>
                <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">AI Dental Coach</p>
              </div>
            </div>

            {/* Dark / Light Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className={`p-2.5 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                theme === "dark" 
                  ? "bg-slate-800 border-slate-700 text-amber-300 hover:bg-slate-700" 
                  : "bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200"
              }`}
              title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>

          {/* Global Language Switcher */}
          <div className="mb-6 px-1">
            <LanguageSelector />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-2">
            <Link to="/dashboard" className={getDesktopSidebarClass("/dashboard")}>
              <LayoutDashboard className="w-5 h-5" />
              <span>{t.dashboard}</span>
            </Link>

            <Link to="/mirror" className={getDesktopSidebarClass("/mirror")}>
              <Camera className="w-5 h-5" />
              <span>{t.smartMirror}</span>
            </Link>

            <Link to="/chatbot" className={getDesktopSidebarClass("/chatbot")}>
              <MessageSquare className="w-5 h-5" />
              <span>{t.dentalChat}</span>
            </Link>

            <Link to="/profile" className={getDesktopSidebarClass("/profile")}>
              <User className="w-5 h-5" />
              <span>{t.profile}</span>
            </Link>
          </nav>
        </div>

        {/* User Card & Logout Action */}
        <div className="space-y-3">
          <div className={`p-3.5 rounded-2xl border transition-colors ${
            theme === "dark" 
              ? "bg-slate-800/80 border-slate-700/80" 
              : "bg-gradient-to-br from-sky-50 to-teal-50/60 border-sky-100/80"
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-sky-500 text-white flex items-center justify-center font-bold text-sm shadow-sm shrink-0">
                {currentUserName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-xs font-bold truncate">{currentUserName}</p>
                <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-semibold mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{t.proPlan}</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className={`w-full py-3 px-4 min-h-[48px] rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer border ${
              theme === "dark"
                ? "bg-rose-950/40 text-rose-300 border-rose-800/50 hover:bg-rose-900/60"
                : "bg-rose-50 text-rose-600 border-rose-200/80 hover:bg-rose-100"
            }`}
          >
            <LogOut className="w-4 h-4" />
            <span>{t.signOut}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Container with Mobile Safe Padding */}
      <main className="flex-1 w-full h-full overflow-y-auto pb-20 md:pb-6 flex justify-center">
        <div className="w-full max-w-5xl px-3 sm:px-6 md:px-8 pt-3 md:pt-6 flex flex-col min-h-full">
          {children}
        </div>
      </main>

      {/* Mobile Sticky Bottom Floating Nav Bar */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 border-t min-h-[56px] h-16 flex items-center justify-around px-1 z-50 shadow-2xl backdrop-blur-xl transition-colors duration-300 ${
        theme === "dark" 
          ? "bg-slate-900/95 border-slate-800 text-slate-100" 
          : "bg-white/95 border-slate-200/80 text-slate-900"
      }`}>
        <Link to="/mirror" className={getMobileTabClass("/mirror")}>
          <Camera className="w-5 h-5 mb-0.5" />
          <span>Mirror</span>
        </Link>

        <Link to="/dashboard" className={getMobileTabClass("/dashboard")}>
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Dashboard</span>
        </Link>

        <Link to="/chatbot" className={getMobileTabClass("/chatbot")}>
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>Dr. Minty</span>
        </Link>

        <Link to="/profile" className={getMobileTabClass("/profile")}>
          <User className="w-5 h-5 mb-0.5" />
          <span>Profile</span>
        </Link>

        <button 
          onClick={toggleTheme}
          className="flex flex-col items-center justify-center min-h-[48px] flex-1 py-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 active:scale-95 transition-all"
          title="Toggle Theme"
        >
          {theme === "dark" ? <Sun className="w-5 h-5 mb-0.5 text-amber-300" /> : <Moon className="w-5 h-5 mb-0.5 text-slate-600" />}
          <span>Theme</span>
        </button>
      </nav>
    </div>
  );
}
