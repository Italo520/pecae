import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export interface VehicleListing {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  photos: Array<{ url: string }>;
  listing?: {
    id: string;
    status: string;
  };
}

export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles', 'me'],
    queryFn: async () => {
      const { data } = await api.get<VehicleListing[]>('/vehicles/me');
      return data;
    },
  });
};

export const useListings = (filters?: { city?: string; state?: string }) => {
  return useQuery({
    queryKey: ['listings', filters],
    queryFn: async () => {
      const { data } = await api.get('/listings', { params: filters });
      return data;
    },
  });
};

export const useVehicleActions = () => {
  const queryClient = useQueryClient();

  const markAsSold = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.patch(`/vehicles/${id}/sold`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'me'] });
    },
  });

  return { markAsSold };
};
