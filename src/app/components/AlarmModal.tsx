import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";

export interface AlarmDetail {
  title: string;
  body?: string;
  message?: string;
  type?: string;
  time?: string;
  badge?: string;
}

export default function AlarmModal() {
  const [activeAlarm, setActiveAlarm] = useState<AlarmDetail | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleAlarmEvent = (e: Event) => {
      const customEvent = e as CustomEvent<AlarmDetail>;
      if (customEvent.detail) {
        setActiveAlarm(customEvent.detail);
      }
    };

    window.addEventListener("toothmate-alarm-triggered", handleAlarmEvent);
    return () => window.removeEventListener("toothmate-alarm-triggered", handleAlarmEvent);
  }, []);

  if (!activeAlarm) return null;

  const title = activeAlarm.title || "Scheduled Hygiene Reminder";
  const bodyText =
    activeAlarm.body ||
    activeAlarm.message ||
    "It's time for your scheduled brushing routine! Keep your teeth clean and your streak alive.";
  const alarmTime = activeAlarm.time || "";

  const handleDismiss = () => {
    setActiveAlarm(null);
  };

  const handleStartMirror = () => {
    setActiveAlarm(null);
    navigate("/mirror");
  };

  return (
    <div className="fixed inset-0 z-[99999] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border-2 border-cyan-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4 text-white relative overflow-hidden">
        {/* Glow backdrop effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-cyan-500/30 animate-bounce">
              🔔
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border text-cyan-300 bg-cyan-500/20 border-cyan-400/30">
                SCHEDULED HYGIENE ALARM{alarmTime ? ` • ${alarmTime}` : ""}
              </span>
              <h3 className="font-extrabold text-base text-white mt-0.5">{title}</h3>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
            aria-label="Dismiss alarm modal"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-slate-300 font-medium leading-relaxed bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
          {bodyText}
        </p>

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Dismiss
          </button>
          <button
            onClick={handleStartMirror}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-400 hover:to-teal-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
          >
            <Camera className="w-4 h-4" />
            <span>Start Mirror</span>
          </button>
        </div>
      </div>
    </div>
  );
}
