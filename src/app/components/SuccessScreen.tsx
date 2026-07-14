import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ FIXED IMPORT: Linked to react-router-dom
import { Sparkles, Crown, Star, Clock } from "lucide-react";

const childQuotes = [
  "Awesome job! Your teeth are super clean and shiny!",
  "You did it! Your smile is sparkling like stars!",
  "Great brushing! You're a tooth-brushing superhero!",
  "Fantastic! Your teeth are saying 'Thank you!'",
  "Amazing work! Keep up the great brushing!",
];

const adultQuotes = [
  "Excellent work! Your dental routine is on point!",
  "Well done! You're taking great care of your smile!",
  "Perfect! Your teeth and gums are grateful!",
  "Great job! Consistent care leads to healthy teeth!",
  "Outstanding! Your oral health is a priority!",
];

const seniorQuotes = [
  "Wonderful! Your gentle care keeps your mouth healthy!",
  "Well done! You're maintaining excellent oral health!",
  "Great care! Your comfort-first approach is working!",
  "Excellent! Your mouth health matters, and you're doing great!",
  "Perfect! Gentle brushing is the key to healthy gums!",
];

export default function SuccessScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode || "adult";

  const quotesByMode = {
    child: childQuotes,
    adult: adultQuotes,
    senior: seniorQuotes,
  };

  const quotes = quotesByMode[mode as keyof typeof quotesByMode] || adultQuotes;
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2F9FF] via-blue-50 to-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-10 left-10 animate-bounce">
        <Sparkles className="w-6 h-6 text-[#2D9CDB]" />
      </div>
      <div
        className="absolute top-20 right-10 animate-bounce"
        style={{ animationDelay: "0.2s" }}
      >
        <Star className="w-5 h-5 text-[#0F4C81]" fill="#0F4C81" />
      </div>
      <div
        className="absolute bottom-32 left-16 animate-bounce"
        style={{ animationDelay: "0.4s" }}
      >
        <Star className="w-4 h-4 text-[#2D9CDB]" fill="#2D9CDB" />
      </div>

      <div className="relative mb-8 animate-scale-in">
        <div className="relative">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="100" cy="100" r="90" fill="#2D9CDB" opacity="0.1" />
            <circle cx="100" cy="100" r="70" fill="#2D9CDB" opacity="0.2" />
            <path
              current-path="true"
              d="M100 50C80 50 70 60 70 80C70 100 80 110 100 140C120 110 130 100 130 80C130 60 120 50 100 50Z"
              fill="white"
            />
            <path
              d="M100 55C82 55 75 63 75 80C75 97 82 105 100 135C118 105 125 97 125 80C125 63 118 55 100 55Z"
              fill="#2D9CDB"
            />
            <circle cx="90" cy="75" r="8" fill="white" opacity="0.9" />
            <circle cx="105" cy="78" r="5" fill="white" opacity="0.7" />
            <path
              d="M 85 90 Q 100 100, 115 90"
              stroke="white"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute -top-4 -right-4">
            <Crown className="w-16 h-16 text-yellow-400" fill="#FCD34D" />
          </div>
          <div className="absolute bottom-2 -left-2">
            <Sparkles
              className="w-10 h-10 text-[#2D9CDB]"
              fill="#2D9CDB"
            />
          </div>
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#1E293B] mb-4 leading-relaxed px-4">
          {quote}
        </h1>
        <div className="flex items-center justify-center gap-2 text-[#64748B]">
          <Clock className="w-5 h-5" />
          <p className="text-lg">Duration: 2:00 mins</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 mb-6">
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M20 6L9 17L4 12"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="text-left">
            <p className="text-sm text-[#64748B]">Session Complete</p>
            <p className="font-bold text-[#1E293B]">Brushing logged</p>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate("/dashboard")}
        className="w-full max-w-md py-4 rounded-2xl bg-[#0F4C81] text-white font-medium hover:bg-[#0F4C81]/90 transition-colors cursor-pointer shadow-sm"
      >
        Great, I'm Done!
      </button>

      <style>{`
        @keyframes scale-in {
          0% {
            transform: scale(0.5);
            opacity: 0;
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-scale-in {
          animation: scale-in 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}