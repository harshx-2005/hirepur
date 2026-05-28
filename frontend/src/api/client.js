import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach bearer token dynamically
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Seamlessly refresh tokens on 401 authorization failures
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        // Prevent infinite loops and only trigger refresh if a 401 status is returned
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refreshToken = useAuthStore.getState().refreshToken;
            
            if (refreshToken) {
                try {
                    console.log('🔄 Axios Interceptor: Attempting token refresh...');
                    const res = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
                    
                    if (res.data.success) {
                        const newAccessToken = res.data.token;
                        
                        // Update state store
                        useAuthStore.getState().loginUser(
                            useAuthStore.getState().user,
                            newAccessToken,
                            refreshToken
                        );
                        
                        // Update header and retry request
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return apiClient(originalRequest);
                    }
                } catch (refreshError) {
                    console.error('❌ Axios Interceptor: Session refresh failed. Logging out...', refreshError);
                    useAuthStore.getState().logout();
                }
            }
        }
        
        return Promise.reject(error);
    }
);

export default apiClient;
