import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle2, ArrowRight, ShieldAlert, Sparkles, HelpCircle, Activity, Play, Pause, RotateCcw, Award } from "lucide-react";
import { useLanguage } from "./LanguageContext";
import LanguageSelector from "./LanguageSelector";

export default function PrescriptionScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  // Safely unpack database & analysis response from router state
  const { 
    technique = "Modified Bass Technique", 
    description = "The gold-standard periodontist method for deep sulcular cleaning.", 
    whatItIs = "A sulcular cleaning method that targets plaque trapped in the gingival pocket.", 
    howItWorks = "Bristles are angled at 45° into the gum line pocket to disrupt biofilm.", 
    whySuggested = "Suggested to maintain optimal oral health and clear daily plaque.", 
    precautions = [
      "Avoid pushing bristles too deeply into the sulcus with heavy force.",
      "Use soft end-rounded bristles to prevent microscopic gum tears.",
      "Maintain a true 45-degree angle rather than pressing flat."
    ], 
    steps = [
      "Angle brush bristles at 45 degrees directly toward the line where your gums meet your teeth.",
      "Gently press so bristle tips enter the top of the gum pocket without discomfort.",
      "Execute 10 short, gentle vibratory back-and-forth shakes on the spot.",
      "Roll the brush head firmly away from the gums to sweep dislodged plaque out."
    ], 
    mode = "adult" 
  } = location.state || {};

  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [isSimulating, setIsSimulating] = useState(true);

  // Auto-advance step in simulator mode
  useEffect(() => {
    if (!isSimulating || steps.length === 0) return;
    const timer = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % steps.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isSimulating, steps.length]);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-5 pb-16 font-sans text-slate-800 dark:text-slate-100">
      
      {/* Header */}
      <div className="flex items-center justify-between px-1 pt-1">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center font-bold text-xs hover:bg-slate-200 transition-all cursor-pointer"
          >
            ←
          </button>
          <h2 className="text-lg md:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t.personalizedResult || "Personalized Prescription"}
          </h2>
        </div>
        <LanguageSelector />
      </div>

      {/* Hero Banner Card */}
      <div className="bg-gradient-to-r from-sky-700 via-teal-700 to-cyan-600 text-white p-5 md:p-7 rounded-3xl relative shadow-lg overflow-hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-cyan-100 text-xs font-bold backdrop-blur-md mb-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-300" />
          <span>{mode.toUpperCase()} MODE CLINICAL DIAGNOSIS</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          {technique}
        </h1>
        <p className="text-xs text-sky-100/90 font-medium mt-1">
          ✨ Recommended by AI Clinical Engine for optimal daily oral hygiene.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-5 md:p-7 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        
        {/* Prescription Summary */}
        <div className="p-4 md:p-5 rounded-2xl bg-sky-50/70 dark:bg-slate-800/70 border border-sky-100 dark:border-slate-700 flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shrink-0 font-bold shadow-xs">
            <Sparkles className="w-5 h-5 text-cyan-200" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm mb-0.5">
              {t.prescriptionSummaryTitle || "Clinical Prescription Summary"}
            </h3>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium text-xs md:text-sm">
              {description}
            </p>
          </div>
        </div>

        {/* Why Suggested */}
        {whySuggested && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-900/50 text-teal-700 dark:text-teal-300 flex items-center justify-center font-bold text-xs">
                🎯
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t.whySuggestedTitle || "Why this technique was prescribed for your teeth"}
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-teal-50/60 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-900/60 text-slate-800 dark:text-teal-100 text-xs md:text-sm leading-relaxed font-medium">
              <span className="font-bold text-teal-900 dark:text-teal-300">{t.basedOnAnswers || "Based on your assessment:"} </span>
              {whySuggested}
            </div>
          </div>
        )}

        {/* 🎬 ANIMATED CLINICAL MOTION SIMULATOR (REPLACES YOUTUBE EMBED) */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
              Clinical Motion Simulator & Technique Guide
            </h3>
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-sky-100 dark:bg-slate-800 text-sky-700 dark:text-sky-300 text-xs font-bold hover:bg-sky-200 transition-all cursor-pointer"
            >
              {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isSimulating ? "Pause Motion" : "Play Motion"}</span>
            </button>
          </div>

          {/* SVG Motion Canvas Display Box */}
          <div className="relative w-full bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 rounded-3xl p-6 text-white overflow-hidden shadow-md border border-slate-800 flex flex-col items-center justify-center min-h-[220px]">
            {/* Background Ambient Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-10"></div>
            
            {/* Technique Badge */}
            <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-cyan-300 border border-sky-400/30 text-[10px] font-bold backdrop-blur-md">
              <Award className="w-3.5 h-3.5" />
              <span>45° Sulcular Clearance</span>
            </div>

            {/* Interactive Step Progress Dots */}
            <div className="absolute top-4 right-4 flex items-center gap-1">
              {steps.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => { setActiveStepIdx(idx); setIsSimulating(false); }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    activeStepIdx === idx ? "w-6 bg-cyan-400" : "w-2 bg-slate-700 hover:bg-slate-500"
                  }`}
                  title={`Step ${idx + 1}`}
                />
              ))}
            </div>

            {/* Animated Graphic Element */}
            <div className="my-6 relative flex flex-col items-center">
              {/* Tooth SVG Graphic */}
              <svg className="w-24 h-24 text-slate-100 drop-shadow-md" viewBox="0 0 100 100" fill="currentColor">
                <path d="M30,20 C40,10 60,10 70,20 C80,30 85,50 80,75 C75,90 65,95 55,75 C52,70 48,70 45,75 C35,95 25,90 20,75 C15,50 20,30 30,20 Z" />
              </svg>
              
              {/* Animated Toothbrush at 45 Degree Angle */}
              <div className={`absolute top-6 left-12 transition-transform duration-700 ${
                isSimulating ? "animate-bounce" : ""
              }`} style={{ transform: `rotate(${activeStepIdx === 0 ? '-45deg' : activeStepIdx === 1 ? '-30deg' : '-50deg'})` }}>
                <div className="w-16 h-4 bg-cyan-400 rounded-full border-2 border-white shadow-lg flex items-center justify-end px-1">
                  <div className="flex gap-0.5">
                    <span className="w-1 h-3 bg-white rounded-full"></span>
                    <span className="w-1 h-3 bg-white rounded-full"></span>
                    <span className="w-1 h-3 bg-white rounded-full"></span>
                    <span className="w-1 h-3 bg-white rounded-full"></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Active Step Highlight Banner */}
            <div className="w-full bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10 text-center relative z-10">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-300">
                Step {activeStepIdx + 1} of {steps.length}
              </span>
              <p className="text-xs md:text-sm font-semibold text-white mt-0.5">
                {steps[activeStepIdx] || "Follow recommended 2-minute brushing routine."}
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Guide */}
        <div className="space-y-3">
          <h3 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
            {t.stepsTitle || "Prescribed Step-by-Step Brushing Guide"}
          </h3>

          <div className="space-y-2.5">
            {steps.map((stepText: string, index: number) => (
              <div 
                key={index} 
                onClick={() => setActiveStepIdx(index)}
                className={`flex gap-3.5 items-start p-3.5 md:p-4 rounded-2xl border transition-all cursor-pointer ${
                  activeStepIdx === index
                    ? "bg-sky-50 dark:bg-slate-800 border-sky-300 dark:border-sky-500 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-900 border-slate-200/70 dark:border-slate-800 hover:border-slate-300"
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-extrabold text-xs shadow-xs ${
                  activeStepIdx === index ? "bg-sky-600 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                }`}>
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white mb-0.5">
                    Step {index + 1}
                  </h4>
                  <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {stepText}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Precautions */}
        {precautions && precautions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                {t.precautionsTitle || "Precautions & Safety Tips"}
              </h3>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 space-y-1.5">
              {precautions.map((item: string, idx: number) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold text-xs mt-0.5">•</span>
                  <p className="text-xs text-amber-950 dark:text-amber-200 font-semibold leading-relaxed">
                    {item}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 🪥 RECOMMENDED TOOTHBRUSH & TOOTHPASTE SUGGESTIONS */}
        <div className="space-y-3 pt-1">
          <h3 className="text-sm md:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
            <span>🪥</span> Prescribed Toothbrush & Toothpaste Suggestions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-[10px] font-black uppercase text-sky-600 dark:text-sky-400 tracking-wider">Toothbrush Specification</span>
              <h4 className="text-xs md:text-sm font-extrabold text-slate-900 dark:text-white">
                {technique.includes("Charters") ? "Orthodontic V-Trim / Ultra-Soft Micro-Head" : "Ultra-Soft Tapered Bristle Brush"}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-snug">
                {technique.includes("Charters")
                  ? "V-shaped bristle cut clears bracket margins without bending archwires or irritating gums."
                  : "Soft 0.01mm micro-tapered end-rounded bristles reach deep into sulcular margins safely."}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-1">
              <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">Toothpaste Formulation</span>
              <h4 className="text-xs md:text-sm font-extrabold text-slate-900 dark:text-white">
                Fluoride & Anti-Cavity Enamel Shield Paste
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-snug">
                1450 ppm Stannous/Sodium Fluoride formula strengthens enamel surface and neutralizes plaque acid.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={() => navigate("/mirror", { state: { mode, technique } })}
            className="flex-1 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs md:text-sm transition-all shadow-md shadow-sky-600/20 cursor-pointer text-center active:scale-95"
          >
            {t.startMirrorBtn || "Start Guided Smart Mirror Session"}
          </button>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs md:text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>{t.returnDashboardBtn || "Dashboard"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}