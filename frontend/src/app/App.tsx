import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Every time the app opens or reloads, force landing on the Signup page (/auth)
    const allowedOnboardingPaths = ["/auth", "/demographics", "/assessment", "/prescription"];
    if (!allowedOnboardingPaths.includes(location.pathname)) {
      navigate("/auth", { replace: true });
    }
  }, []);

  return (
    <>
      <AlarmModal />
      <Routes>
        {/* 🧭 Onboarding Workflow Pipelines (Direct to Signup on launch) */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
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
        <Route path="*" element={<Navigate to="/auth" replace />} />
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
