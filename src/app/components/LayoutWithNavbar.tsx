import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Camera, MessageSquare, User } from "lucide-react";

export default function LayoutWithNavbar({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const activePath = location.pathname;

  const getTabClass = (path: string) => {
    const baseClass = "flex flex-col items-center justify-center flex-1 py-2 text-[11px] font-black transition-colors cursor-pointer ";
    return activePath === path 
      ? baseClass + "text-[#2D9CDB]" 
      : baseClass + "text-[#64748B] hover:text-[#1E293B]";
  };

  return (
    <div className="min-h-screen w-full bg-[#F2F9FF] flex justify-center">
      {/* Mobile Shell: height managed by screen viewport */}
      <div className="w-full max-w-md bg-white shadow-2xl relative flex flex-col min-h-screen">
        
        {/* Content Area: Native scroll physics enabled */}
        {/* 'touch-auto' and 'overflow-y-auto' allow the laptop trackpad/mouse wheel to function */}
        <div 
          className="flex-1 w-full overflow-y-auto pb-24 touch-auto" 
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {children}
        </div>

        {/* Global Fixed Navbar */}
        <nav className="fixed bottom-0 w-full max-w-md bg-white/95 backdrop-blur-md border-t border-slate-100 h-20 flex items-center justify-between px-4 z-50">
          <Link to="/mirror" className={getTabClass("/mirror")}>
            <Camera className="w-5 h-5 mb-1" />
            <span>Mirror</span>
          </Link>
          
          <Link to="/dashboard" className={getTabClass("/dashboard")}>
            <LayoutDashboard className="w-5 h-5 mb-1" />
            <span>Dashboard</span>
          </Link>
          
          <Link to="/chatbot" className={getTabClass("/chatbot")}>
            <MessageSquare className="w-5 h-5 mb-1" />
            <span>Chatbot</span>
          </Link>
          
          <Link to="/profile" className={getTabClass("/profile")}>
            <User className="w-5 h-5 mb-1" />
            <span>Profile</span>
          </Link>
        </nav>
      </div>
    </div>
  );
}