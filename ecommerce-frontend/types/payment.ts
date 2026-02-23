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