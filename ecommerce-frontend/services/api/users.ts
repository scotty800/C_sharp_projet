import api from './axios';
import { User, UpdateUserRequest, PaginatedResponse } from '@/types';

export const userService = {
  // Récupérer tous les utilisateurs (admin)
  async getAllUsers(page = 1, pageSize = 10): Promise<PaginatedResponse<User>> {
    const response = await api.get<PaginatedResponse<User>>('/users', {
      params: { page, pageSize },
    });
    return response.data;
  },

  // Récupérer un utilisateur par ID
  async getUserById(id: number): Promise<User> {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },

  // Mettre à jour un utilisateur
  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, data);
    return response.data;
  },

  // Supprimer un utilisateur (admin)
  async deleteUser(id: number): Promise<void> {
    await api.delete(`/users/${id}`);
  },

  // Mettre à jour le profil de l'utilisateur courant
  async updateProfile(data: UpdateUserRequest): Promise<User> {
    const response = await api.put<User>('/users/profile', data);
    return response.data;
  },

  // Changer le mot de passe
  async changePassword(oldPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>('/users/change-password', {
      oldPassword,
      newPassword,
    });
    return response.data;
  },
};