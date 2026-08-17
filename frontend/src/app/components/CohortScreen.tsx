import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Send, Mic, Bot, User as UserIcon } from "lucide-react";

type Message = {
  id: number;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
};

const quickReplies = [
  "How do I reduce sensitivity?",
  "Best toothpaste for whitening?",
  "Bass technique tutorial",
  "Tips for flossing",
];

export default function ChatbotScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const mode = location.state?.mode || "adult";

  const activeSession = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!) : null;
  const userName = activeSession?.name || "there";

  const initialMessages: Message[] = [
    {
      id: 1,
      text: `Hello ${userName}! I'm Dr. Minty, your virtual dental assistant. How can I help you today?`,
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

  const handleSend = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: messageText,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:8000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const botMessage: Message = {
          id: messages.length + 2,
          text: data.response,
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        throw new Error("Server communication break.");
      }
    } catch (error) {
      console.error("AI Assistant network fetch crash log:", error);
      
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "I am having minor communication issues linking to my local database matrix. Please ensure your Python backend server is active on port 8000!",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-gradient-to-r from-[#0F4C81] to-[#2D9CDB] text-white p-4 flex items-center gap-3 shadow-md">
        <button
          onClick={() => navigate("/dashboard")}
          className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
              <Bot className="w-7 h-7 text-[#2D9CDB]" />
            </div>
            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
          </div>
          <div>
            <h2 className="font-bold">Dr. Minty</h2>
            <p className="text-xs text-white/80">Online - Virtual Assistant</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.sender === "user"
                  ? "bg-[#0F4C81]"
                  : "bg-[#F2F9FF] border border-[#2D9CDB]"
              }`}
            >
              {message.sender === "user" ? (
                <UserIcon className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-[#2D9CDB]" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                message.sender === "user"
                  ? "bg-[#0F4C81] text-white rounded-tr-sm"
                  : "bg-white text-[#1E293B] border border-gray-200 rounded-tl-sm"
              }`}
            >
              <p className="text-sm whitespace-pre-line leading-relaxed">
                {message.text}
              </p>
              <p
                className={`text-[10px] mt-1 ${
                  message.sender === "user" ? "text-white/60" : "text-[#64748B]"
                }`}
              >
                {message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3 flex-row items-center">
            <div className="w-8 h-8 rounded-full bg-[#F2F9FF] border border-[#2D9CDB] flex items-center justify-center flex-shrink-0 animate-pulse">
              <Bot className="w-4 h-4 text-[#2D9CDB]" />
            </div>
            <div className="bg-slate-100/70 px-4 py-3.5 rounded-2xl rounded-tl-sm flex items-center gap-1.5 shadow-xs">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-0" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="px-4 pb-4">
          <p className="text-xs text-[#64748B] mb-2 font-bold uppercase tracking-wider">Quick questions:</p>
          <div className="flex flex-wrap gap-2">
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => handleSend(reply)}
                className="px-3 py-2 rounded-full bg-[#F2F9FF] text-[#0F4C81] text-sm border border-[#2D9CDB] hover:bg-[#2D9CDB] hover:text-white transition-colors cursor-pointer"
              >
                {reply}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-10">
        <div className="flex items-end gap-2 max-w-md mx-auto">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about sensitivity, toothpaste, or techniques..."
              className="w-full pl-4 pr-12 py-3 rounded-full bg-[#F2F9FF] border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#2D9CDB] text-sm font-semibold text-slate-800"
            />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B]">
              <Mic className="w-5 h-5" />
            </button>
          </div>
          <button
            onClick={() => handleSend()}
            disabled={!inputText.trim()}
            className="w-12 h-12 rounded-full bg-[#0F4C81] text-white flex items-center justify-center hover:bg-[#0F4C81]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer shadow-sm"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
