import { useNavigate } from "react-router-dom";
import { Globe, Check } from "lucide-react";
import { useLanguage } from "./LanguageContext";

const languages = [
  { code: "en", name: "English", native: "English" },
  { code: "hi", name: "Hindi", native: "हिन्दी" },
  { code: "te", name: "Telugu", native: "తెలుగు" },
  { code: "es", name: "Spanish", native: "Español" },
];

const screenTranslations = {
  en: { step: "Step 2 of 3", title: "Choose Your Language", subtitle: "Select your preferred language for the app", nextBtn: "Next" },
  hi: { step: "चरण 2 का 3", title: "अपनी भाषा चुनें", subtitle: "ऐप के लिए अपनी पसंदीदा भाषा का चयन करें", nextBtn: "आगे बढ़ें" },
  te: { step: "3 లో 2 వ దశ", title: "మీ భాషను ఎంచుకోండి", subtitle: "యాప్ కోసం మీకు నచ్చిన భాషను ఎంచుకోండి", nextBtn: "తరువాత" },
  es: { step: "Paso 2 de 3", title: "Elige tu idioma", subtitle: "Selecciona tu idioma preferido para la aplicación", nextBtn: "Siguiente" }
};

export default function LanguageScreen() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  
  const t = screenTranslations[language as keyof typeof screenTranslations] || screenTranslations.en;

  return (
    <div className="min-h-screen bg-white flex flex-col p-6">
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-1.5 rounded-full bg-[#2D9CDB]"></div>
          <div className="flex-1 h-1.5 rounded-full bg-[#2D9CDB]"></div>
          <div className="flex-1 h-1.5 rounded-full bg-gray-200"></div>
        </div>
        <p className="text-sm font-bold text-[#64748B]">{t.step}</p>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 rounded-full bg-[#F2F9FF] flex items-center justify-center flex-shrink-0">
          <Globe className="w-6 h-6 text-[#2D9CDB]" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-[#1E293B] tracking-tight">{t.title}</h1>
        </div>
      </div>

      <p className="text-[#64748B] mb-8 font-semibold text-sm">{t.subtitle}</p>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between outline-none cursor-pointer ${
              language === lang.code
                ? "bg-[#F2F9FF] border-[#2D9CDB]"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="text-left">
              <p className="font-bold text-[#1E293B]">{lang.native}</p>
              <p className="text-xs text-[#64748B] font-medium mt-0.5">{lang.name}</p>
            </div>
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                language === lang.code ? "border-[#2D9CDB] bg-[#2D9CDB]" : "border-gray-300"
              }`}
            >
              {language === lang.code && <Check className="w-3.5 h-3.5 text-white" strokeWidth={4} />}
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={() => navigate("/cohort")}
        className="w-full py-4 rounded-2xl bg-[#0F4C81] text-white font-black tracking-wide mt-8 shadow-md hover:opacity-95 transition-opacity cursor-pointer"
      >
        {t.nextBtn}
      </button>
    </div>
  );
}