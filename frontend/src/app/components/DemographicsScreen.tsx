import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { ChevronRight, Sparkles, Smile, UserCheck, Shield } from "lucide-react";
import { API_BASE_URL, fetchApiResilient } from "./apiService";
import { useLanguage } from "./LanguageContext";
import LanguageSelector from "./LanguageSelector";

export default function DemographicsScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [name, setName] = useState(() => localStorage.getItem("userName") || "");
  const [mode, setMode] = useState<"child" | "adult">(() => {
    const existing = localStorage.getItem("userAgeGroup") || localStorage.getItem("userMode") || "";
    return existing.toLowerCase().includes("child") || existing.toLowerCase().includes("kid") ? "child" : "adult";
  });
  const [gender, setGender] = useState(() => localStorage.getItem("userGender") || "male");
  const [age, setAge] = useState<number>(() => {
    const saved = localStorage.getItem("userAge");
    return saved ? parseInt(saved, 10) : 6;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContinue = async () => {
    if (!name.trim()) return;
    setIsSubmitting(true);

    // Save mode, name, gender, age in localStorage
    const cleanMode = mode === "child" ? "child" : "adult";
    localStorage.setItem("userName", name.trim());
    localStorage.setItem("userMode", cleanMode);
    localStorage.setItem("userAgeGroup", cleanMode === "child" ? "Child Mode" : "Adult Mode");
    localStorage.setItem("userGender", gender);
    localStorage.setItem("userAge", String(age));

    const activeSessionStr = localStorage.getItem("user_session");
    const activeSession = activeSessionStr ? JSON.parse(activeSessionStr) : null;
    const currentUserId = activeSession?.id || localStorage.getItem("userId") || "1";
    localStorage.setItem("userId", currentUserId.toString());

    try {
      await fetchApiResilient(`/auth/demographics`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: parseInt(currentUserId, 10),
          name: name.trim(),
          ageGroup: cleanMode,
          gender: gender
        }),
      });
    } catch (error) {
      console.warn("Backend demographics update failed, saving locally:", error);
    } finally {
      setIsSubmitting(false);
      const isEditing = window.location.search.includes("edit=true");
      if (isEditing) {
        navigate("/profile");
      } else {
        navigate("/assessment", { state: { mode: cleanMode } });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col p-4 md:p-8 font-sans antialiased text-slate-800 justify-center items-center">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-200/90 p-6 md:p-10 space-y-6">
        
        {/* Header Progress Bar - Flat, Professional Header without harsh blue shadow */}
        <div className="flex items-center justify-between border-b pb-4 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-700 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-teal-200" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Profile Onboarding</h2>
              <p className="text-xs text-slate-500 font-semibold">Step 1 of 3 • Personalization Setup</p>
            </div>
          </div>
          <LanguageSelector />
        </div>

        <div className="space-y-6">
          {/* 1. Name Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              1. Full Name
            </label>
            <input
              type="text"
              disabled={isSubmitting}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-600 disabled:opacity-60 text-sm font-semibold"
            />
          </div>

          {/* 2. Select Mode (Pediatric vs Clinical Standard) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              2. Experience Mode
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                onClick={() => setMode("child")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  mode === "child"
                    ? "border-teal-600 bg-teal-50/70 shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Smile className="w-6 h-6 text-teal-700" />
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    mode === "child" ? "bg-teal-700 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    Pediatric
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Child Mode</h4>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                  Simplified interactive assessment with pediatric dental guidance.
                </p>
              </div>

              <div
                onClick={() => setMode("adult")}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  mode === "adult"
                    ? "border-teal-600 bg-teal-50/70 shadow-sm"
                    : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <Shield className="w-6 h-6 text-teal-700" />
                  <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                    mode === "adult" ? "bg-teal-700 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    Clinical
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-slate-900">Adult Mode</h4>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-snug">
                  Comprehensive 10-question risk assessment & tailored oral care strategy.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Gender - Single line clean grid box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              3. Gender
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setGender("male")}
                className={`py-3.5 px-3 rounded-2xl font-bold text-xs whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center transition-all cursor-pointer ${
                  gender === "male"
                    ? "bg-teal-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                }`}
              >
                Male
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setGender("female")}
                className={`py-3.5 px-3 rounded-2xl font-bold text-xs whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center transition-all cursor-pointer ${
                  gender === "female"
                    ? "bg-teal-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                }`}
              >
                Female
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => setGender("other")}
                className={`py-3.5 px-3 rounded-2xl font-bold text-xs whitespace-nowrap overflow-hidden text-ellipsis flex items-center justify-center transition-all cursor-pointer ${
                  gender === "other"
                    ? "bg-teal-700 text-white shadow-sm"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/60"
                }`}
              >
                Other
              </button>
            </div>
          </div>

          {/* 4. Age */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                4. Age ({age} Years)
              </label>
            </div>
            <input
              type="range"
              min="1"
              max="80"
              value={age}
              onChange={(e) => setAge(parseInt(e.target.value, 10))}
              className="w-full accent-teal-700 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        <button
          onClick={handleContinue}
          disabled={!name.trim() || isSubmitting}
          className="w-full py-4 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white font-extrabold shadow-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer text-sm"
        >
          <span>{isSubmitting ? "Saving Profile..." : "Proceed to Assessment"}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
