import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

const DEFAULT_USER = {
  id: 1,
  name: 'Mahin',
  email: 'mahin@toothmate.com',
  ageGroup: 'adult',
  gender: 'other',
  hasCompletedOnboarding: true,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('toothmate_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });

  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('toothmate_lang') || 'English';
  });

  const [reminders, setRemindersState] = useState(() => {
    const saved = localStorage.getItem('toothmate_reminders');
    return saved
      ? JSON.parse(saved)
      : { morningTime: '08:00', nightTime: '21:30' };
  });

  const [latestAssessment, setLatestAssessmentState] = useState(() => {
    const saved = localStorage.getItem('toothmate_assessment');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('toothmate_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('toothmate_user');
    }
  }, [user]);

  const login = (userData) => {
    const fullUser = { ...DEFAULT_USER, ...userData };
    setUser(fullUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('toothmate_user');
  };

  const updateProfile = (data) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('toothmate_lang', lang);
  };

  const setReminders = (remData) => {
    setRemindersState(remData);
    localStorage.setItem('toothmate_reminders', JSON.stringify(remData));
  };

  const setLatestAssessment = (assessmentResult) => {
    setLatestAssessmentState(assessmentResult);
    localStorage.setItem('toothmate_assessment', JSON.stringify(assessmentResult));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        language,
        reminders,
        latestAssessment,
        login,
        logout,
        updateProfile,
        setLanguage,
        setReminders,
        setLatestAssessment,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
