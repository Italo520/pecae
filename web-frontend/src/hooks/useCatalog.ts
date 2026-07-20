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

export const useCatalogBrands = useBrands;
export const useCatalogModels = useModels;
// In Parallelum V2, we go directly from Models to Years. We don't use Versions.
export const useCatalogVersions = (modelId?: string) => useVersions(modelId, '');
export const useCatalogYears = (brandId?: string, modelId?: string) => {
  return useQuery({
    queryKey: ['years', brandId, modelId],
    queryFn: () => fetchYears(brandId!, modelId!),
    enabled: !!brandId && !!modelId,
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
