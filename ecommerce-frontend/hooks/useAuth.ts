'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const canManageShop = (userId: number | undefined, shopOwnerId: number | undefined): boolean => {
  if (!userId || !shopOwnerId) return false;
  return userId === shopOwnerId;
};

export const isAdmin = (role?: string): boolean => {
  return role === 'Admin';
};