'use client';

import React, { useEffect, useRef } from 'react';
import { VehicleSearchInput, PaginatedListings } from '@/types/search.types';
import { ListingCard } from '@/components/vehicle/ListingCard';
import { ListingGridSkeleton } from '@/components/home/ListingGridSkeleton';

import { useSavedSearches } from '@/hooks/useSavedSearches';
import { toast } from 'sonner';

interface SearchResultsProps {
  searchParams: VehicleSearchInput;
  results: PaginatedListings[];
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean;
  onFilterChange: (key: keyof VehicleSearchInput, value: string | undefined) => void;
  onClearFilters: () => void;
  fetchNextPage: () => void;
}

export function SearchResults({
  searchParams,
  results,
  isLoading,
  isFetchingNextPage,
  hasNextPage,
  onFilterChange,
  onClearFilters,
  fetchNextPage
}: SearchResultsProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const { saveSearch } = useSavedSearches();

  const handleSaveSearch = () => {
    saveSearch.mutate(
      {
        query: searchParams.query || '',
        filters: {
          vehicleCategory: searchParams.vehicleCategory,
          brandId: searchParams.brandId,
          modelId: searchParams.modelId,
          year: searchParams.year,
          versionId: searchParams.versionId,
          state: searchParams.state,
          city: searchParams.city
        },
        alertActive: true
      },
      {
        onSuccess: () => {
          toast.success('Busca salva com sucesso! Avisaremos quando houver novos veículos correspondentes.');
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || 'Erro ao salvar busca. Faça login para salvar.');
        }
      }
    );
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten the pages to a single array of listings
  const listings = results.flatMap(page => page.data);
  const total = results[0]?.meta.total || 0;

  // Compute active filters for chips
  const activeFilters = [];
  if (searchParams.query) activeFilters.push({ label: `Busca: ${searchParams.query}`, key: 'query' as keyof VehicleSearchInput });
  if (searchParams.vehicleCategory) activeFilters.push({ label: searchParams.vehicleCategory, key: 'vehicleCategory' as keyof VehicleSearchInput });
  if (searchParams.brandId) activeFilters.push({ label: `Marca ID: ${searchParams.brandId}`, key: 'brandId' as keyof VehicleSearchInput }); // Ideal seria ter o nome
  if (searchParams.modelId) activeFilters.push({ label: `Modelo ID: ${searchParams.modelId}`, key: 'modelId' as keyof VehicleSearchInput }); // Ideal seria ter o nome
  if (searchParams.year) activeFilters.push({ label: searchParams.year, key: 'year' as keyof VehicleSearchInput });
  if (searchParams.versionId) activeFilters.push({ label: `Versão ID: ${searchParams.versionId}`, key: 'versionId' as keyof VehicleSearchInput }); // Ideal seria ter o nome
  if (searchParams.state) activeFilters.push({ label: searchParams.state, key: 'state' as keyof VehicleSearchInput });

  return (
    <div className="flex flex-col gap-6">
      {/* Top Bar: Chips and Sort */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-wrap gap-2 items-center flex-1">
          {activeFilters.length > 0 ? (
            <>
              {activeFilters.map(filter => (
                <div key={filter.key} className="flex items-center gap-1.5 px-4 py-1.5 bg-surface border border-border rounded-full text-xs font-medium text-foreground backdrop-blur-md">
                  <span>{filter.label}</span>
                  <button onClick={() => onFilterChange(filter.key, undefined)} className="text-muted hover:text-foreground" aria-label="Remover filtro">
                    ✕
                  </button>
                </div>
              ))}
              <button onClick={onClearFilters} className="text-xs text-brand hover:underline ml-2">
                Limpar Tudo
              </button>
            </>
          ) : (
            <span className="text-sm text-muted">Nenhum filtro aplicado.</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-sm text-muted">Ordenar por:</label>
          <select 
            value={searchParams.sort || ''} 
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="px-4 py-2 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand"
          >
            <option value="recent">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="views">Mais visualizados</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-2xl font-display font-bold text-foreground">Resultados da Busca</h1>
        <span className="text-sm text-muted">{total} veículos encontrados</span>
      </div>

      {isLoading ? (
        <ListingGridSkeleton count={12} />
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-surface rounded-3xl border border-border backdrop-blur-md">
          <div className="w-16 h-16 mb-4 rounded-full bg-border flex items-center justify-center text-2xl">
            🔍
          </div>
          <h3 className="text-lg font-bold font-display text-foreground mb-2">Nenhum veículo encontrado.</h3>
          <p className="text-muted text-sm max-w-md mb-6">
            Não encontramos peças correspondentes aos filtros selecionados. Tente remover alguns filtros, buscar de forma mais genérica ou salve seu alerta de busca.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={onClearFilters} className="px-6 py-3 bg-neutral-800 text-white font-bold rounded-xl hover:bg-neutral-700 transition-colors">
              Ver todos os veículos
            </button>
            <button 
              onClick={handleSaveSearch} 
              disabled={saveSearch.isPending}
              className="px-6 py-3 bg-brand text-white font-bold rounded-xl hover:bg-brand/90 transition-colors disabled:opacity-50"
            >
              {saveSearch.isPending ? 'Salvando...' : 'Salvar Busca e me Alertar'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Infinite Scroll Sentinel */}
      <div ref={sentinelRef} className="h-10 w-full flex items-center justify-center mt-4">
        {isFetchingNextPage && (
          <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
