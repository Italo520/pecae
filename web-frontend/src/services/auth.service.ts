import axios from 'axios';
import { useAuthStore } from '@/store/auth-store';
import { UserPublic } from '@pecae/shared';

// This is the main Axios instance that points to the Java Backend
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject the access token from Zustand into requests
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle 401 Unauthorized and automatically refresh the token
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Call the Next.js API Route proxy to refresh token via HttpOnly cookie
        // Note: we use standard axios or fetch here to hit the NEXT.js server, not the backend directly!
        const refreshResponse = await axios.post('/api/auth/refresh');
        
        const { accessToken } = refreshResponse.data;
        
        // Update the token in Zustand
        useAuthStore.getState().updateToken(accessToken);
        
        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        // If refresh fails, user must log in again
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// --- Auth Service Methods ---

export const authService = {
  async login(data: any): Promise<{ user: UserPublic; accessToken: string }> {
    // Calls Next.js proxy route to get HttpOnly cookie
    const response = await axios.post('/api/auth/login', data);
    const { user, accessToken } = response.data;
    useAuthStore.getState().setAuth(user, accessToken);
    return response.data;
  },

  async register(data: any): Promise<{ user: UserPublic; accessToken: string }> {
    // Calls Next.js proxy route to get HttpOnly cookie
    const response = await axios.post('/api/auth/register', data);
    const { user, accessToken } = response.data;
    useAuthStore.getState().setAuth(user, accessToken);
    return response.data;
  },

  async logout(): Promise<void> {
    try {
      // Calls Next.js proxy route to clear HttpOnly cookie
      await axios.post('/api/auth/logout');
    } catch (error) {
      console.error('Error during logout API call', error);
    } finally {
      useAuthStore.getState().logout();
    }
  },

  async getProfile(): Promise<UserPublic> {
    // Calls backend directly using apiClient (which injects the Bearer token)
    const response = await apiClient.get('/users/me');
    return response.data;
  },

  async forgotPassword(data: { email: string }): Promise<void> {
    await apiClient.post('/auth/forgot-password', data);
  },

  async resetPassword(data: { token: string; password: string }): Promise<void> {
    await apiClient.post('/auth/reset-password', data);
  },

  async sendOtp(data: { phone: string }): Promise<void> {
    await apiClient.post('/auth/phone/send-otp', data);
  },

  async otpLogin(data: { phone: string; code: string }): Promise<{ user: UserPublic; accessToken: string }> {
    // Calls Next.js proxy route to get HttpOnly cookie
    const response = await axios.post('/api/auth/otp-login', data);
    const { user, accessToken } = response.data;
    useAuthStore.getState().setAuth(user, accessToken);
    return response.data;
  },

  async verifyEmail(data: { code: string }): Promise<void> {
    await apiClient.post('/auth/verify-email', data);
  }
};
