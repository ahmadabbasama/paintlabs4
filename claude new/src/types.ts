export interface ProductReview {
  id: string;
  author: string;
  location: string;
  rating: number;
  date: string;
  comment: string;
  paintingId?: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  size: string;
  frame: string;
  priceDelta: number;
  inStock: boolean;
}

export type PaintingCategory = 'bikes' | 'cars' | 'cityscapes' | 'spacescapes' | 'quotes' | 'abstract' | 'landscapes' | 'botanicals' | string;

export interface Painting {
  id: string;
  name: string;
  subtitle: string;
  category: PaintingCategory;
  medium: string; // e.g. "Oil & Palette Knife on Stretched Belgian Linen"
  year: number;
  basePrice: number;
  currency: string;
  image: string;
  secondaryImage?: string;
  tag?: string; // e.g. "Original Oil", "Studio Favorite", "Award Finalist"
  description: string;
  dimensions: string;
  surface: string;
  inStockCount: number;
  leadTime: string;
  rating: number;
  reviewCount: number;
  variants: ProductVariant[];
  reviews: ProductReview[];
  colorFamily?: string[];
}

export interface CustomCommission {
  id: string;
  size: string; // '6 × 6 in Canvas' | '12 × 12 in Canvas' | 'Photo Frame'
  description: string;
  referencePhotoUrl?: string;
  referencePhotoName?: string;
  estimatedPrice: number;
  agreedToTerms: boolean;
  subjectType?: string;
  medium?: string;
  frame?: string;
  colorMood?: string;
  estimatedWeeks?: number;
}

export interface CartItem {
  id: string; // unique cart row id
  painting?: Painting;
  selectedVariant?: ProductVariant;
  customCommission?: CustomCommission;
  selectedColorFamily?: string;
  quantity: number;
  price: number;
}

export interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
}

export interface Order {
  id: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
  promoCode?: string;
  shippingAddress: ShippingAddress;
  shippingMethod: 'eco' | 'express';
  paymentMethod: 'card' | 'apple_pay' | 'cod';
  status: 'confirmed' | 'preparing' | 'in_transit' | 'delivered';
  estimatedDelivery: string;
}

export interface ContactInquiry {
  id: string;
  name: string;
  email: string;
  subject?: string;
  message: string;
  date: string;
}
