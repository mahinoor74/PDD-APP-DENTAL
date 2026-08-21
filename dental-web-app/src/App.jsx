import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';

import { SplashPage } from './pages/SplashPage';
import { LanguagePage } from './pages/LanguagePage';
import { DemographicsPage } from './pages/DemographicsPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { SmartMirrorPage } from './pages/SmartMirrorPage';
import { AssessmentPage } from './pages/AssessmentPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { PrescriptionPage } from './pages/PrescriptionPage';
import { ProfilePage } from './pages/ProfilePage';

const AppLayout = ({ children }) => {
  const location = useLocation();
  const hideNav = ['/', '/language', '/demographics', '/auth'].includes(location.pathname);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_15%_15%,rgba(129,140,248,0.28)_0%,transparent_50%),radial-gradient(circle_at_85%_15%,rgba(192,132,252,0.28)_0%,transparent_50%),radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.22)_0%,transparent_60%),radial-gradient(circle_at_85%_85%,rgba(236,72,153,0.2)_0%,transparent_50%),#0F172A] text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {!hideNav && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
};

export function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <AppLayout>
            <Routes>
              <Route path="/" element={<SplashPage />} />
              <Route path="/language" element={<LanguagePage />} />
              <Route path="/demographics" element={<DemographicsPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/smart-mirror" element={<SmartMirrorPage />} />
              <Route path="/assessment" element={<AssessmentPage />} />
              <Route path="/chat" element={<ChatbotPage />} />
              <Route path="/prescription" element={<PrescriptionPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AppLayout>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
