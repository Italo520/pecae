import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';

export function useFavorites() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const getFavorites = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get('/favoritos');
      return response.data;
    },
    enabled: !!accessToken,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (listingId: string) => {
      const response = await api.post(`/favoritos/${listingId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  return {
    getFavorites,
    toggleFavorite,
  };
}
