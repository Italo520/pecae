import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@pecae/shared';
import type { Vehicle } from '@pecae/shared';

export function useVehicles() {
  return useQuery({
    queryKey: ['my-vehicles'],
    queryFn: async () => {
      const response = await api.get<Vehicle[]>(API_ENDPOINTS.VEHICLES.ME);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useDeleteVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (vehicleId: string) => {
      await api.delete(API_ENDPOINTS.VEHICLES.DELETE(vehicleId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
    },
  });
}
