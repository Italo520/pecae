import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserPublic } from '@pecae/shared';

interface AuthState {
  user: UserPublic | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserPublic, token: string) => void;
  updateToken: (token: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, accessToken: token, isAuthenticated: true }),
      
      updateToken: (token) => set({ accessToken: token, isAuthenticated: true }),
      
      clearAuth: () => set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'pecae-web-auth',
      // Persist ONLY the user. The access token should NOT be in localStorage.
      partialize: (state) => ({ user: state.user }),
    }
  )
);
