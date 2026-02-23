'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api/axios';
import { CartItem, Cart } from '@/types/cart';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();

  const itemCount = cart?.items?.reduce((total: number, item: CartItem) => total + item.quantity, 0) || 0;

  // Charger le panier quand l'utilisateur se connecte
  useEffect(() => {
    if (user && token) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [user, token]);

  const refreshCart = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data } = await api.get('/cart');
      setCart(data);
    } catch (error) {
      console.error('Erreur lors du chargement du panier:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addToCart = async (productId: number, quantity: number) => {
    try {
      setIsLoading(true);
      const { data } = await api.post('/cart/add', { productId, quantity });
      
      // Mettre à jour le panier avec la réponse
      await refreshCart();
      
      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      setIsLoading(true);
      await api.put(`/cart/item/${itemId}`, { quantity });
      
      // ✅ CORRECTION : Utiliser CartItem pour le type du paramètre
      setCart((prev: Cart | null) => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map((item: CartItem) => // ← Type CartItem, pas Cart
            item.id === itemId ? { ...item, quantity } : item
          ),
        };
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      setIsLoading(true);
      await api.delete(`/cart/item/${itemId}`);
      
      // ✅ CORRECTION : Utiliser CartItem pour le type du paramètre
      setCart((prev: Cart | null) => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.filter((item: CartItem) => item.id !== itemId), // ← Type CartItem
        };
      });
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setIsLoading(true);
      await api.delete('/cart/clear');
      // ✅ CORRECTION : Vérifier que cart existe
      setCart((prev: Cart | null) => {
        if (!prev) return null;
        return { ...prev, items: [] };
      });
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      itemCount,
      isLoading,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      refreshCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};