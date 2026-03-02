// src/utils/productUtils.ts
import { Product } from '@/types/product';

/**
 * Extrait un tableau de produits à partir de la réponse de l'API
 * Gère différentes structures possibles
 */
export const extractProductsFromResponse = (data: any): Product[] => {
  console.log('🔍 Extraction de produits à partir de:', data);
  
  if (!data) {
    console.log('❌ Données vides');
    return [];
  }
  
  // Structure observée: { shop: {...}, products: { items: [...] } }
  if (data.products?.items && Array.isArray(data.products.items)) {
    console.log('✅ Structure trouvée: products.items');
    return data.products.items;
  }
  
  // Structure 1: { products: { data: [...] } }
  if (data.products?.data && Array.isArray(data.products.data)) {
    console.log('✅ Structure 1: products.data');
    return data.products.data;
  }
  
  // Structure 2: { data: [...] }
  if (data.data && Array.isArray(data.data)) {
    console.log('✅ Structure 2: data');
    return data.data;
  }
  
  // Structure 3: Tableau direct
  if (Array.isArray(data)) {
    console.log('✅ Structure 3: tableau direct');
    return data;
  }
  
  // Structure 4: { items: [...] }
  if (data.items && Array.isArray(data.items)) {
    console.log('✅ Structure 4: items');
    return data.items;
  }
  
  // Structure 5: { products: [...] }
  if (data.products && Array.isArray(data.products)) {
    console.log('✅ Structure 5: products (tableau)');
    return data.products;
  }
  
  console.log('⚠️ Structure non reconnue, clés disponibles:', Object.keys(data));
  return [];
};