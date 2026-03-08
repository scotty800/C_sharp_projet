// src/utils/imageUtils.ts
export const getImageUrl = (url: string | null | undefined): string => {
  // ✅ Placeholder SVG unique
  const PLACEHOLDER = '/images/product-placeholder.svg';
  
  // Si pas d'URL, retourner le placeholder SVG
  if (!url) return PLACEHOLDER;
  
  // Si l'URL est déjà absolue (commence par http)
  if (url.startsWith('http')) {
    return url;
  }
  
  // Nettoyer l'URL
  let cleanUrl = url.trim();
  
  // Pour les images uploadées (logo, banner, produits)
  if (cleanUrl.startsWith('/uploads')) {
    const baseUrl = 'http://127.0.0.1:5019';
    const finalUrl = `${baseUrl}${cleanUrl}`;
    return finalUrl;
  }
  
  // Pour les images du dossier public du frontend
  if (cleanUrl.startsWith('/images')) {
    return cleanUrl;
  }
  
  return cleanUrl;
};

export const getProductImageUrl = (product: any): string => {
  const PLACEHOLDER = '/images/product-placeholder.svg';
  
  if (!product) return PLACEHOLDER;
  
  const imageUrl = product.imageUrl1 || product.imageUrl2 || product.imageUrl3 || product.imageUrl;
  
  if (!imageUrl) return PLACEHOLDER;
  
  return getImageUrl(imageUrl);
};

export const getShopImageUrl = (url: string | null | undefined): string => {
  const PLACEHOLDER = '/images/product-placeholder.svg';
  if (!url) return PLACEHOLDER;
  return getImageUrl(url);
};

export const getValidProductImages = (product: any): string[] => {
  if (!product) return [];
  
  const rawUrls = [
    product?.imageUrl,
    product?.imageUrl1,
    product?.imageUrl2,
    product?.imageUrl3,
  ];
  
  const validUrls = rawUrls.filter((url): url is string => {
    if (url == null) return false;
    if (typeof url !== 'string') return false;
    if (url.trim() === '') return false;
    if (url.toLowerCase() === 'null') return false;
    if (url.toLowerCase() === 'undefined') return false;
    if (!url.startsWith('/uploads/') && !url.startsWith('http') && !url.startsWith('/images/')) {
      return false;
    }
    return true;
  });
  
  // Supprimer les doublons
  const uniqueUrls = validUrls.filter((url, index, self) => {
    return self.indexOf(url) === index;
  });
  
  return uniqueUrls;
};

export const debugProductImages = (product: any) => {
  console.group('🔍 DEBUG IMAGES PRODUIT');
  console.log('Produit ID:', product?.id);
  console.log('Nom:', product?.name);
  console.log('imageUrl:', product?.imageUrl, '→ type:', typeof product?.imageUrl);
  console.log('imageUrl1:', product?.imageUrl1, '→ type:', typeof product?.imageUrl1);
  console.log('imageUrl2:', product?.imageUrl2, '→ type:', typeof product?.imageUrl2);
  console.log('imageUrl3:', product?.imageUrl3, '→ type:', typeof product?.imageUrl3);
  
  const valid = getValidProductImages(product);
  console.log('✅ Images valides finales:', valid);
  console.groupEnd();
  
  return valid;
};