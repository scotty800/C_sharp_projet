export interface User {
  id: number;
  username: string;
  email: string;
  role: 'User' | 'Admin';
  createdAt?: string;
  updatedAt?: string;
}

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface UpdateUserRequest {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
}