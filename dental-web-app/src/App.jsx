import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
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
  const { isDarkTheme } = useTheme();

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${
        isDarkTheme
          ? 'bg-slate-950 text-white selection:bg-indigo-500 selection:text-white'
          : 'bg-gradient-to-br from-slate-50 via-teal-50/40 to-emerald-50/30 text-slate-900 selection:bg-teal-500 selection:text-white'
      }`}
    >
      {!hideNav && <Navbar />}
      <main className="flex-1">{children}</main>
      {!hideNav && <BottomNav />}
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
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
    </ThemeProvider>
  );
}

export default App;
