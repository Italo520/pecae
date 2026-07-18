import { useQuery } from '@tanstack/react-query';
import { fetchBrands, fetchModels, fetchVersions, fetchYears, fetchPartCategories } from '@/services/search.service';

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: fetchBrands,
    staleTime: Infinity,
  });
}

export function useModels(brandId?: string) {
  return useQuery({
    queryKey: ['models', brandId],
    queryFn: () => fetchModels(brandId!),
    enabled: !!brandId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useVersions(modelId?: string, year?: string) {
  return useQuery({
    queryKey: ['versions', modelId, year],
    queryFn: () => fetchVersions(modelId!, year || ''),
    enabled: !!modelId,
    staleTime: 5 * 60 * 1000,
  });
}

// Aliases and mock for Step2Fipe
export const useCatalogBrands = useBrands;
export const useCatalogModels = useModels;
export const useCatalogVersions = (modelId?: string) => useVersions(modelId, '');
export const useCatalogYears = (versionId?: string) => {
  return useQuery({
    queryKey: ['years', versionId],
    queryFn: () => fetchYears(versionId!),
    enabled: !!versionId,
    staleTime: Infinity,
  });
};

export function usePartCategories() {
  return useQuery({
    queryKey: ['part-categories'],
    queryFn: fetchPartCategories,
    staleTime: Infinity,
  });
}
