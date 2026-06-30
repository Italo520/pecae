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

export function useCreateVehicle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: VehicleCreateInput & { photos?: File[] }) => {
      // In a real scenario with multipart, we would construct a FormData here:
      // const formData = new FormData();
      // formData.append('data', JSON.stringify(data));
      // data.photos?.forEach(file => formData.append('photos', file));
      // await api.post(API_ENDPOINTS.VEHICLES.CREATE, formData, { headers: { 'Content-Type': 'multipart/form-data' }});
      
      // For now, assuming API accepts JSON as in schema (and we mock the photos or upload to a separate endpoint later)
      const { photos, ...payload } = data;
      const response = await api.post(API_ENDPOINTS.VEHICLES.CREATE, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
    },
  });
}
