import api from './axios';
import { Review, CreateReviewDto, UpdateReviewDto, ProductRating } from '@/types';

export const reviewService = {
  // Créer un avis
  async createReview(data: CreateReviewDto): Promise<{ message: string; reviewId: number }> {
    const response = await api.post<{ message: string; reviewId: number }>('/reviews', data);
    return response.data;
  },

  // Récupérer les avis d'un produit
  async getReviewsByProduct(productId: number): Promise<Review[]> {
    const response = await api.get<Review[]>(`/reviews/product/${productId}`);
    return response.data;
  },

  // Récupérer les avis de l'utilisateur connecté
  async getMyReviews(): Promise<Review[]> {
    const response = await api.get<Review[]>('/reviews/user');
    return response.data;
  },

  // Récupérer les avis d'un utilisateur
  async getReviewsByUser(userId: number): Promise<Review[]> {
    const response = await api.get<Review[]>(`/reviews/user/${userId}`);
    return response.data;
  },

  // Mettre à jour un avis
  async updateReview(id: number, data: UpdateReviewDto): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/reviews/${id}`, data);
    return response.data;
  },

  // Supprimer un avis
  async deleteReview(id: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/reviews/${id}`);
    return response.data;
  },

  // Récupérer la note d'un produit
  async getProductRating(productId: number): Promise<ProductRating> {
    const response = await api.get<ProductRating>(`/reviews/product/${productId}/rating`);
    return response.data;
  },

  // Récupérer la note moyenne d'une boutique
  async getShopRating(shopId: number): Promise<{ shopId: number; averageRating: number }> {
    const response = await api.get(`/reviews/shop/${shopId}/rating`);
    return response.data;
  },
};