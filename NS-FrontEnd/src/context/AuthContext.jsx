import React, { createContext, useState, useEffect } from 'react';
import { authApi } from '../api/auth';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setLoading(false);
        return;
      }

      // ✅ Vérifier que le token est valide
      const userData = await authApi.getCurrentUser();
      setUser(userData);
      
    } catch (err) {
      console.error('Auth check failed:', err);
      // ✅ En cas d'erreur, supprimer le token invalide
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await authApi.login({ email, password });
      
      // ✅ Vérifier que la réponse contient un token
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
      
      // ✅ Vérifier que la réponse contient un token
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
    // ✅ Optionnel : appeler l'API de déconnexion si nécessaire
    // authApi.logout();
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
    isVendor: user?.role === 'Vendor' || user?.role === 'Admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};