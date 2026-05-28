import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const useAuthStore = create((set, get) => ({
    user: null,
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    isCheckingAuth: true,
    
    loginUser: (userData, accessToken, refreshToken) => {
        localStorage.setItem('token', accessToken);
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
        set({ 
            user: userData, 
            token: accessToken, 
            refreshToken: refreshToken || get().refreshToken, 
            isAuthenticated: true 
        });
    },
    
    checkAuth: async () => {
        set({ isCheckingAuth: true });
        const token = localStorage.getItem('token');
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!token) {
            set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isCheckingAuth: false });
            return;
        }
        
        try {
            const res = await axios({
                method: 'get',
                url: `${API_URL}/auth/me`,
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.data.success) {
                set({ 
                    user: res.data.user, 
                    token, 
                    refreshToken, 
                    isAuthenticated: true, 
                    isCheckingAuth: false 
                });
            }
        } catch (error) {
            const status = error.response?.status;
            
            // If token expired (401/403) and we have a refresh token, attempt refreshing
            if ((status === 401 || status === 403) && refreshToken) {
                try {
                    console.log('🔄 Access token expired. Attempting session refresh...');
                    const refreshRes = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
                    
                    if (refreshRes.data.success) {
                        const newAccessToken = refreshRes.data.token;
                        localStorage.setItem('token', newAccessToken);
                        
                        // Retry loading user details
                        const retryRes = await axios({
                            method: 'get',
                            url: `${API_URL}/auth/me`,
                            headers: { Authorization: `Bearer ${newAccessToken}` }
                        });
                        
                        if (retryRes.data.success) {
                            set({
                                user: retryRes.data.user,
                                token: newAccessToken,
                                refreshToken,
                                isAuthenticated: true,
                                isCheckingAuth: false
                            });
                            return;
                        }
                    }
                } catch (refreshErr) {
                    console.error('❌ Session refresh failed:', refreshErr);
                }
            }
            
            // Clear storage if both failed
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isCheckingAuth: false });
        }
    },
    
    logout: async () => {
        const rToken = get().refreshToken;
        try {
            if (rToken) {
                await axios.post(`${API_URL}/auth/logout`, { refreshToken: rToken });
            }
        } catch (err) {
            console.error('Logout API call failed:', err);
        }
        
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({ user: null, token: null, refreshToken: null, isAuthenticated: false });
    },
    
    setUser: (userData) => set({ user: userData, isAuthenticated: true }),
}));
