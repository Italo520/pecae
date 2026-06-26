import { QueryClient } from '@tanstack/react-query';

// QueryClient singleton exportado e compartilhado por toda a aplicação
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,  // 5 minutos: evita re-fetches frequentes
      gcTime: 1000 * 60 * 10,    // 10 minutos: mantém cache em memória
      refetchOnWindowFocus: false, // Não re-fetcha ao focar janela (reduz requests)
    },
  },
});
