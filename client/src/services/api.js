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

export default api;

