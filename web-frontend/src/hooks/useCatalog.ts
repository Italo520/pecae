import { useQuery } from '@tanstack/react-query';
import { fetchBrands, fetchModels, fetchVersions } from '@/services/search.service';

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
    queryFn: () => fetchVersions(modelId!, year!),
    enabled: !!modelId && !!year,
    staleTime: 5 * 60 * 1000,
  });
}
