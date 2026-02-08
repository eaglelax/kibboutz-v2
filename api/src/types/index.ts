import { Request } from 'express';
import { User } from '../db/schema';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'CLIENT' | 'PRODUCER' | 'DELIVERY' | 'ADMIN';
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export type Role = 'CLIENT' | 'PRODUCER' | 'DELIVERY' | 'ADMIN';
export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'IN_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentMethod = 'COD' | 'MOBILE_MONEY' | 'WALLET';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type ProductUnit = 'KG' | 'GRAM' | 'UNIT' | 'LITER' | 'TAS' | 'BUNCH';
