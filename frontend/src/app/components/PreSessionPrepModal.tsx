import React, { useEffect } from "react";
import { Sparkles, CheckCircle2, Volume2, Play, ShieldAlert, Droplets, Smile } from "lucide-react";
import { BrushingTechnique } from "../../data/brushingTechniques";
import { speechCoach } from "../../utils/speechCoach";

interface PreSessionPrepModalProps {
  technique: BrushingTechnique;
  onStartBrushing: () => void;
  onClose: () => void;
}

export default function PreSessionPrepModal({
  technique,
  onStartBrushing,
  onClose,
}: PreSessionPrepModalProps) {
  useEffect(() => {
    speechCoach.speak(technique.prepScript);
    return () => {
      speechCoach.stop();
    };
  }, [technique]);

  const handleReplayPrepScript = () => {
    speechCoach.speak(technique.prepScript);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 md:p-8 shadow-2xl space-y-6 text-slate-100 overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-500" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-2xl shadow-inner">
              {technique.icon}
            </div>
            <div>
              <span className="text-xs font-black uppercase text-cyan-400 tracking-wider">
                Pre-Session Preparation
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-white">
                {technique.name}
              </h2>
            </div>
          </div>
          <button
            onClick={handleReplayPrepScript}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 transition-all flex items-center gap-1.5 text-xs font-bold border border-slate-700 cursor-pointer"
            title="Listen to prep instruction"
          >
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Listen</span>
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950/90 border border-cyan-500/30 text-slate-200 text-sm leading-relaxed relative flex items-start gap-3 shadow-inner">
          <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-slate-200">{technique.prepScript}</p>
            <p className="mt-2 text-xs text-cyan-300/80 font-semibold">
              🎯 Recommended Brush Angle: {technique.angleDegrees}°
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <Droplets className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">1. Wet Bristles</h4>
              <p className="text-[11px] text-slate-400">Rinse brush head under warm tap water</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">2. Pea-Sized Paste</h4>
              <p className="text-[11px] text-slate-400">Apply recommended paste amount</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <Smile className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">3. Pencil Grip</h4>
              <p className="text-[11px] text-slate-400">Hold lightly with fingers, avoid clenching fist</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
            <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-slate-200">4. Posture Check</h4>
              <p className="text-[11px] text-slate-400">Stand straight, face mirror at eye-level</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-all cursor-pointer border border-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              speechCoach.stop();
              onStartBrushing();
            }}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm transition-all shadow-lg hover:shadow-cyan-500/25 flex items-center gap-2 cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Start Brushing Session</span>
          </button>
        </div>
      </div>
    </div>
  );
}
