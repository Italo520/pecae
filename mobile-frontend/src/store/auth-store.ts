import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import { queryClient } from '../lib/queryClient';
import Constants from 'expo-constants';
import { logger } from '../utils/logger';

interface User {
  id: string;
  email: string;
  name?: string;
  type?: string;
  role?: string;
  hasProfile?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  updateToken: (accessToken: string, refreshToken: string) => Promise<void>;
  clearAuth: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

const TOKEN_KEY = 'pecae_auth_token';
const REFRESH_TOKEN_KEY = 'pecae_refresh_token';
const USER_KEY = 'pecae_user_data';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: async (user, accessToken, refreshToken) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
      
      set({ user, token: accessToken, refreshToken, isAuthenticated: true, isLoading: false });

      // Registrar o Push Token do dispositivo
      try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus === 'granted') {
          const token = (await Notifications.getExpoPushTokenAsync()).data;
          const API_URL = process.env.EXPO_PUBLIC_API_URL || Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000/api/v1';
          await axios.post(`${API_URL}/users/push-token`, {
            token,
            platform: Platform.OS,
          }, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          logger.log('[AuthStore] Push token registered successfully');
        }
      } catch (pushErr) {
        logger.error('[AuthStore] Failed to register push token:', pushErr);
      }
    } catch (error) {
      logger.error('Error saving auth state:', error);
    }
  },

  updateToken: async (accessToken, refreshToken) => {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      
      set({ token: accessToken, refreshToken });
    } catch (error) {
      logger.error('Error updating tokens:', error);
    }
  },

  clearAuth: async () => {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
      
      queryClient.clear(); // Clear React Query cache!
      set({ user: null, token: null, refreshToken: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      logger.error('Error clearing auth state:', error);
    }
  },

  initializeAuth: async () => {
    // Evita re-inicialização e flashes de loading se já estiver logado
    const state = useAuthStore.getState();
    if (state.isAuthenticated && state.user && state.token) {
      logger.log('[AuthStore] ℹ️ Auth already initialized, skipping...');
      return;
    }
    
    logger.log('[AuthStore] 🔄 Initializing Auth...');
    set({ isLoading: true });

    try {
      let token = null;
      let refreshToken = null;
      let userData = null;

      token = await SecureStore.getItemAsync(TOKEN_KEY);
      refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      userData = await SecureStore.getItemAsync(USER_KEY);

      logger.log(`[AuthStore] 🔍 Persistence: token=${!!token}, user=${!!userData}`);

      if (token && userData && userData !== 'undefined' && userData !== 'null') {
        try {
          const parsedUser = JSON.parse(userData);
          set({ 
            user: parsedUser, 
            token, 
            refreshToken,
            isAuthenticated: true, 
            isLoading: false 
          });
          logger.log('[AuthStore] ✅ Session restored:', parsedUser.email);
        } catch (e) {
          logger.error('[AuthStore] ❌ Error parsing user data:', e);
          set({ isLoading: false, isAuthenticated: false });
        }
      } else {
        logger.log('[AuthStore] ℹ️ No session found in storage');
        set({ isLoading: false, isAuthenticated: false });
      }
    } catch (error) {
      logger.error('[AuthStore] 🚨 Critical error during auth initialization:', error);
      set({ isLoading: false, isAuthenticated: false });
    }
  },
}));

