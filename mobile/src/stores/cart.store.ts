import { create } from 'zustand';
import { Cart } from '../types';
import api from '../services/api';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;

  // Actions
  setCart: (cart: Cart | null) => void;
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  setCart: (cart) => set({ cart }),

  fetchCart: async () => {
    set({ isLoading: true });
    try {
      const response = await api.getCart();
      if (response.success && response.data) {
        set({ cart: response.data });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (productId, quantity) => {
    set({ isLoading: true });
    try {
      const response = await api.addToCart(productId, quantity);
      if (response.success && response.data) {
        set({ cart: response.data });
      } else {
        throw new Error(response.error || 'Erreur lors de l\'ajout au panier');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    set({ isLoading: true });
    try {
      const response = await api.updateCartItem(itemId, quantity);
      if (response.success && response.data) {
        set({ cart: response.data });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (itemId) => {
    set({ isLoading: true });
    try {
      await api.removeFromCart(itemId);
      await get().fetchCart();
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      await api.clearCart();
      set({ cart: { items: [], subtotal: 0, itemCount: 0 } });
    } finally {
      set({ isLoading: false });
    }
  },
}));
