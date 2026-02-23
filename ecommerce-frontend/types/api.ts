export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  totalPages: number;
  currentPage: number;
  totalCount: number;
  pageSize: number;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProductFilterParams extends PaginationParams {
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  inStock?: boolean;
}

export interface ShopFilterParams extends PaginationParams {
  category?: string;
  minRating?: number;
}