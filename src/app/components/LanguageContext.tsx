import { createContext, useContext, useState, ReactNode } from "react";

// 🌐 Comprehensive Dictionary Matrix for Core Screen Views
export const globalTranslations = {
  en: {
    dashboard: "Dashboard",
    profile: "Profile",
    chat: "Dental Chat",
    welcome: "Welcome back",
    morning: "☀️ Morning Routine",
    night: "🌙 Night Routine",
    saveReminders: "Save Active Reminder Times",
    retakeQuiz: "Retake Assessment Questionnaire",
    logout: "Logout Secure Session",
    askPlaceholder: "Ask about sensitivity, toothpaste, or techniques...",
    quickQuestion: "Quick questions:",
    onlineStatus: "Online - Virtual Assistant"
  },
  hi: {
    dashboard: "डैशबोर्ड",
    profile: "प्रोफ़ाइल",
    chat: "डेंटल चैट",
    welcome: "आपका स्वागत है",
    morning: "☀️ सुबह की दिनचर्या",
    night: "🌙 रात की दिनचर्या",
    saveReminders: "अनुस्मारक समय सहेजें",
    retakeQuiz: "मूल्यांकन प्रश्नावली फिर से लें",
    logout: "लॉगआउट सुरक्षित सत्र",
    askPlaceholder: "संवेदनशीलता, टूथपेस्ट या तकनीकों के बारे में पूछें...",
    quickQuestion: "त्वरित प्रश्न:",
    onlineStatus: "ऑनलाइन - वर्चुअल असिस्टेंट"
  },
  te: {
    dashboard: "డాష్‌బోర్డ్",
    profile: "ప్రొఫైల్",
    chat: "డెంటల్ చాట్",
    welcome: "తిరిగి స్వాగతం",
    morning: "☀️ ఉదయం దినచర్య",
    night: "🌙 రాత్రి దినచర్య",
    saveReminders: "రిమైండర్ సమయాలను సేవ్ చేయి",
    retakeQuiz: "అసెస్మెంట్ క్విజ్ మళ్ళీ తీసుకోండి",
    logout: "సురక్షిత సెషన్‌ను లాగ్ అవుట్ చేయి",
    askPlaceholder: "సున్నితత్వం, టూత్‌పేస్ట్ లేదా పద్ధతుల గురించి అడగండి...",
    quickQuestion: "త్వరిత ప్రశ్నలు:",
    onlineStatus: "ఆన్‌లైన్ - వర్చువల్ అసిస్టెంట్"
  },
  es: {
    dashboard: "Panel de control",
    profile: "Perfil",
    chat: "Chat Dental",
    welcome: "Bienvenido de nuevo",
    morning: "☀️ Rutina de Mañana",
    night: "🌙 Rutina de Noche",
    saveReminders: "Guardar Horarios de Recordatorio",
    retakeQuiz: "Volver a realizar el cuestionario",
    logout: "Cerrar sesión de forma segura",
    askPlaceholder: "Pregunta sobre sensibilidad, pasta dental o técnicas...",
    quickQuestion: "Preguntas rápidas:",
    onlineStatus: "En línea - Asistente Virtual"
  }
};

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: typeof globalTranslations["en"];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem("appLanguage") || "en");

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("appLanguage", lang);
  };

  const t = globalTranslations[language as keyof typeof globalTranslations] || globalTranslations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within a LanguageProvider");
  return context;
}