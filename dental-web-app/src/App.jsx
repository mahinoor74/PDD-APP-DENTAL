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
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_20%,#E0F2FE_0%,transparent_40%),radial-gradient(circle_at_90%_80%,#D1FAE5_0%,transparent_40%),radial-gradient(circle_at_50%_50%,#F0FDFA_0%,transparent_60%),#F8FAFC] text-slate-900 flex flex-col font-sans">
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
