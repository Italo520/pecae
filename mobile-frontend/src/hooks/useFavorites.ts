import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

import { useAuthStore } from '../store/auth-store';
import * as Haptics from 'expo-haptics';

export function useFavorites() {
  const queryClient = useQueryClient();
  const token = useAuthStore((state) => state.token);

  const getFavorites = useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const response = await api.get('/buyers/favorites');
      return response.data;
    },
    enabled: !!token,
  });

  const toggleFavorite = useMutation({
    mutationFn: async (listingId: string) => {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const response = await api.post(`/buyers/favorites/${listingId}`);
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
