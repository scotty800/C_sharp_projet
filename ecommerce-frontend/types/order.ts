import { User } from './user';
import { Product } from './product';

export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Paid = 'Paid',
  Failed = 'Failed',
  Refunded = 'Refunded'
}

export enum PaymentMethod {
  Card = 'Card',
  PayPal = 'PayPal',
  BankTransfer = 'BankTransfer'
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isReviewed: boolean;
  product?: Product;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  user?: User;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  
  // Montants
  subtotal: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  totalAmount: number;
  finalAmount: number;
  
  // Adresses
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
  
  // Dates
  createdAt: string;
  updatedAt?: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  
  // Tracking
  trackingNumber?: string;
  
  // Relations
  items: OrderItem[];
}

export interface CreateOrderDto {
  paymentMethod: PaymentMethod;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  billingAddress?: string;
  billingCity?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  notes?: string;
  // ✅ Champs optionnels ajoutés
  taxAmount?: number;
  shippingCost?: number;
  discountAmount?: number;
}

export interface OrderResponseDto {
  id: number;
  orderNumber: string;
  userId: number;
  username: string;
  userEmail?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentIntentId?: string;
  totalAmount: number;
  taxAmount: number;
  shippingCost: number;
  discountAmount: number;
  finalAmount: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  billingAddress: string;
  billingCity: string;
  billingPostalCode: string;
  billingCountry: string;
  trackingNumber?: string;
  createdAt: string;
  paidAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  items: OrderItemDto[];
}

export interface OrderItemDto {
  id: number;
  productId: number;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  shopId?: number;
  shopName?: string;
  isReviewed: boolean;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
}

export interface CreatePaymentIntentDto {
  orderId: number;
}

export interface ConfirmPaymentDto {
  orderId: number;
  paymentIntentId: string;
}

export interface RefundRequestDto {
  amount?: number;
  reason?: string;
}

export interface PaymentIntentResponseDto {
  id: string;
  clientSecret: string;
  amount: number;
  currency: string;
  status: string;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: string;
  clientSecret: string;
  metadata?: Record<string, string>;
}