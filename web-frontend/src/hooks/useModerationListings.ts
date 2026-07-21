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
      const response = await api.get<any>(API_ENDPOINTS.MODERATION.LISTINGS);
      
      const rawList = response.data && response.data.content && Array.isArray(response.data.content)
        ? response.data.content
        : (Array.isArray(response.data) ? response.data : []);

      return rawList.map((item: any) => ({
        id: item.id,
        veiculoId: item.veiculoId,
        titulo: item.titulo,
        descricao: item.descricao,
        status: item.status,
        createdAt: item.createdAt || item.created_at,
        updatedAt: item.updatedAt || item.updated_at,
        veiculo: item.veiculo ? {
          id: item.veiculo.id,
          brand: item.veiculo.marcaNome || item.veiculo.brand || '',
          model: item.veiculo.modeloNome || item.veiculo.model || '',
          version: item.veiculo.versaoNome || item.veiculo.version || '',
          year: item.veiculo.ano || item.veiculo.year || '',
          color: item.veiculo.cor || item.veiculo.color || '',
          status: item.veiculo.status || '',
          price: item.veiculo.preco || item.veiculo.price || null,
          mainImage: item.veiculo.imagemPrincipal || item.veiculo.mainImage || null,
        } : undefined,
        seller: item.perfilVendedor ? {
          id: item.perfilVendedor.id,
          nomeFantasia: item.perfilVendedor.nomeFantasia || 'Vendedor',
          email: item.perfilVendedor.usuario?.email || '',
        } : (item.vendedor ? {
          id: item.vendedor.id,
          nomeFantasia: item.vendedor.nomeFantasia || 'Vendedor',
          email: item.vendedor.email || '',
        } : undefined),
      })) as ListingModeration[];
    },
    staleTime: 60 * 1000,
  });
}

export function useApproveListing() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await api.post(API_ENDPOINTS.MODERATION.APPROVE_LISTING(id), {
        acao: 'APROVAR_ANUNCIO',
        motivo: 'Aprovado via painel de moderação',
      });
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
      const response = await api.post(API_ENDPOINTS.MODERATION.REJECT_LISTING(id), {
        acao: 'REJEITAR_ANUNCIO',
        motivo: reason || 'Rejeitado pelo moderador',
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['moderation-listings'] });
    },
  });
}
