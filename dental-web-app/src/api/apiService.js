import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

export const apiService = {
  // Check backend health
  async checkHealth() {
    try {
      const res = await api.get('/');
      return res.data;
    } catch (e) {
      console.warn("Backend health check failed:", e);
      return { status: 'offline' };
    }
  },

  // Auth: Sign In
  async signIn(email, password) {
    const res = await api.post('/api/auth/signin', { email, password });
    return res.data;
  },

  // Auth: Sign Up
  async signUp({ email, password, name, ageGroup = 'adult', gender = 'other' }) {
    const res = await api.post('/api/auth/signup', {
      email,
      password,
      profile: { name, ageGroup, gender },
    });
    return res.data;
  },

  // Auth: Password Recovery
  async recoverPassword(email) {
    const res = await api.post('/api/auth/recover', { email });
    return res.data;
  },

  // Demographics Update
  async updateDemographics({ userId, name, ageGroup, gender }) {
    const res = await api.put('/api/auth/demographics', {
      userId: Number(userId),
      name,
      ageGroup,
      gender,
    });
    return res.data;
  },

  // Dashboard Metrics
  async getDashboardMetrics(userId) {
    const res = await api.get(`/api/dashboard/metrics/${userId}`);
    return res.data;
  },

  // Log Manual Brushing
  async logManualBrush(userId) {
    const res = await api.post('/api/brush/log-manual', { userId: Number(userId) });
    return res.data;
  },

  // Record Brushing Session (Smart Mirror finish)
  async recordSession({ userId, technique, duration = 120 }) {
    const res = await api.post('/api/sessions', {
      userId: Number(userId),
      technique,
      duration,
      timestamp: new Date().toISOString(),
    });
    return res.data;
  },

  // Assessment Submission
  async submitAssessment(userId, responses) {
    const res = await api.post('/api/assessment/submit', {
      userId: Number(userId),
      responses: {
        hasBraces: !!responses.hasBraces,
        bleedingGums: !!responses.bleedingGums,
        recededGums: !!responses.recededGums,
        hasImplants: !!responses.hasImplants,
        heavySmoker: !!responses.heavySmoker,
        aggressiveBrusher: !!responses.aggressiveBrusher,
        sensitivity: !!responses.sensitivity,
        manualDexterity: !!responses.manualDexterity,
        preventative: !!responses.preventative,
      },
    });
    return res.data;
  },

  // Chat with Dr. Minty (100% Local ML)
  async sendChatMessage(message, userId = 1, lang = 'English') {
    const res = await api.post('/api/chat', {
      message,
      user_id: userId,
      userId: userId,
      lang: lang,
    });
    return res.data;
  },

  // Save Reminders
  async saveReminders({ userId, morningTime24h, nightTime24h, deviceToken = '' }) {
    const res = await api.post('/api/reminders/save', {
      userId: Number(userId),
      morningTime24h,
      nightTime24h,
      deviceToken,
    });
    return res.data;
  },
};
