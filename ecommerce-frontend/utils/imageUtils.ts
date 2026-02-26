// src/utils/imageUtils.ts
export const getImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/images/product-placeholder.svg';
  
  // Si l'URL est déjà absolue (commence par http)
  if (url.startsWith('http')) {
    return url;
  }
  
  // Pour les images uploadées (logo, banner, produits)
  // Elles doivent pointer vers le backend
  if (url.startsWith('/uploads')) {
    // Utiliser l'URL du backend (port 5019)
    const baseUrl = 'http://127.0.0.1:5019';
    return `${baseUrl}${url}`;
  }
  
  // Pour les images du dossier public du frontend
  return url;
};

export const getProductImageUrl = (product: any): string => {
  // Priorité : imageUrl1, imageUrl2, imageUrl3, imageUrl
  const imageUrl = product.imageUrl1 || product.imageUrl2 || product.imageUrl3 || product.imageUrl;
  return getImageUrl(imageUrl);
};

export const getShopImageUrl = (url: string | null | undefined): string => {
  if (!url) return '/images/shop-placeholder.svg';
  return getImageUrl(url);
};