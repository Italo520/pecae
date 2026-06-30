import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPublic } from '@pecae/shared';

interface AuthState {
  user: UserPublic | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  setAuth: (user: UserPublic, token: string) => void;
  updateToken: (token: string) => void;
  logout: () => void;
  setInitialized: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialized: false,

      setAuth: (user, token) => set({ user, accessToken: token, isAuthenticated: true, isInitialized: true }),
      
      updateToken: (token) => set({ accessToken: token, isAuthenticated: true, isInitialized: true }),
      
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false, isInitialized: true }),
      
      setInitialized: (val) => set({ isInitialized: val }),
    }),
    {
      name: 'pecae-web-auth',
      // Persist ONLY the user. Do not persist isInitialized or accessToken.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
