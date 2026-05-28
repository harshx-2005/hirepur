import { create } from 'zustand';
import apiClient from '../api/client';

export const useProfileStore = create((set, get) => ({
    profile: null,
    isLoading: false,
    error: null,

    fetchProfile: async () => {
        set({ isLoading: true, error: null });
        try {
            const res = await apiClient.get('/profile/me');
            set({ profile: res.data.data, isLoading: false });
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to fetch profile', isLoading: false });
        }
    },

    updateProfile: async (profileData) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.put('/profile/me', profileData);
            set({ profile: { ...get().profile, ...profileData }, isLoading: false });
            return true;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to update profile', isLoading: false });
            return false;
        }
    },

    updateProfilePic: async (profilePicUrl) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.put('/profile/profile-pic', { profile_pic: profilePicUrl });
            set({ isLoading: false });
            return true;
        } catch (err) {
            set({ error: err.response?.data?.message || 'Failed to update profile picture', isLoading: false });
            return false;
        }
    }
}));
