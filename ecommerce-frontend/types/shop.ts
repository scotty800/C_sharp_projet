// types/shop.ts
import { User } from './user';
import { Product } from './product';

export interface Shop {
  id: number;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  themeColor: string;
  backgroundColor: string;
  textColor: string;
  email: string | null;
  phone: string | null;
  productCount: number;
  createdAt: string;
  updatedAt?: string;
  ownerId: number;
  owner?: User;
  products?: Product[];
}

export interface ShopResponse {
  id: number;
  name: string;
  slug: string;
  description: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  productCount: number;
  ownerId: number;
  username?: string;
  // Ces propriétés peuvent venir de l'API ou être optionnelles
  email?: string | null;
  phone?: string | null;
  createdAt?: string;
}

export interface CreateShopRequest {
  name: string;
  description: string;
  themeColor?: string;
  backgroundColor?: string;
  textColor?: string;
  email?: string;
  phone?: string;
}

export interface UpdateShopRequest {
  name?: string;
  description?: string;
  themeColor?: string;
  backgroundColor?: string;
  textColor?: string;
  email?: string;
  phone?: string;
}

export interface ShopListResponse {
  data: ShopResponse[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
}

export const isShopOwner = (userId: number | undefined, shop: Shop | ShopResponse | null): boolean => {
  if (!userId || !shop) return false;
  return shop.ownerId === userId;
};