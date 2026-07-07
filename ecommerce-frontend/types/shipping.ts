export interface ShippingMethod {
  id: number;
  shopId: number;
  name: string;
  price: number;
  freeThreshold?: number | null;
  minDays: number;
  maxDays: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface UpsertShippingMethodDto {
  id?: number;
  name: string;
  price: number;
  freeThreshold?: number | null;
  minDays: number;
  maxDays: number;
  isDefault: boolean;
  isActive: boolean;
}

export interface ShopShippingBreakdown {
  shopId: number;
  shopName: string;
  subtotal: number;
  shippingMethodName: string;
  shippingCost: number;
  freeThreshold?: number | null;
  progressTowardFree?: number | null;
  hasShippingConfigured: boolean;
  minDays: number;   // ⭐ AJOUT
  maxDays: number;   // ⭐ AJOUT
}

export interface CartShippingSummary {
  breakdown: ShopShippingBreakdown[];
  totalShipping: number;
  allShopsConfigured: boolean;
}