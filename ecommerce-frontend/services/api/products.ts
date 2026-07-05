import api from './axios';
import { 
  Product, 
  ProductResponse, 
  CreateProductDto, 
  UpdateProductDto,
  ProductListResponse,
  ProductFilterParams,
  ProductImageUploadDto
} from '@/types';
import { CreateStudioProduct, StudioProduct, ColorVariant, UpsertColorVariantDto } from '@/types/studio';

export const productService = {
  // Récupérer tous les produits avec pagination et filtres
  async getProducts(params?: ProductFilterParams): Promise<ProductListResponse> {
    const response = await api.get<ProductListResponse>('/products/paged', { params });
    return response.data;
  },

  // ⭐⭐⭐ getProductById AVEC NORMALISATION DES colorVariants ⭐⭐⭐
  async getProductById(id: number): Promise<StudioProduct> {
    console.log('📦 getProductById:', id);
    const response = await api.get<any>(`/products/${id}`);
    console.log('📦 Réponse getProductById:', response.data);
    
    const data = response.data;
    // ⭐ Normaliser les données
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      price: data.price,
      stock: data.stock || 0,
      category: data.category || '',
      sizes: data.sizes || (data.size ? (typeof data.size === 'string' ? data.size.split(',') : data.size) : []),
      colors: data.colors || (data.color ? (typeof data.color === 'string' ? data.color.split(',') : data.color) : []),
      imageUrl: data.imageUrl || data.imageUrl1 || '',
      imageUrl1: data.imageUrl1 || data.imageUrl || '',
      imageUrl2: data.imageUrl2 || '',
      imageUrl3: data.imageUrl3 || '',
      // ⭐ NOUVEAU : Récupérer les variantes de couleur avec normalisation
      colorVariants: (data.variants || data.colorVariants || []).map((v: any) => ({
        ...v,
        sizes: v.sizes || v.size || [],   // ⭐ normalisation défensive
      })),
      isInStock: (data.stock || 0) > 0,
      createdAt: data.createdAt,
    };
  },

  // Récupérer les produits d'une boutique (avec pagination)
  async getProductsByShop(
    shopId: number, 
    params?: Omit<ProductFilterParams, 'category'>
  ): Promise<{
    shop: { id: number; name: string; slug: string; productCount: number };
    products: ProductListResponse;
  }> {
    console.log('📦 Appel API getProductsByShop pour shopId:', shopId, 'params:', params);
    const response = await api.get(`/products/shop/${shopId}`, { params });
    console.log('📦 Réponse API getProductsByShop:', response.data);
    return response.data;
  },

  // ⭐⭐⭐ getProductsByShopAll AVEC NORMALISATION DES colorVariants ⭐⭐⭐
  async getProductsByShopAll(shopId: number): Promise<StudioProduct[]> {
    console.log('📦 Appel API getProductsByShopAll pour shopId:', shopId);
    try {
      const response = await api.get(`/products/shop/${shopId}/all`);
      console.log('📦 Réponse API getProductsByShopAll:', response.data);
      
      const data = response.data;
      let products: any[] = [];
      
      if (data.products && Array.isArray(data.products)) {
        products = data.products;
      } else if (Array.isArray(data)) {
        products = data;
      } else if (data.items && Array.isArray(data.items)) {
        products = data.items;
      }
      
      // ⭐ Normaliser les produits pour avoir sizes, colors et colorVariants en tableaux
      const normalizedProducts = products.map(p => ({
        ...p,
        sizes: p.sizes || (p.size ? (typeof p.size === 'string' ? p.size.split(',') : p.size) : []),
        colors: p.colors || (p.color ? (typeof p.color === 'string' ? p.color.split(',') : p.color) : []),
        // ⭐ NOUVEAU : normalisation des colorVariants avec sizes
        colorVariants: (p.variants || p.colorVariants || []).map((v: any) => ({
          ...v,
          sizes: v.sizes || v.size || [],   // ⭐ normalisation défensive
        })),
        imageUrl1: p.imageUrl1 || p.imageUrl || null,
        imageUrl2: p.imageUrl2 || null,
        imageUrl3: p.imageUrl3 || null,
      }));
      
      return normalizedProducts;
    } catch (error) {
      console.error('Erreur getProductsByShopAll:', error);
      return [];
    }
  },

  // Créer un produit
  async createProduct(data: CreateProductDto): Promise<ProductResponse> {
    const response = await api.post<ProductResponse>('/products', data);
    return response.data;
  },

  // ⭐⭐⭐ VERSION CORRIGÉE - ORDRE CORRECT DES IMAGES ⭐⭐⭐
  async createProductForShop(shopId: number, data: CreateStudioProduct): Promise<StudioProduct> {
    console.log('📦 createProductForShop - Données reçues:', {
      imageUrl1: data.imageUrl1,
      imageUrl2: data.imageUrl2,
      imageUrl3: data.imageUrl3,
      colorVariants: data.colorVariants,
    });

    // ⭐ Étape 1: Créer le produit avec les URLs d'images (si ce sont des URLs)
    const hasOnlyUrls = (url: string | undefined): boolean => {
      return !!url && !url.startsWith('blob:');
    };
    
    const allImagesAreUrls = 
      (!data.imageUrl1 || hasOnlyUrls(data.imageUrl1)) &&
      (!data.imageUrl2 || hasOnlyUrls(data.imageUrl2)) &&
      (!data.imageUrl3 || hasOnlyUrls(data.imageUrl3));

    if (allImagesAreUrls) {
      // Cas simple: toutes les images sont des URLs, on peut les inclure directement
      const backendData = {
        name: data.name,
        description: data.description || '',
        price: data.price,
        stock: data.stock || 0,
        size: data.sizes?.length ? data.sizes : null,
        color: data.colors?.length ? data.colors : null,
        category: data.category || null,
        shopId: shopId,
        imageUrl: null,
        imageUrl1: data.imageUrl1 || null,
        imageUrl2: data.imageUrl2 || null,
        imageUrl3: data.imageUrl3 || null,
        // ⭐ NOUVEAU : Envoyer les variantes de couleur
        colorVariants: data.colorVariants || [],
      };

      console.log('📤 Création produit avec URLs d\'images:', backendData);
      const response = await api.post<StudioProduct>(`/products/shop/${shopId}`, backendData);
      return response.data;
    }

    // Cas avec blobs: on crée d'abord le produit, puis on upload les images
    const backendData = {
      name: data.name,
      description: data.description || '',
      price: data.price,
      stock: data.stock || 0,
      size: data.sizes?.length ? data.sizes : null,
      color: data.colors?.length ? data.colors : null,
      category: data.category || null,
      shopId: shopId,
      imageUrl: null,
      imageUrl1: null,
      imageUrl2: null,
      imageUrl3: null,
      // ⭐ NOUVEAU : Envoyer les variantes de couleur
      colorVariants: data.colorVariants || [],
    };

    console.log('📤 Création produit (sans images):', backendData);
    const response = await api.post<StudioProduct>(`/products/shop/${shopId}`, backendData);
    const createdProduct = response.data;
    console.log('✅ Produit créé, ID:', createdProduct.id);

    // ⭐⭐⭐ Étape 2: Upload des images dans le BON ORDRE ⭐⭐⭐
    const imagesToUpload: Array<{ url: string; fieldName: string }> = [];
    
    if (data.imageUrl1 && data.imageUrl1.startsWith('blob:')) {
      imagesToUpload.push({ url: data.imageUrl1, fieldName: 'image1' });
    }
    if (data.imageUrl2 && data.imageUrl2.startsWith('blob:')) {
      imagesToUpload.push({ url: data.imageUrl2, fieldName: 'image2' });
    }
    if (data.imageUrl3 && data.imageUrl3.startsWith('blob:')) {
      imagesToUpload.push({ url: data.imageUrl3, fieldName: 'image3' });
    }

    if (imagesToUpload.length > 0) {
      const formData = new FormData();
      formData.append('productId', createdProduct.id.toString());
      
      for (const img of imagesToUpload) {
        try {
          if (img.url) {
            const fetchResponse = await fetch(img.url);
            const blob = await fetchResponse.blob();
            const file = new File([blob], `${img.fieldName}.jpg`, { type: blob.type });
            formData.append(img.fieldName, file);
            console.log(`📤 Ajout image ${img.fieldName}`);
          }
        } catch (error) {
          console.error(`Erreur conversion image ${img.fieldName}:`, error);
        }
      }

      try {
        console.log('📤 Upload des images...');
        await api.post('/products/upload-images', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        console.log('✅ Images uploadées avec succès');
        
        const updated = await api.get<StudioProduct>(`/products/${createdProduct.id}`);
        return updated.data;
      } catch (error) {
        console.error('❌ Erreur upload images:', error);
      }
    }
    
    return createdProduct;
  },

  // Version simplifiée pour le fallback ProductsPanel
  async createProductSimple(shopId: number, data: CreateStudioProduct): Promise<StudioProduct> {
    const backendData = {
      name: data.name,
      description: data.description || '',
      price: data.price,
      stock: data.stock || 0,
      size: data.sizes?.length ? data.sizes : null,
      color: data.colors?.length ? data.colors : null,
      category: data.category || null,
      shopId: shopId,
      imageUrl: null,
      imageUrl1: data.imageUrl1 || null,
      imageUrl2: data.imageUrl2 || null,
      imageUrl3: data.imageUrl3 || null,
      colorVariants: data.colorVariants || [],
    };
    
    const response = await api.post<StudioProduct>(`/products/shop/${shopId}`, backendData);
    return response.data;
  },

  // ⭐⭐⭐ FONCTION CORRIGÉE POUR METTRE À JOUR UN PRODUIT ⭐⭐⭐
  async updateProduct(id: number, data: any): Promise<StudioProduct> {
    console.log('📦 Mise à jour produit:', id);
    console.log('📦 Données reçues pour mise à jour:', JSON.stringify(data, null, 2));
    
    // ⭐ Construire le payload avec le bon format pour le backend
    const payload: any = {
      name: data.name,
      price: data.price,
      category: data.category || 'Non catégorisé',
      description: data.description || '',
      stock: data.stock || 0,
    };
    
    // ⭐ Gérer les tailles - envoyer comme tableau (List<string>)
    if (data.sizes !== undefined) {
      if (Array.isArray(data.sizes)) {
        payload.size = data.sizes;
        console.log('📏 Tailles envoyées (tableau):', payload.size);
      } else if (typeof data.sizes === 'string') {
        payload.size = data.sizes ? data.sizes.split(',') : [];
        console.log('📏 Tailles envoyées (converties):', payload.size);
      }
    } else if (data.size !== undefined) {
      if (Array.isArray(data.size)) {
        payload.size = data.size;
      } else if (typeof data.size === 'string') {
        payload.size = data.size ? data.size.split(',') : [];
      } else {
        payload.size = [];
      }
    }
    
    // ⭐ Gérer les couleurs - envoyer comme tableau (List<string>)
    if (data.colors !== undefined) {
      if (Array.isArray(data.colors)) {
        if (data.colors.length > 0 && typeof data.colors[0] === 'object' && 'value' in data.colors[0]) {
          payload.color = data.colors.map((c: any) => c.value);
          console.log('🎨 Couleurs envoyées (extraites des objets):', payload.color);
        } else {
          payload.color = data.colors;
          console.log('🎨 Couleurs envoyées (tableau direct):', payload.color);
        }
      } else if (typeof data.colors === 'string') {
        payload.color = data.colors ? data.colors.split(',') : [];
        console.log('🎨 Couleurs envoyées (converties):', payload.color);
      }
    } else if (data.color !== undefined) {
      if (Array.isArray(data.color)) {
        payload.color = data.color;
      } else if (typeof data.color === 'string') {
        payload.color = data.color ? data.color.split(',') : [];
      } else {
        payload.color = [];
      }
    }
    
    // ⭐ Gérer les images
    if (data.imageUrl1 !== undefined) payload.imageUrl1 = data.imageUrl1;
    if (data.imageUrl2 !== undefined) payload.imageUrl2 = data.imageUrl2;
    if (data.imageUrl3 !== undefined) payload.imageUrl3 = data.imageUrl3;
    
    // ⭐ NOUVEAU : Gérer les variantes de couleur
    if (data.colorVariants !== undefined) {
      payload.colorVariants = data.colorVariants;
      console.log('🎨 Variantes de couleur envoyées:', payload.colorVariants);
    }
    
    console.log('📤 Payload final envoyé au backend:', JSON.stringify(payload, null, 2));
    
    try {
      const response = await api.post(`/products/update/${id}`, payload);
      console.log('✅ Réponse API mise à jour:', response.data);
      
      const updatedProduct = response.data;
      
      return {
        id: updatedProduct.id,
        name: updatedProduct.name,
        description: updatedProduct.description || '',
        price: updatedProduct.price,
        stock: updatedProduct.stock || 0,
        category: updatedProduct.category || '',
        sizes: updatedProduct.size || updatedProduct.sizes || [],
        colors: updatedProduct.color || updatedProduct.colors || [],
        colorVariants: updatedProduct.variants || updatedProduct.colorVariants || [],
        imageUrl: updatedProduct.imageUrl || updatedProduct.imageUrl1 || '',
        imageUrl1: updatedProduct.imageUrl1 || '',
        imageUrl2: updatedProduct.imageUrl2 || '',
        imageUrl3: updatedProduct.imageUrl3 || '',
        isInStock: (updatedProduct.stock || 0) > 0,
        createdAt: updatedProduct.createdAt,
      };
    } catch (error: any) {
      console.error('❌ Erreur mise à jour produit:');
      console.error('  - Status:', error.response?.status);
      console.error('  - Message:', error.response?.data?.message);
      console.error('  - Errors:', error.response?.data?.errors);
      throw error;
    }
  },

  // Supprimer un produit
  async deleteProduct(id: number): Promise<void> {
    console.log('🗑️ Suppression produit:', id);
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Récupérer les produits en stock
  async getProductsInStock(): Promise<Product[]> {
    const response = await api.get<Product[]>('/products/instock');
    return response.data;
  },

  // Uploader des images
  async uploadImages(data: ProductImageUploadDto): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append('productId', data.productId.toString());
    if (data.image1) formData.append('image1', data.image1);
    if (data.image2) formData.append('image2', data.image2);
    if (data.image3) formData.append('image3', data.image3);

    const response = await api.post<{ message: string }>('/products/upload-images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // ⭐⭐⭐ SUPPRIMER UNE IMAGE - RETOURNE LE PRODUIT MIS À JOUR ⭐⭐⭐
  async deleteImage(productId: number, imageNumber: number): Promise<{ message: string; product?: any }> {
    console.log(`🗑️ Suppression image ${imageNumber} du produit ${productId}`);
    try {
      const response = await api.delete<{ message: string; product?: any }>(
        `/products/${productId}/image/${imageNumber}`
      );
      console.log('✅ Réponse deleteImage:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Erreur deleteImage:', error);
      throw error;
    }
  },

  // Récupérer les images d'un produit
  async getProductImages(productId: number): Promise<{
    productId: number;
    productName: string;
    mainImage: string | null;
    images: string[];
    count: number;
  }> {
    const response = await api.get(`/products/${productId}/images`);
    return response.data;
  },

  // ============ NOUVELLES MÉTHODES POUR LES VARIANTES DE COULEUR ============

  /**
   * Créer ou mettre à jour une variante de couleur
   * ⭐ upsertColorVariant AVEC tableau complet pour sizes ⭐
   */
  async upsertColorVariant(productId: number, variant: Partial<ColorVariant>): Promise<ColorVariant> {
    console.log(`🎨 Upsert variante de couleur pour le produit ${productId}:`, variant);
    
    try {
      const response = await api.post(`/products/${productId}/variants`, {
        color: variant.color,
        customName: variant.customName || null,
        stock: variant.stock || 0,
        sizes: variant.sizes || [],   // ⭐ tableau complet, pas null
      });
      
      const data = response.data;
      console.log('✅ Réponse upsertColorVariant:', data);
      
      // ⭐ normalisation défensive
      return {
        ...data,
        sizes: data.sizes || data.sizes || [],   // ⭐ normalisation défensive
      } as ColorVariant;
    } catch (error) {
      console.error('❌ Erreur upsertColorVariant:', error);
      throw error;
    }
  },

  /**
   * Supprimer une variante de couleur
   */
  async deleteColorVariant(productId: number, color: string): Promise<void> {
    console.log(`🗑️ Suppression variante de couleur "${color}" du produit ${productId}`);
    
    try {
      const safeColor = encodeURIComponent(color);
      await api.delete(`/products/${productId}/variants/${safeColor}`);
      console.log('✅ Variante supprimée avec succès');
    } catch (error) {
      console.error('❌ Erreur deleteColorVariant:', error);
      throw error;
    }
  },

  /**
   * Uploader des images pour une variante de couleur
   */
  async uploadVariantImages(
    productId: number, 
    color: string, 
    files: { image1?: File; image2?: File; image3?: File }
  ): Promise<{ message: string }> {
    console.log(`📤 Upload images pour variante "${color}" du produit ${productId}`);
    
    const formData = new FormData();
    formData.append('productId', productId.toString());
    
    if (files.image1) {
      formData.append('image1', files.image1);
      console.log('📤 Image1 ajoutée:', files.image1.name);
    }
    if (files.image2) {
      formData.append('image2', files.image2);
      console.log('📤 Image2 ajoutée:', files.image2.name);
    }
    if (files.image3) {
      formData.append('image3', files.image3);
      console.log('📤 Image3 ajoutée:', files.image3.name);
    }

    try {
      const safeColor = encodeURIComponent(color);
      const response = await api.post<{ message: string }>(
        `/products/${productId}/variants/${safeColor}/upload-images`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      
      console.log('✅ Images de variante uploadées avec succès');
      return response.data;
    } catch (error) {
      console.error('❌ Erreur uploadVariantImages:', error);
      throw error;
    }
  },

  /**
   * ⭐⭐⭐ NOUVELLE MÉTHODE : Supprimer une image spécifique d'une variante de couleur ⭐⭐⭐
   */
  async deleteVariantImage(productId: number, color: string, imageNumber: 1 | 2 | 3): Promise<ColorVariant> {
    console.log(`🗑️ Suppression image ${imageNumber} de la variante "${color}" du produit ${productId}`);
    
    try {
      const safeColor = encodeURIComponent(color);
      const response = await api.delete<ColorVariant>(
        `/products/${productId}/variants/${safeColor}/image/${imageNumber}`
      );
      
      console.log('✅ Image de variante supprimée avec succès');
      
      return {
        ...response.data,
        sizes: response.data.sizes || response.data.sizes || [],
      } as ColorVariant;
    } catch (error) {
      console.error('❌ Erreur deleteVariantImage:', error);
      throw error;
    }
  },

  /**
   * Récupérer toutes les variantes d'un produit
   */
  async getVariants(productId: number): Promise<ColorVariant[]> {
    console.log(`📦 Récupération des variantes du produit ${productId}`);
    
    try {
      const response = await api.get<ColorVariant[]>(`/products/${productId}/variants`);
      console.log('✅ Variantes récupérées:', response.data.length);
      
      // ⭐ normalisation défensive
      return response.data.map(v => ({
        ...v,
        sizes: v.sizes || v.sizes || [],
      }));
    } catch (error) {
      console.error('❌ Erreur getVariants:', error);
      return [];
    }
  },

  /**
   * Récupérer une variante spécifique d'un produit
   */
  async getVariant(productId: number, color: string): Promise<ColorVariant | null> {
    console.log(`📦 Récupération variante "${color}" du produit ${productId}`);
    
    try {
      const safeColor = encodeURIComponent(color);
      const response = await api.get<ColorVariant>(`/products/${productId}/variants/${safeColor}`);
      console.log('✅ Variante récupérée:', response.data);
      
      // ⭐ normalisation défensive
      return {
        ...response.data,
        sizes: response.data.sizes || response.data.sizes || [],
      };
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log('⚠️ Variante non trouvée');
        return null;
      }
      console.error('❌ Erreur getVariant:', error);
      throw error;
    }
  },
};