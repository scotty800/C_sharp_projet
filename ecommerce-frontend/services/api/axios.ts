import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';
import { ApiError } from '@/types/api';

// ⭐ Correction : utiliser le bon port 5019
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5019/api';

// Création de l'instance Axios
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (typeof window !== 'undefined') {
      // Gestion des erreurs 401 (non authentifié)
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        // Redirection vers login si pas déjà sur la page de login
        if (!window.location.pathname.includes('/auth/')) {
          window.location.href = '/auth/login';
        }
      }

      // Gestion des erreurs 403 (non autorisé)
      if (error.response?.status === 403) {
        console.error('Accès non autorisé');
      }

      // Gestion des erreurs 404 (non trouvé)
      if (error.response?.status === 404) {
        console.error('Ressource non trouvée');
      }

      // Gestion des erreurs 500 (erreur serveur)
      if (error.response?.status === 500) {
        console.error('Erreur serveur interne');
      }
    }

    return Promise.reject(error);
  }
);

export default api;