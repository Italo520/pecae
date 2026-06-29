'use client';

import React, { useEffect, useRef } from 'react';
import { VehicleSearchInput, PaginatedListings } from '@/types/search.types';
import { ListingCard } from '@/components/vehicle/ListingCard';
import { ListingGridSkeleton } from '@/components/home/ListingGridSkeleton';

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
                <div key={filter.key} className="flex items-center gap-1.5 px-3 py-1 bg-[var(--surface)] border border-[var(--border)] rounded-full text-xs font-medium text-[var(--foreground)]">
                  <span>{filter.label}</span>
                  <button onClick={() => onFilterChange(filter.key, undefined)} className="text-[var(--muted)] hover:text-[var(--foreground)]" aria-label="Remover filtro">
                    ✕
                  </button>
                </div>
              ))}
              <button onClick={onClearFilters} className="text-xs text-[var(--brand)] hover:underline ml-2">
                Limpar Tudo
              </button>
            </>
          ) : (
            <span className="text-sm text-[var(--muted)]">Nenhum filtro aplicado.</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <label className="text-sm text-[var(--muted)]">Ordenar por:</label>
          <select 
            value={searchParams.sort || ''} 
            onChange={(e) => onFilterChange('sort', e.target.value)}
            className="px-3 py-1.5 bg-transparent border border-[var(--border)] rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-[var(--brand)]"
          >
            <option value="recent">Mais recentes</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
            <option value="views">Mais visualizados</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
        <h1 className="text-2xl font-display font-bold text-[var(--foreground)]">Resultados da Busca</h1>
        <span className="text-sm text-[var(--muted)]">{total} veículos encontrados</span>
      </div>

      {isLoading ? (
        <ListingGridSkeleton count={12} />
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--surface)] rounded-xl border border-[var(--border)]">
          <div className="w-16 h-16 mb-4 rounded-full bg-[var(--border)] flex items-center justify-center text-2xl">
            🔍
          </div>
          <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">Nenhum veículo encontrado.</h3>
          <p className="text-[var(--muted)] text-sm max-w-md mb-6">
            Não encontramos peças correspondentes aos filtros selecionados. Tente remover alguns filtros ou buscar de forma mais genérica.
          </p>
          <button onClick={onClearFilters} className="px-6 py-2 bg-[var(--brand)] text-white font-semibold rounded-lg hover:bg-[var(--brand-dark)] transition-colors">
            Ver todos os veículos
          </button>
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
          <div className="w-6 h-6 border-2 border-[var(--brand)] border-t-transparent rounded-full animate-spin" />
        )}
      </div>
    </div>
  );
}
