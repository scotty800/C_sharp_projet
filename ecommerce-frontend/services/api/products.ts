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

export const productService = {
  // Récupérer tous les produits avec pagination et filtres
  async getProducts(params?: ProductFilterParams): Promise<ProductListResponse> {
    const response = await api.get<ProductListResponse>('/products/paged', { params });
    return response.data;
  },

  // Récupérer un produit par ID
  async getProductById(id: number): Promise<Product> {
    const response = await api.get<Product>(`/products/${id}`);
    return response.data;
  },

  // Récupérer les produits d'une boutique
  async getProductsByShop(
    shopId: number, 
    params?: Omit<ProductFilterParams, 'category'>
  ): Promise<{
    shop: { id: number; name: string; slug: string; productCount: number };
    products: ProductListResponse;
  }> {
    const response = await api.get(`/products/shop/${shopId}`, { params });
    return response.data;
  },

  // Créer un produit
  async createProduct(data: CreateProductDto): Promise<ProductResponse> {
    const response = await api.post<ProductResponse>('/products', data);
    return response.data;
  },

  // Créer un produit pour une boutique spécifique
  async createProductForShop(shopId: number, data: CreateProductDto): Promise<ProductResponse> {
    const response = await api.post<ProductResponse>(`/products/shop/${shopId}`, data);
    return response.data;
  },

  // Mettre à jour un produit
  async updateProduct(id: number, data: UpdateProductDto): Promise<void> {
    await api.put(`/products/${id}`, data);
  },

  // Supprimer un produit
  async deleteProduct(id: number): Promise<void> {
    await api.delete(`/products/${id}`);
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

  // Supprimer une image
  async deleteImage(productId: number, imageNumber: number): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(`/products/${productId}/image/${imageNumber}`);
    return response.data;
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
};