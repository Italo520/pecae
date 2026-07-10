'use client';

import React, { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';
import { VehicleSearchInput, PaginatedListings } from '@/types/search.types';
import { Brand } from '@/types/catalog.types';
import { useSearch } from '@/hooks/useSearch';
import { FilterPanel } from './FilterPanel';
import { SearchResults } from './SearchResults';
import { BannerCarousel } from '@/components/home/BannerCarousel';

import { AdBanner } from '@/types/listing.types';

interface SearchPageClientProps {
  initialResults: PaginatedListings;
  brands: Brand[];
  searchParams: VehicleSearchInput;
  ads?: AdBanner[];
}

export function SearchPageClient({ initialResults, brands, searchParams, ads = [] }: SearchPageClientProps) {
  const router = useRouter();
  
  // We keep a local copy of params to drive the UI/Queries
  const [params, setParams] = useState<VehicleSearchInput>(searchParams);

  // TanStack Query handles the data fetching based on `params`
  // We seed it with initialData from SSR so first render has no layout shift or extra fetch
  const { 
    data, 
    fetchNextPage, 
    hasNextPage, 
    isFetchingNextPage, 
    isLoading 
  } = useSearch(params, initialResults);

  const updateUrl = useCallback((newParams: VehicleSearchInput) => {
    const url = new URL(window.location.href);
    
    // Clear existing
    Array.from(url.searchParams.keys()).forEach(key => url.searchParams.delete(key));
    
    // Set new
    Object.entries(newParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });

    // Shallow push (doesn't trigger full SSR reload unless we want to, but we handle state locally)
    router.push(url.pathname + url.search, { scroll: false });
  }, [router]);

  const handleFilterChange = useCallback((key: keyof VehicleSearchInput, value: string | undefined) => {
    setParams(prev => {
      const next = { ...prev, [key]: value, page: 1 }; // reset to page 1 on any filter change
      
      // Cascading logic cleanups are handled in FilterPanel, but we just accept the changes here
      if (!value) delete next[key];
      
      updateUrl(next);
      return next;
    });
  }, [updateUrl]);

  const handleClearFilters = useCallback(() => {
    setParams({ page: 1 });
    updateUrl({ page: 1 });
  }, [updateUrl]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 shrink-0 flex flex-col gap-6">
          <FilterPanel 
            initialBrands={brands} 
            searchParams={params}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
          />
          {ads && ads.length > 0 && (
            <BannerCarousel ads={ads} variant="sidebar" />
          )}
        </aside>

        {/* Main Content */}
        <main className="w-full lg:w-3/4">
          <SearchResults 
            searchParams={params}
            results={data?.pages || []}
            isLoading={isLoading}
            isFetchingNextPage={isFetchingNextPage}
            hasNextPage={!!hasNextPage}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            fetchNextPage={fetchNextPage}
          />
        </main>

      </div>
    </div>
  );
}
