'use client';

import React, { useEffect, useState } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';
import { useAuthStore } from '../store/auth-store';
import axios from 'axios';
import { ThemeProvider } from 'next-themes';

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

  // Não bloqueamos a renderização de 'children' no servidor nem no cliente inicial
  // para permitir SSR e SEO. Qualquer carregamento de sessão deve acontecer em background.
  return <>{children}</>;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={true}>
      <QueryClientProvider client={queryClient}>
        <AuthInitializer>
          {children}
        </AuthInitializer>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

