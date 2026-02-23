import api from './axios';
import { Cart, AddToCartDto, UpdateCartItemDto, CartResponse } from '@/types';

export const cartService = {
  // Récupérer le panier
  async getCart(): Promise<Cart> {
    const response = await api.get<Cart>('/cart');
    return response.data;
  },

  // Récupérer le nombre d'articles
  async getCartCount(): Promise<{ count: number }> {
    const response = await api.get<{ count: number }>('/cart/count');
    return response.data;
  },

  // Ajouter au panier
  async addToCart(data: AddToCartDto): Promise<{ message: string; itemId: number }> {
    const response = await api.post<{ message: string; itemId: number }>('/cart/add', data);
    return response.data;
  },

  // Mettre à jour la quantité
  async updateCartItem(itemId: number, data: UpdateCartItemDto): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>(`/cart/item/${itemId}`, data);
    return response.data;
  },

  // Supprimer un article
  async removeFromCart(itemId: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/cart/item/${itemId}`);
    return response.data;
  },

  // Vider le panier
  async clearCart(): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>('/cart/clear');
    return response.data;
  },
};