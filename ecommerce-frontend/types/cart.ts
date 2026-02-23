import { Product } from './product';

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: Product;
  createdAt: string;
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
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface CartResponse {
  id: number;
  items: CartItem[];
  totalAmount: number;
  itemCount: number;
}