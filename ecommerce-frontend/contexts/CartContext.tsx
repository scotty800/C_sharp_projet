'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api/axios';
import { CartItem, Cart } from '@/types/cart';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  // ⭐ MODIFICATION — addToCart avec size et color optionnels
  addToCart: (productId: number, quantity: number, size?: string, color?: string) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  // ⭐ AJOUT — mise à jour de la variante
  updateVariant: (itemId: number, size?: string, color?: string) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  // ⭐ AJOUT — pilotage du sidebar
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // ⭐ AJOUT
  const { user, token } = useAuth();

  const itemCount = cart?.items?.reduce((total: number, item: CartItem) => total + item.quantity, 0) || 0;

  const openSidebar = () => setIsSidebarOpen(true);     // ⭐ AJOUT
  const closeSidebar = () => setIsSidebarOpen(false);   // ⭐ AJOUT
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev); // ⭐ AJOUT

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

  // ⭐ MODIFICATION — addToCart avec size et color
  const addToCart = async (productId: number, quantity: number, size?: string, color?: string) => {
    try {
      setIsLoading(true);
      const { data } = await api.post('/cart/add', { productId, quantity, size, color });

      await refreshCart();
      setIsSidebarOpen(true); // ⭐ AJOUT — feedback visuel immédiat

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

      setCart((prev: Cart | null) => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.map((item: CartItem) =>
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

  // ⭐ AJOUT — mise à jour de la variante d'un article
  const updateVariant = async (itemId: number, size?: string, color?: string) => {
    try {
      setIsLoading(true);
      await api.put(`/cart/item/${itemId}/variant`, { size, color });
      await refreshCart();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la variante:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      setIsLoading(true);
      await api.delete(`/cart/item/${itemId}`);

      setCart((prev: Cart | null) => {
        if (!prev) return null;
        return {
          ...prev,
          items: prev.items.filter((item: CartItem) => item.id !== itemId),
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
      updateVariant,    // ⭐ AJOUT
      removeFromCart,
      clearCart,
      refreshCart,
      isSidebarOpen,   // ⭐ AJOUT
      openSidebar,     // ⭐ AJOUT
      closeSidebar,    // ⭐ AJOUT
      toggleSidebar,   // ⭐ AJOUT
    }}>
      {children}
    </CartContext.Provider>
  );
};