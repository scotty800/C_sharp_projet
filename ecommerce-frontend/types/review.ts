import { User } from './user';
import { Product } from './product';

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt?: string;
  user?: User;
  product?: Product;
}

export interface CreateReviewDto {
  productId: number;
  rating: number;
  comment: string;
}

export interface UpdateReviewDto {
  rating?: number;
  comment?: string;
}

export interface ReviewResponse {
  id: number;
  userId: number;
  username: string;
  productId: number;
  productName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ProductRating {
  average: number;
  count: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
}