import { create } from 'zustand';
import { User } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;

  // Actions
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role?: 'CLIENT' | 'PRODUCER';
  }) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: false,
  isAuthenticated: false,
  isInitialized: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await api.login(email, password);
      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
        });
      } else {
        throw new Error(response.error || 'Erreur de connexion');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (data) => {
    set({ isLoading: true });
    try {
      const response = await api.register(data);
      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
        });
      } else {
        throw new Error(response.error || 'Erreur d\'inscription');
      }
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    await api.logout();
    set({
      user: null,
      isAuthenticated: false,
    });
  },

  initialize: async () => {
    const token = await api.getToken();
    if (token) {
      try {
        await get().fetchUser();
      } catch {
        await api.clearToken();
      }
    }
    set({ isInitialized: true });
  },

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const response = await api.getMe();
      if (response.success && response.data) {
        set({ user: response.data, isAuthenticated: true });
      } else {
        throw new Error('User not found');
      }
    } catch {
      set({ user: null, isAuthenticated: false });
      throw new Error('Failed to fetch user');
    } finally {
      set({ isLoading: false });
    }
  },
}));
