import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';

export interface Brand {
  id: string;
  name: string;
}

export interface Model {
  id: string;
  name: string;
  brandId: string;
}

export interface Version {
  id: string;
  name: string;
  modelId: string;
}

export const useBrands = (type?: string) => {
  return useQuery({
    queryKey: ['catalog', 'brands', type],
    queryFn: async () => {
      const { data } = await api.get<Brand[]>('/catalog/brands', { params: { type } });
      return data;
    },
  });
};

export const useModels = (brandId?: string) => {
  return useQuery({
    queryKey: ['catalog', 'models', brandId],
    queryFn: async () => {
      if (!brandId) return [];
      const { data } = await api.get<Model[]>(`/catalog/brands/${brandId}/models`);
      return data;
    },
    enabled: !!brandId,
  });
};

export const useVersions = (modelId?: string) => {
  return useQuery({
    queryKey: ['catalog', 'versions', modelId],
    queryFn: async () => {
      if (!modelId) return [];
      const { data } = await api.get<Version[]>(`/catalog/models/${modelId}/versions`);
      return data;
    },
    enabled: !!modelId,
  });
};
