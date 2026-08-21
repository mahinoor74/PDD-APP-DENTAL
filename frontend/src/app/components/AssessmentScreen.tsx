import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, Sparkles, Star, Trophy } from "lucide-react";
import { API_BASE_URL, fetchApiResilient } from "./apiService";
import { useLanguage } from "./LanguageContext";
import LanguageSelector from "./LanguageSelector";
import { getQuestions } from "./questionTranslations";

const KID_ENCOURAGEMENTS = [
  "🌟 Wow, great answer!",
  "🎉 You're doing amazing!",
  "💪 Super! Keep going!",
  "🦷 Awesome! Dr. Minty is proud!",
  "✨ Brilliant! You're a star!",
];

export default function AssessmentScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, language } = useLanguage();

  const [mode, setMode] = useState<"child" | "adult" | "senior">(() => {
    const incomingMode = location.state?.mode;
    if (incomingMode) {
      localStorage.setItem("selected_app_mode", incomingMode);
      return incomingMode;
    }
    return (localStorage.getItem("selected_app_mode") as "child" | "adult" | "senior") || "adult";
  });

  // Get translated questions based on mode and current language
  const questions = getQuestions(mode, language);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { text: string; conditionKey: string; value: boolean }>>({});
  const [showEncouragement, setShowEncouragement] = useState(false);
  const [encouragementText, setEncouragementText] = useState("");
  const [kidComplete, setKidComplete] = useState(false);

  const isKidMode = mode === "child";

  const handleAnswer = (optionObj: { text: string; conditionKey: string; value: boolean }) => {
    setAnswers({ ...answers, [currentQuestion]: optionObj });

    // Kid mode: show encouragement animation
    if (isKidMode) {
      const msg = KID_ENCOURAGEMENTS[currentQuestion % KID_ENCOURAGEMENTS.length];
      setEncouragementText(msg);
      setShowEncouragement(true);
      setTimeout(() => setShowEncouragement(false), 1200);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Last question — show kid completion screen briefly then submit
      if (isKidMode) {
        setKidComplete(true);
        setTimeout(() => submitAnswers(), 2000);
      } else {
        await submitAnswers();
      }
    }
  };

  const submitAnswers = async () => {
    const activeUserId = localStorage.getItem("userId") || "1";
    const clinicalResponses: Record<string, boolean> = {
      hasBraces: false, bleedingGums: false, recededGums: false,
      hasImplants: false, heavySmoker: false, aggressiveBrusher: false,
      sensitivity: false, manualDexterity: false, preventative: false,
    };
    Object.values(answers).forEach((ansObj) => {
      if (ansObj.value === true) clinicalResponses[ansObj.conditionKey] = true;
    });

    try {
      const response = await fetchApiResilient(`/assessment/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: parseInt(activeUserId, 10), responses: clinicalResponses }),
      });
      const result = await response.json();

      if (response.ok && result.success) {
        navigate("/prescription", {
          state: {
            technique: result.technique, description: result.description,
            whatItIs: result.whatItIs, howItWorks: result.howItWorks,
            whySuggested: result.whySuggested, precautions: result.precautions,
            steps: result.steps, videoUrl: result.videoUrl, mode,
          },
        });
        return;
      }
    } catch (error) {
      console.warn("Backend assessment submit error, using local clinical fallback:", error);
    }

    // Graceful Fallback if backend is offline/unreachable
    const isBraces = clinicalResponses.hasBraces;
    navigate("/prescription", {
      state: {
        technique: isBraces ? "Orthodontic Charters Technique" : "Modified Bass Technique",
        description: isBraces
          ? "Designed explicitly for patients with fixed braces or brackets to clean under bracket wings and archwires safely."
          : "The gold-standard periodontist method for deep sulcular cleaning.",
        whatItIs: "A sulcular cleaning method targeting plaque in the gingival pocket.",
        howItWorks: "Bristles are angled at 45° into the gum line pocket to disrupt biofilm.",
        whySuggested: "Suggested based on your assessment answers to maintain optimal oral hygiene.",
        precautions: [
          "Avoid pushing bristles too deeply into the sulcus with heavy force.",
          "Use soft end-rounded bristles to prevent microscopic gum tears.",
          "Maintain a true 45-degree angle rather than pressing flat."
        ],
        steps: [
          "Angle brush bristles at 45 degrees directly toward the line where your gums meet your teeth.",
          "Gently press so bristle tips enter the top of the gum pocket without discomfort.",
          "Execute 10 short, gentle vibratory back-and-forth shakes on the spot.",
          "Roll the brush head firmly away from the gums to sweep dislodged plaque out."
        ],
        mode,
      },
    });
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion(currentQuestion - 1);
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // ─── KID COMPLETION SCREEN ───────────────────────────────────────────────
  if (kidComplete) {
    return (
      <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 p-8">
        <div className="text-7xl animate-bounce">🏆</div>
        <h1 className="text-3xl font-black text-sky-700 leading-tight">
          {t.kidDone || "WOW! You're a Dental Superstar! 🎉"}
        </h1>
        <p className="text-lg text-slate-600 font-semibold">
          Dr. Minty is preparing your special brushing plan...
        </p>
        <div className="flex gap-2 text-4xl animate-pulse">
          <span>🦷</span><span>✨</span><span>🪥</span><span>✨</span><span>🦷</span>
        </div>
        <div className="w-16 h-16 rounded-full border-4 border-sky-200 border-t-sky-600 animate-spin" />
      </div>
    );
  }

  // ─── KID MODE LAYOUT ─────────────────────────────────────────────────────
  if (isKidMode) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-4 pb-12 font-sans">

        {/* Kid Header */}
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-xl font-black text-sky-700 flex items-center gap-2">
              <span className="text-2xl">🦷</span>
              {t.kidModeTitle || "Dental Quest"}
            </h2>
            <p className="text-xs text-slate-500 font-medium">{t.kidModeSubtitle || "Dr. Minty wants to know about your teeth!"}</p>
          </div>
          <LanguageSelector />
        </div>

        {/* Fun toothbrush progress bar */}
        <div className="relative w-full h-10 bg-sky-50 rounded-3xl border-2 border-sky-200 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-sky-500 rounded-3xl transition-all duration-700 ease-out flex items-center justify-end pr-2"
            style={{ width: `${progress}%` }}
          >
            <span className="text-xl">🪥</span>
          </div>
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-sky-600">
            {currentQuestion + 1}/{questions.length}
          </span>
        </div>

        {/* Encouragement Toast */}
        {showEncouragement && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 bg-sky-500 text-white font-black text-lg rounded-2xl shadow-2xl shadow-sky-400/40 animate-bounce">
            {encouragementText}
          </div>
        )}

        {/* Question Card */}
        <div className="bg-gradient-to-br from-sky-50 to-cyan-50 border-2 border-sky-200 rounded-3xl p-6 shadow-lg space-y-5">
          {/* Dr. Minty label */}
          <div className="flex items-center gap-2 mb-1">
            <div className="w-10 h-10 bg-sky-500 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-md">
              🦷
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-sky-600">
                {t.assessmentDrMinty || "Dr. Minty asks:"}
              </p>
              {question?.funLabel && (
                <span className="text-xs font-bold text-sky-400">{question.funLabel}</span>
              )}
            </div>
          </div>

          {/* Emoji for the question */}
          {question?.emoji && (
            <div className="text-5xl text-center py-2">{question.emoji}</div>
          )}

          {/* Question text */}
          <h2 className="text-xl font-black text-slate-800 leading-snug text-center">
            {question?.question}
          </h2>

          {/* Fun option buttons */}
          <div className="space-y-3 pt-2">
            {question?.options.map((option, index) => {
              const isSelected = answers[currentQuestion]?.text === option.text;
              const colors = [
                "from-sky-100 to-cyan-100 border-sky-300 hover:border-sky-500",
                "from-emerald-50 to-teal-50 border-emerald-300 hover:border-emerald-500",
                "from-amber-50 to-orange-50 border-amber-300 hover:border-amber-400",
              ];
              const selectedColors = [
                "from-sky-200 to-cyan-200 border-sky-600 shadow-sky-300/40",
                "from-emerald-100 to-teal-100 border-emerald-600 shadow-emerald-200/40",
                "from-amber-100 to-orange-100 border-amber-500 shadow-amber-200/40",
              ];
              return (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className={`w-full p-4 min-h-[56px] rounded-2xl border-2 transition-all text-center cursor-pointer font-black text-sm leading-snug shadow-md active:scale-95
                    bg-gradient-to-r ${isSelected ? selectedColors[index % 3] + " shadow-lg scale-[1.02]" : colors[index % 3]}`}
                >
                  {option.text}
                  {isSelected && <span className="ml-2">✅</span>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 pt-1">
          {currentQuestion > 0 && (
            <button
              onClick={handlePrevious}
              className="px-5 py-4 min-h-[52px] rounded-2xl border-2 border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-all flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              <ChevronLeft className="w-5 h-5" /> Back
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion]}
            className="flex-1 py-4 min-h-[52px] rounded-2xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-white font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-sky-400/30 active:scale-95 cursor-pointer"
          >
            {currentQuestion < questions.length - 1 ? (
              <><span>Next! 🚀</span><ChevronRight className="w-5 h-5" /></>
            ) : (
              <><Star className="w-5 h-5" /><span>See My Results! 🎉</span></>
            )}
          </button>
        </div>

        {/* Fun stars row */}
        <div className="flex justify-center gap-1 pt-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i < currentQuestion + 1 ? "bg-sky-500 scale-125" : "bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>
    );
  }

  // ─── ADULT / SENIOR MODE (unchanged but fully translated) ────────────────
  return (
    <div className="w-full max-w-4xl mx-auto space-y-4 sm:space-y-6 pb-12 font-sans text-slate-800">
      <div className="flex items-center justify-between px-1 sm:px-2">
        <h2 className="text-lg sm:text-xl font-extrabold text-slate-900">{t.assessmentTitle || "Oral Health Assessment"}</h2>
        <LanguageSelector />
      </div>

      <div className="gradient-dental text-white p-5 sm:p-8 rounded-3xl relative shadow-xl overflow-hidden mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-cyan-200">
            {t.question || "Question"} {currentQuestion + 1} {t.of || "of"} {questions.length}
          </p>
          <p className="text-xs font-extrabold text-cyan-300">{Math.round(progress)}% {t.completed || "Completed"}</p>
        </div>
        <div className="w-full h-2.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-md">
          <div
            className="h-full bg-cyan-400 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-4 sm:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-4 sm:space-y-6">
        <div className="p-4 sm:p-6 rounded-2xl bg-sky-50/60 border border-sky-100">
          <h2 className="text-base sm:text-xl font-bold text-slate-900 leading-snug sm:leading-relaxed">
            {question?.question}
          </h2>
        </div>

        <div className="space-y-3">
          {question?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 sm:p-5 min-h-[48px] rounded-2xl border-2 transition-all text-left outline-none cursor-pointer flex items-center justify-between gap-3 active:scale-[0.98] ${
                answers[currentQuestion]?.text === option.text
                  ? "bg-sky-50 border-sky-500 text-sky-900 shadow-sm"
                  : "bg-white border-slate-200/80 text-slate-800 hover:border-sky-300 hover:bg-slate-50"
              }`}
            >
              <span className="font-bold text-xs sm:text-sm leading-snug flex-1">{option.text}</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                answers[currentQuestion]?.text === option.text
                  ? "border-sky-600 bg-sky-600 text-white"
                  : "border-slate-300"
              }`}>
                {answers[currentQuestion]?.text === option.text && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
            </button>
          ))}
        </div>

        <div className="pt-2 sm:pt-4 flex gap-3">
          {currentQuestion > 0 && (
            <button
              onClick={handlePrevious}
              className="px-5 sm:px-6 py-3.5 sm:py-4 min-h-[48px] rounded-2xl border-2 border-slate-200 text-slate-700 font-extrabold text-xs sm:text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer active:scale-95 shrink-0"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
              {t.prevQuestion || "Previous"}
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion]}
            className="flex-1 py-3.5 sm:py-4 min-h-[48px] rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-600/20 active:scale-95"
          >
            <span>
              {currentQuestion < questions.length - 1
                ? (t.nextQuestion || "Next Question")
                : (t.viewResults || "View Clinical Results")}
            </span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
