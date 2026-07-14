import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // ✅ FIXED IMPORT: Changed from "react-router" to "react-router-dom"
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function PrescriptionScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Safely unpack the real database rows from the React Router state bundle
  const { technique, description, steps, videoUrl, mode = "adult" } = location.state || {};

  const [isPlaying, setIsPlaying] = useState(false);

  // Structural defensive block if page routing boundary is blank
  if (!technique) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center p-6 bg-white text-center">
        <p className="text-red-500 font-bold mb-4">No localized dental analysis profiles detected.</p>
        <button onClick={() => navigate("/dashboard")} className="p-4 bg-[#0F4C81] text-white rounded-2xl cursor-pointer">
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 pb-24">
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white mb-4">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium">Your Personalized Medical Result</span>
        </div>
        <h1 className="text-3xl font-bold text-[#1E293B] mb-2">
          {technique || "Custom Brushing Plan"}
        </h1>
        <p className="text-[#64748B] font-medium uppercase tracking-wider text-xs text-[#2D9CDB]">
          ✨ Tailored Professional {mode} Plan
        </p>
      </div>

      <div className="bg-gradient-to-br from-[#F2F9FF] to-white p-6 rounded-3xl border border-gray-200 mb-6">
        <p className="text-[#1E293B] leading-relaxed font-medium">
          {description || "Loading your custom brushing instructions..."}
        </p>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-bold text-[#1E293B] mb-4 flex items-center gap-2">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
          Watch Video Tutorial Guide
        </h2>

        {/* Professional HTML5 Video system loading your local paths */}
        <div className="relative bg-black rounded-3xl overflow-hidden shadow-lg aspect-video">
          {videoUrl ? (
            <video
              src={videoUrl}
              controls
              className="w-full h-full object-cover"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              poster="https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=600&q=80"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-400 text-sm">
              No Video Tutorial Available For This Technique
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-between px-2">
          <p className="text-sm text-[#64748B] font-semibold">
            {isPlaying ? "▶ Media Channel Active" : "⏸ Video Content Paused"}
          </p>
          <p className="text-xs text-[#64748B]">Tap player controls to navigate</p>
        </div>
      </div>

      <h2 className="text-lg font-bold text-[#1E293B] mb-4">
        Simple Steps to Follow
      </h2>

      {/* Steps Parser Loop maps string arrays directly from pgAdmin data types */}
      <div className="space-y-4 mb-6">
        {steps && steps.length > 0 ? (
          steps.map((stepText, index) => (
            <div key={index} className="flex gap-4 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="w-10 h-10 rounded-full bg-[#2D9CDB] flex items-center justify-center flex-shrink-0 shadow-xs">
                <span className="text-white font-black text-md">{index + 1}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1E293B] mb-0.5">Instruction Set {index + 1}</h3>
                <p className="text-sm text-[#64748B] leading-relaxed font-medium">
                  {stepText}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-slate-400 text-sm font-medium">
            No specific instruction sets generated for this technique yet. Follow standard 2-minute guidelines.
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-3xl border border-green-200 mb-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 text-white font-bold">
            ✓
          </div>
          <div>
            <h3 className="font-bold text-[#1E293B] mb-1">Pro Clinical Tip</h3>
            <p className="text-sm text-[#64748B] font-medium leading-relaxed">
              Brush for 2 minutes twice a day (morning and night) for the best
              results. Use a timer or play a 2-minute song within your dashboard module tracking suite!
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => navigate("/success", { state: { mode, technique: technique || "Standard Routine" } })}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white font-bold hover:opacity-90 transition-opacity shadow-md cursor-pointer"
        >
          Start Brushing Now
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="w-full py-4 rounded-2xl border-2 border-[#0F4C81] text-[#0F4C81] font-bold hover:bg-[#F2F9FF] transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          Go to Dashboard
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}