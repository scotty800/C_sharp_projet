// hooks/useTheme.ts
'use client';

import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    // En développement, on peut avoir une erreur, mais on retourne une valeur par défaut
    if (process.env.NODE_ENV === 'development') {
      console.warn('useTheme must be used within ThemeProvider');
    }
    // Retourner une valeur par défaut pour éviter le crash
    return {
      theme: 'dark' as const,
      toggleTheme: () => {},
      setTheme: () => {},
    };
  }
  
  return context;
};