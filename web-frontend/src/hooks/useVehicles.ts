import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@pecae/shared';
// import type { Vehicle } from '@pecae/shared';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: string;
  color: string;
  status: string;
  price?: number;
  mainImage?: string;
}

export function useVehicles() {
  return useQuery({
    queryKey: ['my-vehicles'],
    queryFn: async () => {
      const response = await api.get<any>(API_ENDPOINTS.VEHICLES.ME);
      
      const rawList = response.data && response.data.content && Array.isArray(response.data.content)
        ? response.data.content
        : (Array.isArray(response.data) ? response.data : []);

      return rawList.map((v: any) => ({
        id: v.id,
        brand: v.marcaNome || v.brand || '',
        model: v.modeloNome || v.model || '',
        version: v.versaoNome || v.version || '',
        year: v.ano || v.year || '',

        color: v.cor || v.color || '',
        status: v.status || '',
        price: v.preco || v.price || null,
        mainImage: v.urlFotoPrincipal || v.imagemPrincipal || v.mainImage || (v.fotos && v.fotos.length > 0 ? v.fotos[0].url : null),
      })) as Vehicle[];
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
    mutationFn: async (data: any & { photos?: File[] }) => {
      // Create vehicle first
      const { photos, ...payload } = data;
      const response = await api.post(API_ENDPOINTS.VEHICLES.CREATE, payload);
      const vehicle = response.data;

      // Upload photos if any
      if (photos && photos.length > 0) {
        for (const photo of photos) {
          const formData = new FormData();
          formData.append('file', photo);
          formData.append('type', 'EXTERIOR'); // default to EXTERIOR
          try {
            await api.post(`/vehicles/me/${vehicle.id}/photos`, formData);
          } catch(e) {
            console.error('Failed to upload photo', e);
          }
        }
      }

      // Criar o anúncio correspondente para o veículo
      const marca = data.marcaNome || 'Veículo';
      const modelo = data.modeloNome || '';
      const ano = data.anoNome || '';
      const cor = data.cor || '';
      const uniqueSuffix = Date.now().toString().slice(-6);
      const title = `${marca} ${modelo} ${ano} - ${cor} #${uniqueSuffix}`.trim();
      const description = data.observacoes || `Sucata doadora ${marca} ${modelo}. Peças disponíveis para venda. Entre em contato para negociar.`;

      try {
        await api.post('/listings/me', {
          veiculoId: vehicle.id,
          titulo: title,
          descricao: description
        });
      } catch (listingError: any) {
        console.error('Veículo criado mas falha ao criar anúncio:', listingError?.response?.data);
        // O veículo foi criado. Propaga o erro com contexto melhorado.
        throw listingError;
      }

      return vehicle;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
    },
  });
}

export function usePauseVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/listings/me/${id}/pause`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
    },
  });
}

export function useRepublishVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/listings/me/${id}/republish`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
    },
  });
}

export function useSoldVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/listings/me/${id}/sold`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
    },
  });
}

export function useCloseVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/listings/me/${id}/close`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
    },
  });
}

export function useDuplicateVehicle() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await api.post(`/vehicles/${id}/duplicate`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vehicles'] });
    },
  });
}
