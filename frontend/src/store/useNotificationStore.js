import { create } from 'zustand';
import apiClient from '../api/client';

export const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    loading: false,

    fetchNotifications: async () => {
        set({ loading: true });
        try {
            const res = await apiClient.get('/notifications');
            if (res.data.success) {
                set({ 
                    notifications: res.data.data, 
                    unreadCount: res.data.unread_count 
                });
            }
        } catch (error) {
            console.error('Failed to load notifications:', error);
        } finally {
            set({ loading: false });
        }
    },

    markAsRead: async (id) => {
        try {
            const res = await apiClient.put(`/notifications/${id}/read`);
            if (res.data.success) {
                set(state => ({
                    notifications: state.notifications.map(n => 
                        n.id === id ? { ...n, is_read: 1 } : n
                    ),
                    unreadCount: Math.max(0, state.unreadCount - 1)
                }));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    },

    markAllAsRead: async () => {
        try {
            const res = await apiClient.put('/notifications/read-all');
            if (res.data.success) {
                set(state => ({
                    notifications: state.notifications.map(n => ({ ...n, is_read: 1 })),
                    unreadCount: 0
                }));
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    },

    addNotification: (notif) => {
        set(state => ({
            notifications: [notif, ...state.notifications],
            unreadCount: state.unreadCount + 1
        }));
    }
}));
