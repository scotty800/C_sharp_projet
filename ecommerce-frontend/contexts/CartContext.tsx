'use client';

import { createContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import api from '@/services/api/axios';
import { CartItem, Cart } from '@/types/cart';

interface CartContextType {
  cart: Cart | null;
  itemCount: number;
  isLoading: boolean;
  isMutating: boolean;
  addToCart: (productId: number, quantity: number, size?: string, color?: string) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  updateVariant: (itemId: number, size?: string, color?: string) => Promise<void>;
  removeFromCart: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

export const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMutating, setIsMutating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, token } = useAuth();

  const itemCount = cart?.items?.reduce((total: number, item: CartItem) => total + item.quantity, 0) || 0;

  const openSidebar = () => setIsSidebarOpen(true);
  const closeSidebar = () => setIsSidebarOpen(false);
  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  useEffect(() => {
    if (user && token) {
      refreshCart();
    } else {
      setCart(null);
    }
  }, [user, token]);

  // ⭐ refreshCart — inchangé, garde isLoading
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

  // ⭐ addToCart — utilise isMutating
  const addToCart = async (productId: number, quantity: number, size?: string, color?: string) => {
    try {
      setIsMutating(true);
      const { data } = await api.post('/cart/add', { productId, quantity, size, color });

      await refreshCart();
      setIsSidebarOpen(true);

      return data;
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  // ⭐ MODIFICATION — updateQuantity avec recalcul du totalPrice et totalAmount
  const updateQuantity = async (itemId: number, quantity: number) => {
    const previousCart = cart;   // ⭐ AJOUT — pour rollback si erreur serveur

    // ⭐ AJOUT — mise à jour optimiste complète, sans attendre le serveur
    setCart((prev: Cart | null) => {
      if (!prev) return null;
      const updatedItems = prev.items.map((item: CartItem) =>
        item.id === itemId
          ? { ...item, quantity, totalPrice: item.productPrice * quantity }
          : item
      );
      const updatedTotalAmount = updatedItems.reduce(
        (sum, item) => sum + item.totalPrice,
        0
      );
      return {
        ...prev,
        items: updatedItems,
        totalAmount: updatedTotalAmount,
      };
    });

    try {
      setIsMutating(true);
      await api.put(`/cart/item/${itemId}`, { quantity });
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setCart(previousCart);   // ⭐ AJOUT — rollback si le serveur refuse (ex: stock insuffisant)
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  // ⭐ updateVariant — utilise isMutating
  const updateVariant = async (itemId: number, size?: string, color?: string) => {
    try {
      setIsMutating(true);
      await api.put(`/cart/item/${itemId}/variant`, { size, color });
      await refreshCart();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la variante:', error);
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  // ⭐ removeFromCart — utilise isMutating avec rollback
  const removeFromCart = async (itemId: number) => {
    const previousCart = cart;
    setCart((prev: Cart | null) => {
      if (!prev) return null;
      return { ...prev, items: prev.items.filter((item: CartItem) => item.id !== itemId) };
    });

    try {
      setIsMutating(true);
      await api.delete(`/cart/item/${itemId}`);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      setCart(previousCart);
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  // ⭐ clearCart — utilise isMutating
  const clearCart = async () => {
    try {
      setIsMutating(true);
      await api.delete('/cart/clear');
      setCart((prev: Cart | null) => {
        if (!prev) return null;
        return { ...prev, items: [] };
      });
    } catch (error) {
      console.error('Erreur lors du vidage du panier:', error);
      throw error;
    } finally {
      setIsMutating(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cart,
      itemCount,
      isLoading,
      isMutating,
      addToCart,
      updateQuantity,
      updateVariant,
      removeFromCart,
      clearCart,
      refreshCart,
      isSidebarOpen,
      openSidebar,
      closeSidebar,
      toggleSidebar,
    }}>
      {children}
    </CartContext.Provider>
  );
};