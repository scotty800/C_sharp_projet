import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';


const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Important pour CORS
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      // ✅ Vérifier le format du token (Bearer)
      config.headers.Authorization = `Bearer ${token}`;
      
      // ✅ Log pour debug (à retirer en production)
      console.log('Request with token:', config.url);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => {
    // ✅ Retourner directement response.data pour simplifier
    return response;
  },
  (error) => {
    // ✅ Gestion centralisée des erreurs
    if (error.response) {
      // La requête a été faite et le serveur a répondu avec un code d'erreur
      console.error('API Error Response:', {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url
      });

      // ✅ Si token invalide (401) ou bad request (400) sur /users/me
      if (error.response.status === 401 || 
          (error.response.status === 400 && error.config?.url?.includes('/users/me'))) {
        localStorage.removeItem('token');
        // Optionnel: rediriger vers login
        // window.location.href = '/login';
      }
    } else if (error.request) {
      // La requête a été faite mais pas de réponse
      console.error('API No Response:', error.request);
    } else {
      // Erreur lors de la configuration de la requête
      console.error('API Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;