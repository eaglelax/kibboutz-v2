// ============== ENUMS ==============

export type Role = 'CLIENT' | 'PRODUCER' | 'DELIVERY' | 'ADMIN';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'CASH_ON_DELIVERY' | 'MOBILE_MONEY' | 'CARD';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type ProductUnit = 'KG' | 'GRAM' | 'UNIT' | 'LITER' | 'TAS' | 'BUNCH';

// ============== UTILISATEURS ==============

export interface User {
  id: string;
  email: string;
  phone?: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: UserStatus;
  createdAt: string;
  updatedAt: string;
  profile?: ProducerProfile;
  addresses?: Address[];
}

export interface ProducerProfile {
  id: string;
  userId: string;
  businessName?: string;
  farmName?: string;
  description?: string;
  location?: string;
  city?: string;
  verified: boolean;
  verifiedAt?: string;
  user?: User;
}

export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  fullAddress?: string;
  city: string;
  country: string;
  quarter?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

// ============== CATALOGUE ==============

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
  children?: Category[];
}

export interface Product {
  id: string;
  producerId: string;
  categoryId: string;
  name: string;
  description: string;
  price: number;
  unit: ProductUnit;
  minQuantity: number;
  stock: number;
  origin?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  images?: ProductImage[];
  category?: Category;
  producer?: {
    id: string;
    firstName: string;
    lastName: string;
    profile?: ProducerProfile;
  };
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  isPrimary: boolean;
}

// ============== PANIER ==============

export interface CartItem {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  product: Product;
}

export interface Cart {
  items: CartItem[];
  subtotal: number;
  itemCount: number;
}

// ============== COMMANDES ==============

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  addressId: string;
  status: OrderStatus;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items?: OrderItem[];
  address?: Address;
  deliveryAddress?: Address;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unitPrice: number;
  subtotal: number;
  product?: Product;
}

// ============== API ==============

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// ============== UTILS ==============

export const UNIT_LABELS: Record<ProductUnit, string> = {
  KG: 'Kg',
  GRAM: 'g',
  UNIT: 'Unité',
  LITER: 'L',
  TAS: 'Tas',
  BUNCH: 'Botte',
};

export const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  READY: 'Prête',
  IN_DELIVERY: 'En livraison',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
};

export const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: '#fbbf24',
  CONFIRMED: '#3b82f6',
  PREPARING: '#8b5cf6',
  READY: '#6366f1',
  IN_DELIVERY: '#f97316',
  DELIVERED: '#22c55e',
  CANCELLED: '#ef4444',
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH_ON_DELIVERY: 'Paiement à la livraison',
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Carte bancaire',
};
