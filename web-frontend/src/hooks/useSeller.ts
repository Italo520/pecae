import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';

export interface SellerProfile {
  id: string;
  name?: string;
  nome?: string;
  phone?: string;
  telefone?: string;
  bio?: string;
  biografia?: string;
  logoUrl?: string;
  urlLogo?: string;
  bannerUrl?: string;
  urlBanner?: string;
}

export const useSeller = () => {
  const queryClient = useQueryClient();
  const { accessToken, user } = useAuthStore();

  // Moderadores e Admins nunca têm perfil de vendedor — evita chamadas 404
  const userType = (user?.type as string) || ((user as any)?.role as string) || '';
  const isModeratorOrAdmin = userType === 'MODERATOR' || userType === 'MODERADOR' || userType === 'ADMIN';

  const getSellerProfile = useQuery({
    queryKey: ['seller', 'me'],
    queryFn: async () => {
      try {
        const { data } = await api.get<SellerProfile>('/sellers/me');
        return data;
      } catch (err: any) {
        if (err.response?.status === 404) {
          return null;
        }
        throw err;
      }
    },
    enabled: !!accessToken && !isModeratorOrAdmin,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    }
  });

  const updateSellerProfile = useMutation({
    mutationFn: async (updateData: { name?: string; phone?: string; bio?: string }) => {
      const { data } = await api.patch<SellerProfile>('/sellers/me', updateData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['seller', 'me'], data);
      queryClient.invalidateQueries({ queryKey: ['seller', 'me'] });
    },
  });

  const useSellerAnalytics = (periodDays: number) => {
    return useQuery({
      queryKey: ['sellerAnalytics', periodDays],
      queryFn: async () => {
        const fim = new Date();
        const inicio = new Date();
        inicio.setDate(fim.getDate() - periodDays);
        
        const fimStr = fim.toISOString().split('T')[0];
        const inicioStr = inicio.toISOString().split('T')[0];
        
        const response = await api.get(`/analytics/vendedor/dashboard?inicio=${inicioStr}&fim=${fimStr}`);
        return response.data;
      },
      enabled: !!accessToken,
    });
  };

  return {
    getSellerProfile,
    updateSellerProfile,
    useSellerAnalytics,
  };
};
