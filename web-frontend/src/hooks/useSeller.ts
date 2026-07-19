import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';

export interface SellerProfile {
  id: string;
  nome: string;
  telefone: string;
  biografia?: string;
  urlLogo?: string;
  urlBanner?: string;
}

export const useSeller = () => {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const getSellerProfile = useQuery({
    queryKey: ['seller', 'me'],
    queryFn: async () => {
      const { data } = await api.get<SellerProfile>('/sellers/me');
      return data;
    },
    enabled: !!accessToken,
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
