import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RefreshCw, Zap } from 'lucide-react';
import { apiService } from '../api/apiService';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

export const ChatbotPage = () => {
  const { user } = useAuth();
  const { language, t } = useLanguage();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: t('chat_welcome'),
      chips: [
        'How to reduce tooth sensitivity?',
        'Why do my gums bleed?',
        'Modified Bass technique guide',
      ],
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text.trim() || loading) return;

    const userMsg = { id: Date.now(), sender: 'user', text };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await apiService.sendChatMessage(text, user?.id || 1, language);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: res.response || res.text || 'I am here to assist with your dental health questions.',
        confidence: res.confidence,
        category: res.category,
        chips: res.followUpChips || [
          'Best way to floss back teeth',
          'How often to change toothbrush?',
          'What toothpaste is best for sensitivity?'
        ],
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.warn("Dr Minty chat error:", err);
      const botMsg = {
        id: Date.now() + 1,
        sender: 'bot',
        text: 'I recommend brushing twice daily for 2 minutes using a soft-bristled toothbrush at a 45-degree angle. Is there a specific symptom you are experiencing?',
        chips: ['How to reduce tooth sensitivity?', 'Why do my gums bleed?'],
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto my-6 bg-slate-900/90 backdrop-blur-2xl rounded-3xl border-2 border-indigo-500/30 shadow-2xl shadow-indigo-950/80 overflow-hidden flex flex-col h-[78vh]">
      {/* Chat Window Header */}
      <div className="bg-gradient-to-r from-indigo-700 via-purple-600 to-violet-700 p-4 px-6 text-white flex items-center justify-between shadow-md shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-md flex items-center justify-center text-white">
            <Bot className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="text-base font-black flex items-center gap-2 tracking-tight">
              <span>{t('chat_title')}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black border border-white/30 flex items-center gap-1 shadow-xs">
                <Zap className="w-3 h-3 text-purple-200 fill-purple-200" />
                {t('chat_tag')}
              </span>
            </h1>
            <p className="text-[11px] text-purple-100 font-medium">
              {t('chat_desc')}
            </p>
          </div>
        </div>

        {/* Bot Status Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 border border-white/30 backdrop-blur-md">
          <span className="w-2.5 h-2.5 bg-emerald-300 ring-4 ring-emerald-400/40 rounded-full animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider text-emerald-100 uppercase">ONLINE</span>
        </div>
      </div>

      {/* Chat Message Area */}
      <div className="bg-slate-950/70 p-6 overflow-y-auto space-y-4 flex-1">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white font-bold'
                    : 'bg-slate-800 border border-indigo-500/40 text-indigo-300'
                }`}
              >
                {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-indigo-300" />}
              </div>

              <div className={`space-y-2 ${isUser ? 'items-end' : 'items-start'}`}>
                {/* Chat Bubbles */}
                <div
                  className={`p-5 text-xs sm:text-sm leading-relaxed shadow-lg ${
                    isUser
                      ? 'bg-gradient-to-r from-indigo-500 via-purple-500 to-violet-600 text-white font-bold rounded-2xl rounded-tr-none shadow-indigo-500/30 max-w-[75%]'
                      : 'bg-gradient-to-br from-slate-800 to-slate-900 text-slate-100 border-l-4 border-l-indigo-400 border border-slate-700/60 rounded-2xl rounded-tl-none max-w-[80%]'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Suggestion Chips */}
                {!isUser && msg.chips && msg.chips.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.chips.map((chip, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(chip)}
                        className="bg-indigo-950/90 text-indigo-300 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-purple-500 hover:text-white border border-indigo-400/50 font-bold text-xs px-4 py-2 rounded-full transition-all cursor-pointer shadow-md hover:scale-105"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-indigo-500/40 text-indigo-300 flex items-center justify-center shadow-md">
              <Bot className="w-4 h-4 animate-spin text-indigo-400" />
            </div>
            <div className="bg-slate-800 border border-indigo-500/30 p-4 rounded-2xl rounded-tl-none text-xs text-slate-200 font-semibold shadow-lg flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              <span>{t('chat_analyzing')}</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-4 bg-slate-900 border-t border-slate-800 flex items-center gap-3 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t('chat_placeholder')}
          className="bg-slate-800/90 border border-indigo-500/40 focus:border-indigo-400 text-white rounded-2xl px-5 py-3.5 w-full outline-none placeholder:text-slate-400 font-medium text-xs sm:text-sm transition-all"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold p-3.5 rounded-xl shadow-lg shadow-indigo-500/30 transition-transform active:scale-95 disabled:opacity-40 cursor-pointer shrink-0"
        >
          <Send className="w-5 h-5 text-white" />
        </button>
      </form>
    </div>
  );
};
