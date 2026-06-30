'use client';

import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { useAuthStore } from '../store/auth-store';
import axios from 'axios';

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const { user, accessToken, isInitialized, updateToken, logout, setInitialized } = useAuthStore();
  const [hydrated, setHydrated] = useState(false);

  // Aguarda a reidratação do Zustand do localStorage terminar
  useEffect(() => {
    const hasHydrated = useAuthStore.persist.hasHydrated();
    if (hasHydrated) {
      setHydrated(true);
    } else {
      const unsub = useAuthStore.persist.onFinishHydration(() => {
        setHydrated(true);
      });
      return () => unsub();
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    async function initializeAuth() {
      if (user && !accessToken) {
        try {
          // Chamada para a rota de proxy do Next.js que encaminha o HttpOnly refresh_token para o backend Java
          const res = await axios.post('/api/auth/refresh');
          const newToken = res.data.accessToken;
          updateToken(newToken);
        } catch (error) {
          console.error('Falha ao restaurar sessão silenciosamente no reload:', error);
          logout(); // Limpa estado obsoleto do localStorage
        }
      } else {
        setInitialized(true);
      }
    }
    initializeAuth();
  }, [hydrated, user, accessToken, updateToken, logout, setInitialized]);

  // Se o Zustand ainda não hidratou ou o usuário está no localStorage mas o token ainda não carregou do refresh silencioso, 
  // exibe um indicador de carregamento rápido para evitar renderização de layouts protegidos sem token.
  if (!hydrated || (!isInitialized && user && !accessToken)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--color-surface)]">
        <div className="w-8 h-8 border-2 border-[var(--color-primary)] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        {children}
      </AuthInitializer>
    </QueryClientProvider>
  );
}

