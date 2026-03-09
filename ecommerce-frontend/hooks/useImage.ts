'use client';

import { useState } from 'react';

export const useImage = () => {
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  const getImageUrl = (url: string | null | undefined): string => {
    // Si pas d'URL, retourner le placeholder
    if (!url) return '/images/product-placeholder.svg';
    
    // Nettoyer l'URL
    let cleanUrl = url.trim();
    
    // Si l'URL est déjà absolue
    if (cleanUrl.startsWith('http')) {
      return cleanUrl;
    }
    
    // Si c'est une image uploadée (commence par /uploads)
    if (cleanUrl.startsWith('/uploads')) {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://127.0.0.1:5019';
      // Éviter les doubles slashes
      const finalUrl = `${baseUrl}${cleanUrl}`;
      console.log('🖼️ URL construite:', finalUrl); // Pour déboguer
      return finalUrl;
    }
    
    // Si c'est une image du dossier public
    if (cleanUrl.startsWith('/images')) {
      return cleanUrl;
    }
    
    // Fallback
    return cleanUrl;
  };

  const handleImageError = (imageKey: string) => {
    setImageErrors(prev => ({ ...prev, [imageKey]: true }));
  };

  const getImageSrc = (imageKey: string, url: string | null | undefined): string => {
    if (imageErrors[imageKey]) {
      return '/images/product-placeholder.svg';
    }
    return getImageUrl(url);
  };

  return {
    getImageUrl,
    getImageSrc,
    handleImageError,
    imageErrors,
  };
};