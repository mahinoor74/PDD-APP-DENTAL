import React, { useState, useRef, useEffect } from "react";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useLanguage, supportedLanguages } from "./LanguageContext";

export default function LanguageSelector() {
  const { language, setLanguage, currentLangObj } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left z-50" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm hover:border-sky-300 text-slate-800 text-xs font-bold transition-all cursor-pointer outline-none focus:ring-2 focus:ring-sky-500/20"
      >
        <Globe className="w-4 h-4 text-sky-600" />
        <span className="text-sm">{currentLangObj.flag}</span>
        <span className="font-extrabold text-slate-900">{currentLangObj.native}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 max-h-72 overflow-y-auto">
          <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Select App Language</p>
          </div>
          {supportedLanguages.map((lang) => (
            <button
              key={lang.code}
              type="button"
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 text-left text-xs flex items-center justify-between transition-colors hover:bg-sky-50 cursor-pointer ${
                language === lang.code ? "bg-sky-50 text-sky-900 font-bold" : "text-slate-700 font-medium"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">{lang.flag}</span>
                <div>
                  <p className="font-bold text-slate-900 text-xs">{lang.native}</p>
                  <p className="text-[10px] text-slate-400">{lang.name}</p>
                </div>
              </div>
              {language === lang.code && <Check className="w-4 h-4 text-sky-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
