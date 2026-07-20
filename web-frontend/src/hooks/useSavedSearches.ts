import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { useAuthStore } from '@/store/auth-store';

export interface SavedSearch {
  id: string;
  userId: string;
  query?: string | null;
  filters: any;
  alertActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSavedSearchDto {
  query?: string;
  filters: any;
  alertActive?: boolean;
}

export function useSavedSearches() {
  const queryClient = useQueryClient();
  const accessToken = useAuthStore((state) => state.accessToken);

  const getSavedSearches = useQuery({
    queryKey: ['savedSearches'],
    queryFn: async () => {
      const response = await api.get<SavedSearch[]>('/buyers/saved-searches');
      return response.data;
    },
    enabled: !!accessToken,
  });

  const saveSearch = useMutation({
    mutationFn: async (dto: CreateSavedSearchDto) => {
      const response = await api.post<SavedSearch>('/buyers/saved-searches', dto);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
    },
  });

  const deleteSavedSearch = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.delete(`/buyers/saved-searches/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
    },
  });

  const toggleSavedSearchAlert = useMutation({
    mutationFn: async ({ id, alertActive }: { id: string; alertActive: boolean }) => {
      const response = await api.patch(`/buyers/saved-searches/${id}`, { alertActive });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedSearches'] });
    },
  });

  return {
    getSavedSearches,
    saveSearch,
    deleteSavedSearch,
    toggleSavedSearchAlert
  };
}
