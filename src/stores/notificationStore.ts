import { create } from 'zustand';
import type { Notification } from '@/types';
import * as api from '@/lib/api';

interface NotificationState {
  notifications: Notification[];
  loading: boolean;
  fetch: (userId: string) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: (userId: string) => Promise<void>;
  unreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  loading: false,

  fetch: async (userId) => {
    set({ loading: true });
    const notifications = await api.getNotifications(userId);
    set({ notifications, loading: false });
  },

  markRead: async (id) => {
    await api.markNotificationRead(id);
    set({ notifications: get().notifications.map((n) => n.id === id ? { ...n, read: true } : n) });
  },

  markAllRead: async (userId) => {
    await api.markAllNotificationsRead(userId);
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })) });
  },

  unreadCount: () => get().notifications.filter((n) => !n.read).length,
}));
