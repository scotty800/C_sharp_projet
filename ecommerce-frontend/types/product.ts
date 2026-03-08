import { PaginationParams } from "./api";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  size?: string;
  color?: string;
  category: string;
  imageUrl?: string | null;
  imageUrl1?: string | null;
  imageUrl2?: string | null;
  imageUrl3?: string | null;
  shopId?: number | null;
  createdAt: string;
  updatedAt?: string;
  shop?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  size?: string;
  color?: string;
  category: string;
  imageUrl?: string | null;
  shopId?: number | null;
  createdAt: string;
}

export interface CreateProductDto {
  name: string;
  description: string;
  price: number;
  stock: number;
  size?: string;
  color?: string;
  category: string;
  shopId?: number;
}

export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  stock?: number;
  size?: string;
  color?: string;
  category?: string;
}

export interface ProductListResponse {
  data: ProductResponse[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export interface ProductImageUploadDto {
  productId: number;
  image1?: File;
  image2?: File;
  image3?: File;
}
export interface ProductFilterParams extends PaginationParams {
  minPrice?: number;
  maxPrice?: number;
  category?: string;  // ← DÉJÀ PRÉSENT ?
  inStock?: boolean;
}