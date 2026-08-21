import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { API_BASE_URL, fetchApiResilient } from "./apiService";
import { useLanguage } from "./LanguageContext";
import LanguageSelector from "./LanguageSelector";

// 🧒 Simple, easy-to-understand questions for Kids
const childQuestions = [
  { 
    id: 1, 
    question: "Do you have shiny metal braces or wires on your teeth to make them straight?", 
    options: [
      { text: "Yes, I have braces or wires", conditionKey: "hasBraces", value: true },
      { text: "No, I do not have them", conditionKey: "hasBraces", value: false }
    ] 
  },
  { 
    id: 2, 
    question: "Do your gums ever turn bright red, swollen, or hurt when you use your toothbrush?", 
    options: [
      { text: "Yes, they hurt or look red", conditionKey: "bleedingGums", value: true },
      { text: "No, they feel good", conditionKey: "bleedingGums", value: false }
    ] 
  },
  { 
    id: 3, 
    question: "Do you ever see pink or red on your toothbrush or in the sink after brushing?", 
    options: [
      { text: "Yes, pretty often", conditionKey: "bleedingGums", value: true },
      { text: "Sometimes", conditionKey: "bleedingGums", value: true },
      { text: "Never", conditionKey: "bleedingGums", value: false }
    ] 
  },
  { 
    id: 4, 
    question: "Is it hard for you to clear out trapped food from around your teeth or brackets?", 
    options: [
      { text: "Yes, it's difficult", conditionKey: "hasBraces", value: true },
      { text: "No, it's easy", conditionKey: "hasBraces", value: false }
    ] 
  },
  { 
    id: 5, 
    question: "How do your teeth feel right now when you rub your tongue against them?", 
    options: [
      { text: "Fuzzy or dirty", conditionKey: "preventative", value: true },
      { text: "Clean and smooth", conditionKey: "preventative", value: false }
    ] 
  },
  { 
    id: 6, 
    question: "Do you brush your teeth quickly for less than two minutes?", 
    options: [
      { text: "Yes, I brush fast", conditionKey: "preventative", value: true },
      { text: "No, I take my time", conditionKey: "preventative", value: false }
    ] 
  },
  { 
    id: 7, 
    question: "Do you scrub back and forth really hard like scrubbing a dirty floor?", 
    options: [
      { text: "Yes, always", conditionKey: "preventative", value: true },
      { text: "No, I am gentle", conditionKey: "preventative", value: false }
    ] 
  },
  { 
    id: 8, 
    question: "Do you eat a lot of sweet candies, chocolates, or drink sugary juices?", 
    options: [
      { text: "Every single day", conditionKey: "preventative", value: true },
      { text: "Sometimes", conditionKey: "preventative", value: false }
    ] 
  },
  { 
    id: 9, 
    question: "Do you usually forget to brush your teeth before going to sleep?", 
    options: [
      { text: "Yes, most nights", conditionKey: "preventative", value: true },
      { text: "No, I never forget", conditionKey: "preventative", value: false }
    ] 
  },
  { 
    id: 10, 
    question: "Does an adult help you brush your teeth to get them clean?", 
    options: [
      { text: "No, I do it all alone", conditionKey: "preventative", value: true },
      { text: "Yes, they help me", conditionKey: "preventative", value: false }
    ] 
  }
];

// 🧑 Standard clinical questions for Adults
const adultQuestions = [
  { 
    id: 1, 
    question: "Are you currently wearing fixed orthodontic brackets, wires, or clear aligners?", 
    options: [
      { text: "Yes, I have fixed metal/ceramic braces", conditionKey: "hasBraces", value: true },
      { text: "Yes, I use clear aligners", conditionKey: "hasBraces", value: true },
      { text: "No, but I have a permanent retainer wire", conditionKey: "hasBraces", value: true },
      { text: "No orthodontic hardware at all", conditionKey: "hasBraces", value: false }
    ] 
  },
  { 
    id: 2, 
    question: "Do your gums bleed during standard brushing or flossing routines?", 
    options: [
      { text: "Yes, frequently", conditionKey: "bleedingGums", value: true },
      { text: "Sometimes", conditionKey: "bleedingGums", value: true },
      { text: "Rarely or Never", conditionKey: "bleedingGums", value: false }
    ] 
  },
  { 
    id: 3, 
    question: "Have you noticed your gums shifting or shrinking back, exposing more of the tooth surface?", 
    options: [
      { text: "Yes, severe recession", conditionKey: "recededGums", value: true },
      { text: "A little bit", conditionKey: "recededGums", value: true },
      { text: "No, my gumline looks stable", conditionKey: "recededGums", value: false }
    ] 
  },
  { 
    id: 4, 
    question: "Do you have active dental implants, fixed structural bridges, or dental crowns?", 
    options: [
      { text: "Yes, I have implants", conditionKey: "hasImplants", value: true },
      { text: "Yes, dental bridges or partials", conditionKey: "hasImplants", value: true },
      { text: "I have single crowns or fillings", conditionKey: "hasImplants", value: false },
      { text: "None of the above", conditionKey: "hasImplants", value: false }
    ] 
  },
  { 
    id: 5, 
    question: "Are your gum tissues frequently swollen, tender, painful, or deep red in color?", 
    options: [
      { text: "Yes, they feel inflamed", conditionKey: "bleedingGums", value: true },
      { text: "Occasionally", conditionKey: "bleedingGums", value: true },
      { text: "No, they look healthy", conditionKey: "bleedingGums", value: false }
    ] 
  },
  { 
    id: 6, 
    question: "Do you experience sharp sensitivity or pain when drinking hot or cold fluids?", 
    options: [
      { text: "Yes, highly sensitive", conditionKey: "recededGums", value: true },
      { text: "Mild discomfort", conditionKey: "recededGums", value: true },
      { text: "No sensitivity at all", conditionKey: "recededGums", value: false }
    ] 
  },
  { 
    id: 7, 
    question: "Do you find food particles consistently wedging around your dental appliances or braces?", 
    options: [
      { text: "Yes, all the time", conditionKey: "hasBraces", value: true },
      { text: "Sometimes", conditionKey: "hasBraces", value: true },
      { text: "No, clearing debris is easy", conditionKey: "hasBraces", value: false }
    ] 
  },
  { 
    id: 8, 
    question: "Is it difficult for you to safely reach and clean the margins beneath your dental crowns or bridges?", 
    options: [
      { text: "Yes, access is restricted", conditionKey: "hasImplants", value: true },
      { text: "No problem to clean", conditionKey: "hasImplants", value: false }
    ] 
  },
  { 
    id: 9, 
    question: "Do you use a medium or hard bristle toothbrush head for daily routine hygiene?", 
    options: [
      { text: "Yes, medium or hard bristles", conditionKey: "recededGums", value: true },
      { text: "No, I use soft/ultra-soft ones", conditionKey: "recededGums", value: false }
    ] 
  },
  { 
    id: 10, 
    question: "How many times do you brush your teeth daily?", 
    options: [
      { text: "Twice or more daily", conditionKey: "preventative", value: false },
      { text: "Once or less", conditionKey: "preventative", value: true }
    ] 
  }
];

// 👵 Clear, large-print style question prompts for Seniors
const seniorQuestions = [
  { 
    id: 1, 
    question: "Are your gum tissues tender, raw, sore, or uncomfortable during daily activities?", 
    options: [
      { text: "Yes, very uncomfortable", conditionKey: "bleedingGums", value: true },
      { text: "Sometimes", conditionKey: "bleedingGums", value: true },
      { text: "No, they feel comfortable", conditionKey: "bleedingGums", value: false }
    ] 
  },
  { 
    id: 2, 
    question: "Do you have full dentures, partial plates, or active dental implants installed?", 
    options: [
      { text: "I have fixed dental implants", conditionKey: "hasImplants", value: true },
      { text: "Partial plates or bridges", conditionKey: "hasImplants", value: true },
      { text: "Full removable dentures", conditionKey: "hasImplants", value: true },
      { text: "No dental work / natural teeth", conditionKey: "hasImplants", value: false }
    ] 
  },
  { 
    id: 3, 
    question: "Have you noticed your gums shrinking back, making roots visible or teeth look longer?", 
    options: [
      { text: "Yes, noticeable recession", conditionKey: "recededGums", value: true },
      { text: "No change observed", conditionKey: "recededGums", value: false }
    ] 
  },
  { 
    id: 4, 
    question: "Does your mouth frequently feel dry, or do you take medications that reduce your saliva?", 
    options: [
      { text: "Yes, constantly dry mouth", conditionKey: "hasImplants", value: true },
      { text: "No, feels normal", conditionKey: "hasImplants", value: false }
    ] 
  },
  { 
    id: 5, 
    question: "Do you experience pain or tenderness along your gumlines when chewing solid foods?", 
    options: [
      { text: "Yes, frequently", conditionKey: "bleedingGums", value: true },
      { text: "No discomfort", conditionKey: "bleedingGums", value: false }
    ] 
  },
  { 
    id: 6, 
    question: "Do you have structural trouble holding or manipulating your toothbrush handle comfortably?", 
    options: [
      { text: "Yes, grip is difficult", conditionKey: "hasImplants", value: true },
      { text: "No trouble at all", conditionKey: "hasImplants", value: false }
    ] 
  },
  { 
    id: 7, 
    question: "Do you find food debris consistently trapped underneath your dental bridges or implant crowns?", 
    options: [
      { text: "Yes, it gets trapped easily", conditionKey: "hasImplants", value: true },
      { text: "No issues clearing food", conditionKey: "hasImplants", value: false }
    ] 
  },
  { 
    id: 8, 
    question: "Do you feel any sharp pain or sensitivity when exposing teeth to hot or cold temperatures?", 
    options: [
      { text: "Yes, sensitive teeth surfaces", conditionKey: "recededGums", value: true },
      { text: "No sensitivity", conditionKey: "recededGums", value: false }
    ] 
  },
  { 
    id: 9, 
    question: "Is it visually or physically difficult to reach and focus on cleaning your back molars?", 
    options: [
      { text: "Yes, hard to reach", conditionKey: "preventative", value: true },
      { text: "No, accessible", conditionKey: "preventative", value: false }
    ] 
  },
  // Inside adultQuestions and seniorQuestions arrays in AssessmentScreen.tsx:
{ 
  id: 10, 
  question: "Do you smoke regularly or deal with tough, chronic plaque buildup?", 
  options: [
    { text: "Yes, regularly", conditionKey: "heavySmoker", value: true },
    { text: "No, never", conditionKey: "heavySmoker", value: false }
  ] 
}
];

export default function AssessmentScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();

  // ✅ PERSISTENT FIX: Retrieve mode securely from state navigation, and lock it inside localStorage
  const [mode, setMode] = useState<"child" | "adult" | "senior">(() => {
    const incomingMode = location.state?.mode;
    if (incomingMode) {
      localStorage.setItem("selected_app_mode", incomingMode);
      return incomingMode;
    }
    return (localStorage.getItem("selected_app_mode") as "child" | "adult" | "senior") || "adult";
  });

  const questionSets = {
    child: childQuestions,
    adult: adultQuestions,
    senior: seniorQuestions,
  };

  const questions = questionSets[mode] || adultQuestions;

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, { text: string; conditionKey: string; value: boolean }>>({});

  const handleAnswer = (optionObj: { text: string; conditionKey: string; value: boolean }) => {
    setAnswers({ ...answers, [currentQuestion]: optionObj });
  };

  const handleNext = async () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      try {
        const activeUserId = localStorage.getItem("userId") || "1";
        
        const clinicalResponses: Record<string, boolean> = {
          hasBraces: false,
          bleedingGums: false,
          recededGums: false,
          hasImplants: false,
          heavySmoker: false,
          aggressiveBrusher: false,
          sensitivity: false,
          manualDexterity: false,
          preventative: false
        };

        Object.values(answers).forEach((ansObj) => {
          if (ansObj.value === true) {
            clinicalResponses[ansObj.conditionKey] = true;
          }
        });

        console.log("Sending comprehensive 10-question diagnostic payload to port 8000...", clinicalResponses);
        try {
          const response = await fetchApiResilient(`/assessment/submit`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: parseInt(activeUserId, 10),
              responses: clinicalResponses, 
            }),
          });

          const result = await response.json();
          if (response.ok && result.success) {
            navigate("/prescription", { 
              state: { 
                technique: result.technique,
                description: result.description,
                whatItIs: result.whatItIs,
                howItWorks: result.howItWorks,
                whySuggested: result.whySuggested,
                precautions: result.precautions,
                steps: result.steps,
                videoUrl: result.videoUrl,
                mode: mode 
              } 
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
      } catch (error) {
        console.error("Network Fetch Crash Log:", error);
        alert("Could not link to Python backend. Ensure server is running on port 8000.");
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

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
          ></div>
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
                {answers[currentQuestion]?.text === option.text && <div className="w-2 h-2 rounded-full bg-white"></div>}
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
              Previous
            </button>
          )}
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestion]}
            className="flex-1 py-3.5 sm:py-4 min-h-[48px] rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-extrabold text-xs sm:text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-sky-600/20 active:scale-95"
          >
            <span>{currentQuestion < questions.length - 1 ? "Next Question" : "View Clinical Results"}</span>
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}