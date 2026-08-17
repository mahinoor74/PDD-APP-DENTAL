import { useNavigate } from "react-router-dom";
import { Globe, Check } from "lucide-react";
import { useLanguage, supportedLanguages } from "./LanguageContext";

const screenTranslations: Record<string, { step: string; title: string; subtitle: string; nextBtn: string }> = {
  en: { step: "Step 2 of 3", title: "Choose Your Language", subtitle: "Select your preferred language for the app", nextBtn: "Next" },
  te: { step: "3 లో 2 వ దశ", title: "మీ భాషను ఎంచుకోండి", subtitle: "యాప్ కోసం మీకు నచ్చిన భాషను ఎంచుకోండి", nextBtn: "తరువాత" },
  hi: { step: "चरण 2 का 3", title: "अपनी भाषा चुनें", subtitle: "ऐप के लिए अपनी पसंदीदा भाषा का चयन करें", nextBtn: "आगे बढ़ें" },
  ta: { step: "படி 2 / 3", title: "மொழியைத் தேர்ந்தெடுக்கவும்", subtitle: "பயன்பாட்டிற்கான உங்கள் மொழியைத் தேர்ந்தெடுக்கவும்", nextBtn: "அடுத்து" },
  kn: { step: "ಹಂತ 2 ರ 3", title: "ನಿಮ್ಮ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", subtitle: "ಅಪ್ಲಿಕೇಶನ್‌ಗಾಗಿ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ", nextBtn: "ಮುಂದೆ" },
  ml: { step: "ഘട്ടം 2 / 3", title: "ഭാഷ തിരഞ്ഞെടുക്കുക", subtitle: "ആപ്പിനായി ഭാഷ തിരഞ്ഞെടുക്കുക", nextBtn: "അടുത്തത്" },
  mr: { step: "पायरी २ पैकी ३", title: "आपली भाषा निवडा", subtitle: "अ‍ॅपसाठी आपली आवडती भाषा निवडा", nextBtn: "पुढे" },
  gu: { step: "પગલું ૨/૩", title: "તમારી ભાષા પસંદ કરો", subtitle: "એપ માટે તમારી પસંદગીની ભાષા પસંદ કરો", nextBtn: "આગળ" },
  bn: { step: "ধাপ ২ / ৩", title: "আপনার ভাষা নির্বাচন করুন", subtitle: "অ্যাপের জন্য আপনার পছন্দের ভাষা বেছে নিন", nextBtn: "পরবর্তী" },
  es: { step: "Paso 2 de 3", title: "Elige tu idioma", subtitle: "Selecciona tu idioma preferido para la aplicación", nextBtn: "Siguiente" },
  fr: { step: "Étape 2 sur 3", title: "Choisissez votre langue", subtitle: "Sélectionnez votre langue préférée pour l'application", nextBtn: "Suivant" },
  de: { step: "Schritt 2 von 3", title: "Wählen Sie Ihre Sprache", subtitle: "Wählen Sie Ihre bevorzugte Sprache für die App", nextBtn: "Weiter" }
};

export default function LanguageScreen() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  
  const t = screenTranslations[language] || screenTranslations.en;

  return (
    <div className="min-h-screen bg-white flex flex-col p-6 font-sans">
      <div className="mb-6">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 h-1.5 rounded-full bg-[#2D9CDB]"></div>
          <div className="flex-1 h-1.5 rounded-full bg-[#2D9CDB]"></div>
          <div className="flex-1 h-1.5 rounded-full bg-gray-200"></div>
        </div>
        <p className="text-xs font-bold text-[#64748B]">{t.step}</p>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 rounded-2xl bg-[#F2F9FF] border border-sky-100 flex items-center justify-center flex-shrink-0">
          <Globe className="w-6 h-6 text-[#2D9CDB]" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E293B] tracking-tight">{t.title}</h1>
        </div>
      </div>

      <p className="text-[#64748B] mb-6 font-medium text-xs md:text-sm">{t.subtitle}</p>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1 max-h-[60vh]">
        {supportedLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={`w-full p-4 rounded-2xl border-2 transition-all flex items-center justify-between outline-none cursor-pointer ${
              language === lang.code
                ? "bg-[#F2F9FF] border-[#2D9CDB] shadow-sm"
                : "bg-white border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center gap-3 text-left">
              <span className="text-xl">{lang.flag}</span>
              <div>
                <p className="font-bold text-[#1E293B] text-sm">{lang.native}</p>
                <p className="text-xs text-[#64748B] font-medium">{lang.name}</p>
              </div>
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
        onClick={() => navigate("/demographics")}
        className="w-full py-4 rounded-2xl bg-[#0F4C81] text-white font-extrabold tracking-wide mt-6 shadow-md hover:bg-[#0F4C81]/90 transition-all cursor-pointer text-sm"
      >
        {t.nextBtn}
      </button>
    </div>
  );
}