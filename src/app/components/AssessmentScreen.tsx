import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom"; 
import { ChevronLeft, ChevronRight } from "lucide-react";

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
          hasImplants: false
        };

        Object.values(answers).forEach((ansObj) => {
          if (ansObj.value === true && ansObj.conditionKey in clinicalResponses) {
            clinicalResponses[ansObj.conditionKey] = true;
          }
        });

        console.log("Sending dynamic diagnostic payload matrix to port 8000...");

        const response = await fetch("http://localhost:8000/api/assessment/submit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: parseInt(activeUserId, 10),
            responses: clinicalResponses, 
          }),
        });

        const result = await response.json();
        console.log("Response received from Python:", result);

        if (response.ok && result.success) {
          navigate("/prescription", { 
            state: { 
              technique: result.technique,
              description: result.description,
              steps: result.steps,
              videoUrl: result.videoUrl,
              mode: mode 
            } 
          });
        } else {
          alert("Server responded but could not process the dynamic assessment criteria.");
        }
      } catch (error) {
        console.error("Network Fetch Crash Log:", error);
        alert("Could not link to Python backend. Ensure your Uvicorn terminal is running on port 8000.");
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
    <div className="min-h-screen bg-white flex flex-col p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-[#1E293B]">
            Question {currentQuestion + 1} of {questions.length}
          </p>
          <p className="text-sm text-[#64748B]">{Math.round(progress)}%</p>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#2D9CDB] transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex-1">
        <div className="bg-gradient-to-br from-[#F2F9FF] to-white p-6 rounded-3xl border border-gray-200 mb-6">
          <h2 className="text-xl font-bold text-[#1E293B] leading-relaxed">
            {question?.question}
          </h2>
        </div>

        <div className="space-y-3">
          {question?.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(option)}
              className={`w-full p-4 rounded-2xl border-2 transition-all text-left outline-none cursor-pointer ${
                answers[currentQuestion]?.text === option.text
                  ? "bg-[#F2F9FF] border-[#2D9CDB]"
                  : "bg-white border-gray-200 hover:border-gray-300"
              }`}
            >
              <p className="font-medium text-[#1E293B]">{option.text}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        {currentQuestion > 0 && (
          <button
            onClick={handlePrevious}
            className="px-6 py-4 rounded-2xl border-2 border-[#0F4C81] text-[#0F4C81] font-medium hover:bg-[#F2F9FF] transition-colors flex items-center gap-2 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!answers[currentQuestion]}
          className="flex-1 py-4 rounded-2xl bg-[#0F4C81] text-white font-medium hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
        >
          {currentQuestion < questions.length - 1 ? "Next Question" : "View Results"}
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}