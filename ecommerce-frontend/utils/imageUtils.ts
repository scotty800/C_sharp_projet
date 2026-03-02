// src/utils/imageUtils.ts
export const getImageUrl = (url: string | null | undefined): string => {
  // Utiliser le fichier SVG qui existe vraiment
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

export const getValidProductImages = (product: any): string[] => {
  const rawUrls = [
    product?.imageUrl,
    product?.imageUrl1,
    product?.imageUrl2,
    product?.imageUrl3,
  ];
  
  console.log('🔍 URLs brutes reçues du backend:', rawUrls);
  
  // 1. Filtrer les valeurs invalides
  const validUrls = rawUrls.filter((url): url is string => {
    if (url == null) return false;
    if (typeof url !== 'string') return false;
    if (url.trim() === '') return false;
    if (url.toLowerCase() === 'null') return false;
    if (url.toLowerCase() === 'undefined') return false;
    if (!url.startsWith('/uploads/') && !url.startsWith('http')) return false;
    return true;
  });
  
  console.log('📋 URLs valides avant dédoublonnage:', validUrls);
  
  // 2. Supprimer les doublons (garde la première occurrence de chaque URL)
  const uniqueUrls = validUrls.filter((url, index, self) => {
    return self.indexOf(url) === index;
  });
  
  console.log('🎯 URLs uniques après dédoublonnage:', uniqueUrls);
  console.log(`📊 Résultat: ${uniqueUrls.length} image(s) unique(s)`);
  
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