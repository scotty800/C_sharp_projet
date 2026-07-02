import { Product } from './product';

export interface CartItem {
  id: number;
  productId: number;
  productName: string;
  productPrice: number;
  quantity: number;
  totalPrice: number;
  productImage?: string | null;
  stock: number;

  // ⭐ AJOUT — boutique d'origine
  shopId?: number | null;
  shopName?: string | null;
  shopSlug?: string | null;
  shopLogoUrl?: string | null;

  // ⭐ AJOUT — caractéristiques (valeurs possibles)
  size?: string[] | null;
  color?: string[] | null;

  // ⭐ AJOUT — variante sélectionnée
  selectedSize?: string | null;
  selectedColor?: string | null;

  // Conservé pour compatibilité
  product?: Product;
  createdAt?: string;
  updatedAt?: string;
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AddToCartDto {
  productId: number;
  quantity: number;
  // ⭐ AJOUT — variante à ajouter
  size?: string;
  color?: string;
}

export interface UpdateCartItemDto {
  quantity: number;
}

// ⭐ AJOUT — DTO pour mettre à jour la variante d'un article
export interface UpdateCartItemVariantDto {
  size?: string;
  color?: string;
}

export interface CartResponse {
  id: number;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}