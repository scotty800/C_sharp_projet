import React, { createContext, useState, useEffect } from 'react';
import { cartApi } from '../api/cart';
import { useAuth } from '../hooks/useAuth';

export const CartContext = createContext();

export const CartProvider = ({ children}) => {
    const [cart, setCart ] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (isAuthenticated) {
            fetchCart();
        } else {
            const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
            updateCartCount(localCart);
        }
    }, [isAuthenticated]);

    const fetchCart = async () => {
        try {
            setLoading(true);
            const cartData = await cartApi.getCart();
            setCart(cartData);
            updateCartCount(cartData.items || []);
        } catch (err) {
            console.error('Error fetching cart:', err);
        } finally {
            setLoading(false);
        }
    };

    const updateCartCount = (items) => {
        const count = items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            if (isAuthenticated) {
                await cartApi.addToCart({ productId, quantity });
                await fetchCart();
            } else {
                const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                const existingItem = localCart.find(item => item.productId === productId);

                if (existingItem) {
                    existingItem.quantity += quantity;
                } else {
                    localCart.push({ productId, quantity });
                }

                localStorage.setItem('cart', JSON.stringify(localCart));
                updateCartCount(localCart);
            }
        } catch (err) {
            console.error('Error adding to cart:', err);
            throw err;
        }
    };

    const updateQuantity = async (itemId, quantity) => {
        try {
            if (isAuthenticated) {
                await cartApi.updateItem(itemId, { quantity });
                await fetchCart();
            }  else {
                const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                const item = localCart.find(i => i.id === itemId);
                if (item) {
                    item.quantity = quantity;
                    localStorage.setItem('cart', JSON.stringify(localCart));
                    updateCartCount(localCart);
                }
            }
        } catch (err) {
            console.error('Error updating cart:', err);
            throw err;
        }
    };

    const removeFromCart = async (itemId) => {
        try {
            if (isAuthenticated) {
                await cartApi.removeItem(itemId);
                await fetchCart();
            } else {
                const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
                const updatedCart = localCart.filter(i => i.id !== itemId);
                localStorage.setItem('cart', JSON.stringify(updatedCart));
                updateCartCount(updatedCart);
            }
        } catch (err) {
            console.error('Error removing from cart:', err);
            throw err;
        }
    };

    const clearCart = async () => {
        try {
            if (isAuthenticated) {
                await cartApi.clearCart();
                setCart(null);
                setCartCount(0);
            } else {
                localStorage.removeItem('cart');
                setCartCount(0);
            }
        } catch (err) {
            console.error('Error clearing cart:', err);
            throw err;
        }
    };

    const value = {
        cart,
        cartCount,
        loading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};