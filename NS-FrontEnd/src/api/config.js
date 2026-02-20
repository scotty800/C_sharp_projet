import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5019/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log(`🚀 Request: ${config.method.toUpperCase()} ${config.url} with token`);
    } else {
      console.log(`🔓 Request without token: ${config.method.toUpperCase()} ${config.url}`);
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs
api.interceptors.response.use(
  (response) => {
    console.log(`✅ Response: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error('❌ API Error:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method
      });

      // Si token invalide (401) ou bad request (400) sur /users/me
      if (error.response.status === 401 || 
          (error.response.status === 400 && error.config?.url?.includes('/users/me'))) {
        console.log('🔐 Token invalide, suppression...');
        localStorage.removeItem('token');
        
        // Optionnel: rediriger vers login si nécessaire
        // window.location.href = '/login';
      }
    } else if (error.request) {
      console.error('❌ No response:', error.request);
    } else {
      console.error('❌ Request error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;