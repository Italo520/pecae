import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { Brand, Model, Version, Year, PartCategory, QUERY_DEFAULTS } from '@pecae/shared';

export const useBrands = (type?: string) => {
  return useQuery({
    queryKey: ['catalog', 'brands', type],
    queryFn: async () => {
      const { data } = await api.get<Brand[]>('/catalog/brands', { params: { type } });
      return data;
    },
    staleTime: QUERY_DEFAULTS.staleTime.STATIC,
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
    staleTime: QUERY_DEFAULTS.staleTime.STATIC,
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
    staleTime: QUERY_DEFAULTS.staleTime.STATIC,
  });
};

export const useYears = (versionId?: string) => {
  return useQuery({
    queryKey: ['catalog', 'years', versionId],
    queryFn: async () => {
      if (!versionId) return [];
      const { data } = await api.get<Year[]>(`/catalog/versions/${versionId}/years`);
      return data;
    },
    enabled: !!versionId,
    staleTime: QUERY_DEFAULTS.staleTime.STATIC,
  });
};

export const usePartCategories = () => {
  return useQuery({
    queryKey: ['catalog', 'part-categories'],
    queryFn: async () => {
      const { data } = await api.get<PartCategory[]>('/catalog/part-categories');
      return data;
    },
    staleTime: QUERY_DEFAULTS.staleTime.STATIC,
  });
};
