import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

interface CreateSavedSearchData {
  query?: string;
  filters?: any;
  alertActive?: boolean;
}

export function useSavedSearches() {
  const queryClient = useQueryClient();

  const getSavedSearches = useQuery({
    queryKey: ['saved-searches'],
    queryFn: async () => {
      const response = await api.get('/buyers/saved-searches');
      return response.data;
    },
  });

  const createSavedSearch = useMutation({
    mutationFn: async (data: CreateSavedSearchData) => {
      const response = await api.post('/buyers/saved-searches', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  const deleteSavedSearch = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/buyers/saved-searches/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  const toggleAlert = useMutation({
    mutationFn: async ({ id, alertActive }: { id: string; alertActive: boolean }) => {
      const response = await api.patch(`/buyers/saved-searches/${id}/alert`, { alertActive });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['saved-searches'] });
    },
  });

  return {
    getSavedSearches,
    createSavedSearch,
    deleteSavedSearch,
    toggleAlert,
  };
}
