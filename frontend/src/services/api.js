import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('sympfindx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      sessionStorage.removeItem('sympfindx_token');
      sessionStorage.removeItem('sympfindx_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (userData) => api.put('/auth/profile', userData),
};

export const predictionAPI = {
  uploadImage: (formData) => {
    return api.post('/prediction/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  analyzeSymptoms: (symptomsData) => api.post('/prediction/symptoms', symptomsData),
  getPrediction: (predictionId) => api.get(`/prediction/${predictionId}`),
  getUserPredictions: () => api.get('/prediction/history'),
  combinedAnalysis: (data) => api.post('/prediction/analyze', data),
};

export const specialistAPI = {
  getSpecialists: (diseaseType) => api.get(`/specialist?disease=${diseaseType}`),
  getSpecialistDetails: (specialistId) => api.get(`/specialist/${specialistId}`),
  requestAppointment: (appointmentData) => api.post('/specialist/appointment', appointmentData),
};

export const reportsAPI = {
  getUserReports: () => api.get('/reports'),
  getReportById: (reportId) => api.get(`/reports/${reportId}`),
  downloadReport: (reportId) => api.get(`/reports/${reportId}/download`, {
    responseType: 'blob'
  }),
};

export default api;