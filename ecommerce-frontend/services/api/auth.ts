import api from './axios';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';

export const authService = {
  // Connexion
  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  // Inscription
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  // Récupérer l'utilisateur courant
  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  // Rafraîchir le token
  async refreshToken(): Promise<{ token: string }> {
    const response = await api.post<{ token: string }>('/auth/refresh-token');
    return response.data;
  },

  // Déconnexion (côté serveur si nécessaire)
  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  // Vérifier si l'email existe
  async checkEmail(email: string): Promise<{ exists: boolean }> {
    const response = await api.get<{ exists: boolean }>(`/auth/check-email?email=${email}`);
    return response.data;
  },

  // Demander la réinitialisation du mot de passe
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/forgot-password', { email });
    return response.data;
  },

  // Réinitialiser le mot de passe
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/auth/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },
};