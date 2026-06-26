import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface VehiclePhoto {
  url: string;
  blurhash?: string | null;
  order?: number;
}

export interface VehicleListing {
  id: string;
  title?: string;
  brand: string;
  model: string;
  version: string;
  yearFab: number;
  color: string;
  city: string;
  state: string;
  status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'INACTIVE' | 'SOLD';
  createdAt: string;
  photos: VehiclePhoto[];
  availableParts: string[];
}

export interface VehicleDonor {
  id: string;
  listingId?: string;
  brand: string;
  model: string;
  version: string;
  yearFab: number;
  color: string;
  city: string;
  state: string;
  thumbnail: string | null;
  photos: VehiclePhoto[];
  availablePartsCount: number;
  availableParts: string[];
  seller: {
    id: string;
    userId?: string;
    storeName: string;
    city: string;
    state: string;
    isVerified: boolean;
  };
  isSponsored: boolean;
  createdAt: string;
  observations?: string;
}

export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles', 'me'],
    queryFn: async () => {
      const { data } = await api.get<any>('/vehicles/me');
      return Array.isArray(data) ? data : (data?.items || []);
    },
  });
};

export const useSearchVehicles = (filters?: { 
  brandId?: string; 
  modelId?: string; 
  versionId?: string; 
  yearMin?: number;
  yearMax?: number;
  q?: string;
  city?: string;
  state?: string;
  fuelType?: string;
  mileageMax?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ['vehicles', 'search', filters],
    queryFn: async () => {
      const { data } = await api.get<any>('/listings', { params: { ...filters, size: filters?.limit || 20 } });
      const mappedData = (data.content || []).map((item: any) => ({
        id: item.id,
        title: item.titulo,
        status: item.status,
        views: item.visualizacoes,
        brand: item.marcaNome,
        model: item.modeloNome,
        version: item.versaoNome,
        yearFab: item.anoFabricacao,
        color: item.cor,
        city: item.cidade,
        state: item.estado,
        thumbnail: item.urlFotoPrincipal,
        seller: {
          id: item.perfilVendedorId,
          storeName: item.nomeVendedor,
          isVerified: item.vendedorVerificado
        },
        createdAt: item.publicadoEm,
        isSponsored: item.patrocinadoAtivo || false,
      }));
      return {
        data: mappedData,
        hasMore: !data.last,
        nextCursor: !data.last ? String((data.number || 0) + 1) : null
      };
    },
  });
};

export interface InfiniteSearchFilters {
  brandId?: string;
  modelId?: string;
  versionId?: string;
  yearMin?: number;
  yearMax?: number;
  q?: string;
  city?: string;
  state?: string;
  fuelType?: string;
  mileageMax?: number;
  type?: string;
  limit?: number;
}

export const useInfiniteSearchVehicles = (filters?: InfiniteSearchFilters) => {
  const limit = filters?.limit ?? 20;

  return useInfiniteQuery({
    queryKey: ['vehicles', 'search', 'infinite', { ...filters, limit }],
    initialPageParam: null as string | null,
    queryFn: async ({ pageParam }) => {
      const params = {
        ...filters,
        size: limit,
        ...(pageParam ? { page: pageParam } : { page: 0 }),
      };
      const { data } = await api.get<any>('/listings', { params });
      const mappedData = (data.content || []).map((item: any) => ({
        id: item.id,
        title: item.titulo,
        status: item.status,
        views: item.visualizacoes,
        brand: item.marcaNome,
        model: item.modeloNome,
        version: item.versaoNome,
        yearFab: item.anoFabricacao,
        color: item.cor,
        city: item.cidade,
        state: item.estado,
        thumbnail: item.urlFotoPrincipal,
        seller: {
          id: item.perfilVendedorId,
          storeName: item.nomeVendedor,
          isVerified: item.vendedorVerificado
        },
        createdAt: item.publicadoEm,
        isSponsored: item.patrocinadoAtivo || false,
      }));
      return {
        data: mappedData,
        hasMore: !data.last,
        nextCursor: !data.last ? String((data.number || 0) + 1) : null
      };
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore ? lastPage.nextCursor : undefined,
  });
};

export interface SearchSuggestion {
  text: string;
  type: 'BRAND' | 'MODEL';
  id: string;
}

export const useSearchSuggestions = (q: string) => {
  return useQuery({
    queryKey: ['search', 'suggestions', q],
    queryFn: async () => {
      if (!q || q.trim().length < 2) return [];
      try {
        const { data } = await api.get<SearchSuggestion[]>('/search/suggestions', { params: { q } });
        return data;
      } catch (e) {
        // Mock temporary until backend implements suggestions
        console.warn('Backend endpoint /search/suggestions missing. Returning empty.');
        return [];
      }
    },
    enabled: q.trim().length >= 2,
  });
};

export const useVehicleDetails = (id: string) => {
  return useQuery({
    queryKey: ['vehicles', id],
    queryFn: async () => {
      const { data } = await api.get<any>(`/listings/${id}`);
      
      const mapped: VehicleDonor = {
        id: data.veiculoId || data.id,
        listingId: data.id,
        brand: data.marcaNome || '',
        model: data.modeloNome || '',
        version: data.versaoNome || '',
        yearFab: data.anoFabricacao || 0,
        color: data.cor || '',
        city: data.cidade || '',
        state: data.estado || '',
        thumbnail: data.fotos && data.fotos.length > 0 ? data.fotos[0].url : null,
        photos: (data.fotos || []).map((f: any) => ({
          url: f.url,
          blurhash: f.blurhash
        })),
        availablePartsCount: data.pecasDisponiveis ? data.pecasDisponiveis.length : 0,
        availableParts: data.pecasDisponiveis || [],
        seller: {
          id: data.perfilVendedorId || '',
          userId: data.perfilVendedorId || '',
          storeName: data.nomeVendedor || 'Vendedor',
          city: data.cidade || '',
          state: data.estado || '',
          isVerified: data.vendedorVerificado || false,
        },
        isSponsored: data.patrocinadoAtivo || false,
        createdAt: data.publicadoEm || data.criadoEm || '',
        observations: data.observacoes || data.descricao || '',
      };
      return mapped;
    },
    enabled: !!id,
  });
};

export const useVehicleActions = () => {
  const queryClient = useQueryClient();

  const markAsSold = useMutation({
    mutationFn: async (id: string) => {
      // PATCH /listings/me/:id/sold
      const { data } = await api.patch(`/listings/me/${id}/sold`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const markAsRemoved = useMutation({
    mutationFn: async (id: string) => {
      // DELETE /listings/me/:id — logical delete (EXPIRADO)
      const { data } = await api.delete(`/listings/me/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  const deleteVehicle = useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/vehicles/me/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'me'] });
    },
    onError: (error: any) => {
      console.error('Failed to delete vehicle:', error);
      alert('Erro ao excluir: ' + (error.response?.data?.message || error.message));
    }
  });

  const reactivateVehicle = useMutation({
    mutationFn: async (id: string) => {
      // The backend does not have reactivate directly. 
      // It might need to go through the generic patch or create a new listing.
      // Mock for now to prevent crashes.
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });

  return { markAsSold, markAsRemoved, deleteVehicle, reactivateVehicle };
};
