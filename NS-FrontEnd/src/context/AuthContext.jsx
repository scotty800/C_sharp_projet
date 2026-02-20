import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('🔓 No token found');
        setLoading(false);
        return;
      }

      try {
        console.log('🔑 Token found, validating...');
        const userData = await authApi.getCurrentUser();
        console.log('✅ User validated:', userData);
        setUser(userData);
      } catch (err) {
        console.error('❌ Token validation failed:', err);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authApi.login({ email, password });
      
      if (response?.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        return response;
      } else {
        throw new Error('Token non reçu');
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
      throw err;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const response = await authApi.register(userData);
      
      if (response?.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
        return response;
      } else {
        throw new Error('Token non reçu');
      }
    } catch (err) {
      setError(err.message || "Erreur d'inscription");
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin'
    // ✅ Plus de isVendor - on utilise ownerId côté backend
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};