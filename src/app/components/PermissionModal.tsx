import React from "react";
import { BellRing, ShieldCheck, X } from "lucide-react";

interface PermissionModalProps {
  isOpen: boolean;
  onAllow: () => void;
  onDismiss: () => void;
  isDark?: boolean;
}

export default function PermissionModal({
  isOpen,
  onAllow,
  onDismiss,
  isDark = true,
}: PermissionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div
        className={`max-w-md w-full rounded-3xl p-6 shadow-2xl border relative overflow-hidden flex flex-col gap-5 ${
          isDark
            ? "bg-slate-900 border-sky-500/30 text-white"
            : "bg-white border-slate-200 text-slate-800"
        }`}
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onDismiss}
          className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all cursor-pointer ${
            isDark
              ? "bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
              : "bg-slate-100 text-slate-500 hover:text-slate-900 hover:bg-slate-200"
          }`}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Icon & Title */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-lg shadow-sky-500/30 shrink-0 animate-bounce">
            <BellRing className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-sky-500 bg-sky-500/10 px-2.5 py-0.5 rounded-full border border-sky-500/20">
              Notification Permission
            </span>
            <h3 className="text-lg font-black mt-1">
              Enable Daily Brushing Alarms
            </h3>
          </div>
        </div>

        {/* Body Description */}
        <div
          className={`p-4 rounded-2xl border text-xs font-medium leading-relaxed ${
            isDark
              ? "bg-slate-950/60 border-slate-800 text-slate-300"
              : "bg-slate-50 border-slate-200 text-slate-600"
          }`}
        >
          <p className="font-semibold text-sky-400 dark:text-sky-300 mb-1 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>ToothMate needs permission to send you brushing reminders.</span>
          </p>
          <p className="text-[11px] opacity-90">
            Never miss your morning or night brushing routine! We will send a polite pop-up notification at your chosen alarm time directly on your device lock screen.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-1">
          <button
            onClick={onDismiss}
            className={`flex-1 py-3.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            Not Now
          </button>
          <button
            onClick={onAllow}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white text-xs font-black transition-all cursor-pointer shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
          >
            <BellRing className="w-4 h-4" />
            <span>Allow Notifications</span>
          </button>
        </div>
      </div>
    </div>
  );
}
