// src/utils/imageUtils.ts
export const getImageUrl = (url: string | null | undefined): string => {
  const PLACEHOLDER = '/images/product-placeholder.svg';
  
  if (!url) {
    console.log('❌ Pas d\'URL, utilisation du placeholder');
    return PLACEHOLDER;
  }
  
  console.log('🔍 URL originale:', url);
  
  if (url.startsWith('http')) {
    console.log('✅ URL déjà absolue:', url);
    return url;
  }
  
  let cleanUrl = url.trim();
  console.log('🧹 URL nettoyée:', cleanUrl);
  
  if (cleanUrl.startsWith('/uploads')) {
    const baseUrl = 'http://127.0.0.1:5019';
    const finalUrl = `${baseUrl}${cleanUrl}`;
    console.log('✅ URL construite pour upload:', finalUrl);
    return finalUrl;
  }
  
  if (cleanUrl.startsWith('/images')) {
    console.log('✅ URL du dossier public:', cleanUrl);
    return cleanUrl;
  }
  
  console.log('⚠️ Format non reconnu, retour tel quel:', cleanUrl);
  return cleanUrl;
};

export const getProductImageUrl = (product: any): string => {
  const PLACEHOLDER = '/images/product-placeholder.svg';
  
  if (!product) {
    console.log('❌ Produit null ou undefined');
    return PLACEHOLDER;
  }
  
  console.log('🔍 Produit reçu dans getProductImageUrl:', product.id, product.name);
  console.log('📸 Images disponibles:', {
    imageUrl: product.imageUrl,
    imageUrl1: product.imageUrl1,
    imageUrl2: product.imageUrl2,
    imageUrl3: product.imageUrl3,
  });
  
  // Priorité : imageUrl1, imageUrl2, imageUrl3, imageUrl
  const imageUrl = product.imageUrl1 || product.imageUrl2 || product.imageUrl3 || product.imageUrl;
  
  if (!imageUrl) {
    console.log('❌ Aucune image trouvée pour le produit', product.id);
    return PLACEHOLDER;
  }
  
  console.log('✅ Image trouvée:', imageUrl);
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
  
  console.log('🔍 URLs brutes pour getValidProductImages:', rawUrls);
  
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
  
  console.log('✅ URLs valides trouvées:', validUrls);
  
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