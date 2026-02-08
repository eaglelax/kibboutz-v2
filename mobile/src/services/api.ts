import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_URL } from '../constants';
import {
  ApiResponse,
  AuthResponse,
  User,
  Category,
  Product,
  ProductImage,
  Cart,
  Order,
  Address,
} from '../types';

const TOKEN_KEY = 'auth_token';

// Fallback storage pour le web (SecureStore ne marche pas sur web)
const tokenStorage = {
  async get(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return SecureStore.getItemAsync(key);
  },
  async set(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    await SecureStore.setItemAsync(key, value);
  },
  async remove(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    await SecureStore.deleteItemAsync(key);
  },
};

class ApiClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    this.client.interceptors.request.use(async (config) => {
      const token = this.token || await this.getStoredToken();
      if (token) {
        this.token = token;
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
          await this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  private async getStoredToken(): Promise<string | null> {
    try {
      return await tokenStorage.get(TOKEN_KEY);
    } catch {
      return null;
    }
  }

  async setToken(token: string | null): Promise<void> {
    this.token = token;
    try {
      if (token) {
        await tokenStorage.set(TOKEN_KEY, token);
      } else {
        await tokenStorage.remove(TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }

  async clearToken(): Promise<void> {
    this.token = null;
    try {
      await tokenStorage.remove(TOKEN_KEY);
    } catch (error) {
      console.error('Error clearing token:', error);
    }
  }

  async getToken(): Promise<string | null> {
    if (!this.token) {
      this.token = await this.getStoredToken();
    }
    return this.token;
  }

  // ============== AUTH ==============

  async register(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: 'CLIENT' | 'PRODUCER';
  }): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/register', data);
    if (response.data.success && response.data.data) {
      await this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async login(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const response = await this.client.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    if (response.data.success && response.data.data) {
      await this.setToken(response.data.data.token);
    }
    return response.data;
  }

  async logout(): Promise<void> {
    await this.clearToken();
  }

  async getMe(): Promise<ApiResponse<User>> {
    const response = await this.client.get<ApiResponse<User>>('/auth/me');
    return response.data;
  }

  async updateProfile(data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.put<ApiResponse<User>>('/auth/profile', data);
    return response.data;
  }

  // ============== CATEGORIES ==============

  async getCategories(): Promise<ApiResponse<Category[]>> {
    const response = await this.client.get<ApiResponse<Category[]>>('/categories');
    return response.data;
  }

  async getCategory(id: string): Promise<ApiResponse<Category>> {
    const response = await this.client.get<ApiResponse<Category>>(`/categories/${id}`);
    return response.data;
  }

  // ============== PRODUCTS ==============

  async getProducts(params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
  }): Promise<ApiResponse<Product[]>> {
    const response = await this.client.get<ApiResponse<Product[]>>('/products', { params });
    return response.data;
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await this.client.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  }

  // ============== PRODUCER PRODUCTS ==============

  async getMyProducts(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Product[]>> {
    const response = await this.client.get<ApiResponse<Product[]>>('/products/producer/me', { params });
    return response.data;
  }

  async createProduct(data: {
    name: string;
    description: string;
    price: number;
    unit: string;
    categoryId: string;
    stock: number;
    minQuantity?: number;
    origin?: string;
  }): Promise<ApiResponse<Product>> {
    const response = await this.client.post<ApiResponse<Product>>('/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<ApiResponse<Product>> {
    const response = await this.client.put<ApiResponse<Product>>(`/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/products/${id}`);
    return response.data;
  }

  async addProductImage(productId: string, data: { url: string; isPrimary?: boolean }): Promise<ApiResponse<ProductImage>> {
    const response = await this.client.post<ApiResponse<ProductImage>>(`/products/${productId}/images`, data);
    return response.data;
  }

  async deleteProductImage(productId: string, imageId: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/products/${productId}/images/${imageId}`);
    return response.data;
  }

  async uploadImage(uri: string): Promise<ApiResponse<{ url: string }>> {
    const formData = new FormData();
    const filename = uri.split('/').pop() || 'image.jpg';
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1] : 'jpeg';
    const type = `image/${ext}`;

    if (Platform.OS === 'web') {
      // Sur web, convertir le data URI ou blob URL en File
      const fetchRes = await fetch(uri);
      const blob = await fetchRes.blob();
      formData.append('image', blob, filename);
    } else {
      formData.append('image', { uri, name: filename, type } as any);
    }

    const response = await this.client.post<ApiResponse<{ url: string }>>('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  // ============== CART ==============

  async getCart(): Promise<ApiResponse<Cart>> {
    const response = await this.client.get<ApiResponse<Cart>>('/cart');
    return response.data;
  }

  async addToCart(productId: string, quantity: number): Promise<ApiResponse<Cart>> {
    const response = await this.client.post<ApiResponse<Cart>>('/cart', {
      productId,
      quantity,
    });
    return response.data;
  }

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<Cart>> {
    const response = await this.client.put<ApiResponse<Cart>>(`/cart/${itemId}`, {
      quantity,
    });
    return response.data;
  }

  async removeFromCart(itemId: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/cart/${itemId}`);
    return response.data;
  }

  async clearCart(): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>('/cart');
    return response.data;
  }

  // ============== ORDERS ==============

  async createOrder(data: {
    addressId: string;
    notes?: string;
  }): Promise<ApiResponse<Order>> {
    const response = await this.client.post<ApiResponse<Order>>('/orders', data);
    return response.data;
  }

  async getMyOrders(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<Order[]>> {
    const response = await this.client.get<ApiResponse<Order[]>>('/orders/me', { params });
    return response.data;
  }

  async getProducerOrders(params?: {
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<Order[]>> {
    const response = await this.client.get<ApiResponse<Order[]>>('/orders/producer/orders', { params });
    return response.data;
  }

  async getOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await this.client.get<ApiResponse<Order>>(`/orders/${id}`);
    return response.data;
  }

  async cancelOrder(id: string): Promise<ApiResponse<Order>> {
    const response = await this.client.put<ApiResponse<Order>>(`/orders/${id}/status`, {
      status: 'CANCELLED',
    });
    return response.data;
  }

  async updateOrderStatus(id: string, status: string): Promise<ApiResponse<Order>> {
    const response = await this.client.put<ApiResponse<Order>>(`/orders/${id}/status`, {
      status,
    });
    return response.data;
  }

  // ============== ADDRESSES ==============

  async getAddresses(): Promise<ApiResponse<Address[]>> {
    const response = await this.client.get<ApiResponse<Address[]>>('/addresses');
    return response.data;
  }

  async createAddress(data: {
    label: string;
    fullAddress: string;
    city: string;
    quarter?: string;
    isDefault?: boolean;
  }): Promise<ApiResponse<Address>> {
    const response = await this.client.post<ApiResponse<Address>>('/addresses', data);
    return response.data;
  }

  async updateAddress(id: string, data: Partial<Address>): Promise<ApiResponse<Address>> {
    const response = await this.client.put<ApiResponse<Address>>(`/addresses/${id}`, data);
    return response.data;
  }

  async deleteAddress(id: string): Promise<ApiResponse> {
    const response = await this.client.delete<ApiResponse>(`/addresses/${id}`);
    return response.data;
  }

  async setDefaultAddress(id: string): Promise<ApiResponse> {
    const response = await this.client.put<ApiResponse>(`/addresses/${id}/default`);
    return response.data;
  }
}

// API réelle
export const api = new ApiClient();
export default api;

// MODE MOCK : utilise des données locales (pas besoin d'API)
// import { mockApi } from './mockApi';
// export const api = mockApi;
// export default api;
