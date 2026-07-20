import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { API_ENDPOINTS } from '@pecae/shared';
import { Vehicle } from './useVehicles'; // reusing vehicle type or similar

export interface ListingModeration {
  id: string;
  veiculoId: string;
  titulo: string;
  descricao: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  veiculo?: Vehicle;
  seller?: {
    id: string;
    nomeFantasia: string;
    email: string;
  };
}

export function useModerationListings() {
  return useQuery({
    queryKey: ['moderation-listings', 'pending'],
    queryFn: async () => {
      // O backend DEVE aceitar ?status=PENDING para filtrar.
      const response = await api.get<any>(API_ENDPOINTS.MODERATION.LISTINGS + '?status=PENDING');
      
      const rawList = response.data && response.data.content && Array.isArray(response.data.content)
        ? response.data.content
        : (Array.isArray(response.data) ? response.data : []);

      return rawList.map((item: any) => ({
        id: item.id,
        veiculoId: item.veiculoId,
        titulo: item.titulo,
        descricao: item.descricao,
        status: item.status,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        veiculo: item.veiculo ? {
          id: item.veiculo.id,
          brand: item.veiculo.marcaNome || '',
          model: item.veiculo.modeloNome || '',
          version: item.veiculo.versaoNome || '',
          year: item.veiculo.ano || '',
          color: item.veiculo.cor || '',
          status: item.veiculo.status || '',
          price: item.veiculo.preco || null,
          mainImage: item.veiculo.imagemPrincipal || null,
        } : undefined,
        seller: item.vendedor ? {
          id: item.vendedor.id,
          nomeFantasia: item.vendedor.nomeFantasia || 'Vendedor',
          email: item.vendedor.email || '',
        } : undefined,
      })) as ListingModeration[];
    },
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useApproveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(API_ENDPOINTS.MODERATION.APPROVE_LISTING(id));
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-listings'] });
    },
  });
}

export function useRejectListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      const response = await api.post(API_ENDPOINTS.MODERATION.REJECT_LISTING(id), { reason });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-listings'] });
    },
  });
}
