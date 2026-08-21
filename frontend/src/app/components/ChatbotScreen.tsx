import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Send, Bot, User as UserIcon, ArrowLeft, Sparkles, RefreshCw, Smile, Shield } from "lucide-react";
import { API_BASE_URL, fetchApiResilient } from "./apiService";
import { useLanguage } from "./LanguageContext";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
  chips?: string[];
};

function renderFormattedMessage(text: string) {
  const lines = text.split("\n");
  return lines.map((line, lineIdx) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    const lineContent = parts.map((part, partIdx) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={partIdx} className="font-bold text-slate-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    return (
      <React.Fragment key={lineIdx}>
        {lineContent}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

export default function ChatbotScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Detect kid mode
  const appMode = localStorage.getItem("selected_app_mode") || "adult";
  const isKidMode = appMode === "child";

  // Build chip set based on mode + language
  const adultChips = [t.chip1, t.chip2, t.chip3, t.chip4, t.chip5, t.chip6, t.chip7, t.chip8].filter(Boolean);
  const kidChips = [t.kidChip1, t.kidChip2, t.kidChip3, t.kidChip4, t.kidChip5, t.kidChip6].filter(Boolean);
  const quickReplies = isKidMode ? kidChips : adultChips;

  const [userName] = useState(() => {
    try {
      const activeSession = localStorage.getItem("user_session");
      if (activeSession && activeSession.trim().startsWith("{")) {
        const parsed = JSON.parse(activeSession);
        if (parsed && parsed.name) return parsed.name;
      }
    } catch (e) {}
    return localStorage.getItem("userName") || "ToothMate User";
  });

  const greetingText = isKidMode
    ? `Hey ${userName}! 🦷 I'm Dr. Minty, your dental superhero! Ask me anything about your teeth! 🌟`
    : `Hello ${userName}! 👋 I'm Dr. Minty, your AI Dental Coach. Ask me any question about your teeth, brushing techniques, sensitivity, or oral health!`;

  const initialMessages: Message[] = [
    {
      id: 1,
      text: greetingText,
      sender: "bot",
      timestamp: new Date(),
    },
  ];

  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const processChatSubmission = async (textToSend: string) => {
    const cleanText = textToSend ? String(textToSend).trim() : "";
    if (!cleanText) return;

    const nextIdBase = Date.now();

    const userMessage: Message = {
      id: nextIdBase,
      text: cleanText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetchApiResilient('/chat', {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ 
          message: cleanText,
          lang: "English" 
        }),
      });

      if (!response.ok) throw new Error("Chat server error");
      
      const data = await response.json();
      const botReplyText = data.response || data.text || "Response processed successfully.";
      const newChips = data.followUpChips || [];

      const botMessage: Message = {
        id: nextIdBase + 1,
        text: botReplyText,
        sender: "bot",
        timestamp: new Date(),
        chips: newChips,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Chat API error:", error);
      const fallbackText = 
        `Hello ${userName}! I am Dr. Minty, your Senior AI Dental Coach.\n\n` +
        `• **Brushing**: Brush twice daily for 2 minutes using a soft toothbrush at a 45° angle (Modified Bass technique).\n` +
        `• **Flossing**: Floss once daily before bed to clear plaque between teeth.\n` +
        `• **Advice**: For bleeding gums, sensitivity, or toothache, ask me specific questions or check our app feature guide!`;

      const errorMessage: Message = {
        id: nextIdBase + 1,
        text: fallbackText,
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleResetChat = () => {
    setMessages(initialMessages);
  };

  return (
    <div className="w-full flex flex-col h-full min-h-[500px] bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden font-sans relative flex-1">
      
      {/* Sleek Mobile Header */}
      <div className="bg-gradient-to-r from-sky-700 via-teal-700 to-cyan-600 text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/dashboard")}
            className="w-9 h-9 min-h-[44px] min-w-[44px] rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center cursor-pointer transition-all"
            aria-label="Back to dashboard"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-sm">
              <Bot className="w-5 h-5 text-cyan-200" />
            </div>
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-sky-800 rounded-full animate-pulse"></span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-extrabold text-sm tracking-tight text-white">Dr. Minty AI</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-300/30">
                ACTIVE COACH
              </span>
            </div>
            <p className="text-[11px] text-sky-100/90 font-medium">Virtual Dental Assistant • Online</p>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="px-3 py-2 min-h-[44px] rounded-xl bg-white/10 hover:bg-white/20 text-sky-100 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
          title="Reset conversation"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Quick Prompt Chips (Horizontal Scrollable) */}
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-3 py-2.5 border-b border-slate-200/60 dark:border-slate-700/60 shrink-0 overflow-x-auto whitespace-nowrap scrollbar-none flex items-center gap-2">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 shrink-0 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-sky-500" /> {isKidMode ? "🦷 Ask me:" : (t.chatQuickReplies || "Quick Ask:")}
        </span>
        {quickReplies.map((reply, idx) => (
          <button
            key={idx}
            onClick={() => processChatSubmission(reply)}
            className="inline-flex items-center px-3.5 py-2 min-h-[44px] rounded-full bg-sky-50 dark:bg-slate-700/80 text-sky-700 dark:text-sky-300 hover:bg-sky-600 hover:text-white dark:hover:bg-sky-500 text-xs font-semibold border border-sky-200/80 dark:border-slate-600 transition-all cursor-pointer shrink-0 active:scale-95 shadow-xs"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* Scrollable Message History Area */}
      <div className="flex-1 overflow-y-auto p-3.5 md:p-5 space-y-3.5 bg-slate-50/50 dark:bg-slate-900/50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-2.5 ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
          >
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              message.sender === "user" ? "bg-sky-600 text-white" : "bg-white dark:bg-slate-800 text-teal-600 dark:text-cyan-400 border border-slate-200 dark:border-slate-700"
            }`}>
              {message.sender === "user" ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 shadow-xs ${
              message.sender === "user" 
                ? "bg-sky-600 text-white rounded-tr-xs" 
                : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-tl-xs"
            }`}>
              <div className="text-xs md:text-sm font-medium leading-relaxed">
                {message.sender === "bot" ? renderFormattedMessage(message.text) : message.text}
              </div>
              {message.sender === "bot" && message.chips && message.chips.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap gap-1.5">
                  {message.chips.map((chip, chipIdx) => (
                    <button
                      key={chipIdx}
                      onClick={() => processChatSubmission(chip)}
                      className="px-3 py-1.5 min-h-[38px] rounded-full bg-sky-50 dark:bg-slate-700 text-sky-700 dark:text-sky-300 hover:bg-sky-600 hover:text-white text-[11px] font-semibold border border-sky-200/60 dark:border-slate-600 transition-all cursor-pointer active:scale-95"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
              <p className={`text-[9px] mt-1 font-semibold text-right ${message.sender === "user" ? "text-sky-200" : "text-slate-400 dark:text-slate-500"}`}>
                {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-2.5 flex-row items-center">
            <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 shadow-xs">
              <Bot className="w-4 h-4 text-sky-600 dark:text-cyan-400 animate-spin" />
            </div>
            <div className="bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 px-3.5 py-2.5 rounded-2xl rounded-tl-xs text-slate-500 dark:text-slate-400 text-xs font-semibold animate-pulse shadow-xs flex items-center gap-1.5">
              <span>{isKidMode ? "Dr. Minty is thinking... 🤔" : (t.chatTyping || "Dr. Minty is analyzing")}</span>
              <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Fixed Bottom Input Bar with 48px Min Height */}
      <form onSubmit={(e) => { e.preventDefault(); processChatSubmission(inputText); }} className="p-3 bg-white dark:bg-slate-800 border-t border-slate-200/80 dark:border-slate-700/80 flex gap-2 items-center shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isKidMode ? "Ask me anything about teeth! 🦷" : (t.chatPlaceholder || "Ask Dr. Minty a dental question...")}
          className="flex-1 px-4 py-3 min-h-[48px] rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs md:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-12 h-12 min-h-[48px] min-w-[48px] rounded-2xl bg-sky-600 hover:bg-sky-500 text-white flex items-center justify-center transition-all disabled:opacity-40 shrink-0 cursor-pointer shadow-md shadow-sky-600/20 active:scale-95"
          aria-label="Send message"
        >
          <Send className="w-4 h-4 fill-white" />
        </button>
      </form>

    </div>
  );
}
