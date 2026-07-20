import { useInfiniteQuery } from '@tanstack/react-query';
import { fetchSearchResults } from '@/services/search.service';
import { VehicleSearchInput, PaginatedListings } from '@/types/search.types';

export function useSearch(initialParams: VehicleSearchInput, initialData?: PaginatedListings) {
  return useInfiniteQuery({
    queryKey: ['search', initialParams],
    queryFn: ({ pageParam = 1 }) => fetchSearchResults({ ...initialParams, page: pageParam as number }),
    getNextPageParam: (lastPage) => lastPage.meta.hasNextPage ? lastPage.meta.page + 1 : undefined,
    initialPageParam: 1,
    initialData: initialData ? {
      pages: [initialData],
      pageParams: [1]
    } : undefined,
  });
}
