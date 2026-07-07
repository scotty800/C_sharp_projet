import { User } from './user';
import { Product } from './product';

// ✅ Enum avec statuts numériques ET string pour compatibilité
export enum OrderStatus {
  Pending = 'Pending',
  Processing = 'Processing',
  Shipped = 'Shipped',
  Delivered = 'Delivered',
  Cancelled = 'Cancelled',
  Refunded = 'Refunded',
  ReturnRequested = 'ReturnRequested',
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

// ✅ Mapping statuts numériques <-> string
export const OrderStatusMap = {
  0: OrderStatus.Pending,
  1: OrderStatus.Processing,
  2: OrderStatus.Shipped,
  3: OrderStatus.Delivered,
  4: OrderStatus.Cancelled,
  5: OrderStatus.Refunded,
  6: OrderStatus.ReturnRequested,
} as const;

export const OrderStatusReverseMap: Record<OrderStatus, number> = {
  [OrderStatus.Pending]: 0,
  [OrderStatus.Processing]: 1,
  [OrderStatus.Shipped]: 2,
  [OrderStatus.Delivered]: 3,
  [OrderStatus.Cancelled]: 4,
  [OrderStatus.Refunded]: 5,
  [OrderStatus.ReturnRequested]: 6,
};

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
  paymentMethod: number;
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingCountry: string;
  billingAddress?: string;
  billingCity?: string;
  billingPostalCode?: string;
  billingCountry?: string;
  notes?: string;
  taxAmount?: number;
  shippingCost?: number;
  discountAmount?: number;
}

// ⭐ NOUVEAU — DTO pour le breakdown de livraison par boutique
export interface OrderShopShippingDto {
  shopId: number;
  shopName?: string;
  shippingMethodName: string;
  shippingCost: number;
  subtotal: number;
  minDays: number;   // ⭐ AJOUT
  maxDays: number;   // ⭐ AJOUT
}

// ⭐ MODIFICATION — Ajout de shippingBreakdown
export interface OrderResponseDto {
  id: number;
  orderNumber: string;
  userId: number;
  username: string;
  userEmail?: string;
  status: OrderStatus | string | number;
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
  // ⭐ NOUVEAU — Détail des frais de livraison par boutique
  shippingBreakdown: OrderShopShippingDto[];
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
  status: OrderStatus | number | string;
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