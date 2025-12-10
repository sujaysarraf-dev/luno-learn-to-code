import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile')
};

// Lessons API
export const lessonsAPI = {
  getAll: () => api.get('/lesson'),
  getById: (id) => api.get(`/lesson/${id}`),
  explainLine: (lessonId, lineId) => api.post(`/lesson/${lessonId}/explain-line`, { lineId }),
  generateQuiz: (lessonId) => api.post(`/lesson/${lessonId}/generate-quiz`)
};

// Quiz API
export const quizAPI = {
  getById: (id) => api.get(`/quiz/${id}`),
  submit: (id, answers) => api.post(`/quiz/${id}/submit`, { answers })
};

// Chat API
export const chatAPI = {
  sendMessage: (message, history) => api.post('/chat', { message, history })
};

// Debug API
export const debugAPI = {
  debugCode: (code, errorMessage) => api.post('/debug', { code, errorMessage })
};

// Progress API
export const progressAPI = {
  getProgress: () => api.get('/progress/progress'),
  getStats: () => api.get('/progress/stats'),
  markCompleted: (lessonId) => api.post(`/progress/lesson/${lessonId}/complete`),
  trackAccess: (lessonId) => api.post(`/progress/lesson/${lessonId}/access`)
};

// Quiz History API
export const quizHistoryAPI = {
  getHistory: () => api.get('/quiz/history'),
  getAttempts: (quizId) => api.get(`/quiz/${quizId}/attempts`)
};

// Streak API
export const streakAPI = {
  getStreak: () => api.get('/streak'),
  recordActivity: (activityType, activityId, points) => api.post('/streak/activity', { activityType, activityId, points }),
  completeChallenge: (challengeId) => api.post('/streak/challenge/complete', { challengeId }),
  getTodayChallenge: () => api.get('/streak/challenge/today')
};

// Code Review API
export const codeReviewAPI = {
  reviewCode: (code, language = 'html') => api.post('/code-review/review', { code, language }),
  getSuggestions: (code, issue, language = 'html') => api.post('/code-review/suggestions', { code, issue, language })
};

export default api;

