import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "./components/LanguageContext";
import useGlobalReminders from "./components/useGlobalReminders";
import AlarmModal from "./components/AlarmModal";

// 🗂️ Component View Screens
import AuthScreen from "./components/AuthScreen";
import DemographicsScreen from "./components/DemographicsScreen";
import AssessmentScreen from "./components/AssessmentScreen";
import PrescriptionScreen from "./components/PrescriptionScreen";
import SuccessScreen from "./components/SuccessScreen";
import DashboardScreen from "./components/DashboardScreen";
import ProfileScreen from "./components/ProfileScreen";
import ChatbotScreen from "./components/ChatbotScreen";
import SplashScreen from "./components/SplashScreen";
import MirrorScreen from "./components/MirrorScreen";
import LayoutWithNavbar from "./components/LayoutWithNavbar";
import LanguageScreen from "./components/LanguageScreen";

function AppContent() {
  useGlobalReminders();

  return (
    <>
      <AlarmModal />
      <Routes>
        {/* 🧭 Onboarding Workflow Pipelines (No Bottom Navbar) */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/auth" element={<AuthScreen />} />
        <Route path="/demographics" element={<DemographicsScreen />} />
        <Route path="/language" element={<LanguageScreen />} />
        <Route path="/assessment" element={<AssessmentScreen />} />
        <Route path="/prescription" element={<PrescriptionScreen />} />
        <Route path="/success" element={<SuccessScreen />} />

        {/* 🌟 Persistent Main Features */}
        <Route path="/mirror" element={<LayoutWithNavbar><MirrorScreen /></LayoutWithNavbar>} />
        <Route path="/dashboard" element={<LayoutWithNavbar><DashboardScreen /></LayoutWithNavbar>} />
        <Route path="/chatbot" element={<LayoutWithNavbar><ChatbotScreen /></LayoutWithNavbar>} />
        <Route path="/profile" element={<LayoutWithNavbar><ProfileScreen /></LayoutWithNavbar>} />
        
        {/* 🛡️ Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </LanguageProvider>
  );
}
