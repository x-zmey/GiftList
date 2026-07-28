import { create } from 'zustand';
import type { User } from '@/types';
import * as api from '@/lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  init: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  init: async () => {
    try {
      const user = await api.getCurrentUser();
      set({ user, initialized: true });
    } catch {
      set({ user: null, initialized: true });
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const user = await api.login(email, password);
      set({ user, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  register: async (name, email, password) => {
    set({ loading: true });
    try {
      const user = await api.register(name, email, password);
      set({ user, loading: false });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: async () => {
    await api.logout();
    set({ user: null });
  },
}));
