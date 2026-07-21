'use client';

import React, { useState, useEffect } from 'react';
import { ListingCard as ListingCardType } from '@/types/listing.types';
import { ListingCard } from '@/components/vehicle/ListingCard';
import { api } from '@/lib/axios';

export interface PaginatedListingGridProps {
  initialListings: ListingCardType[];
  title?: string;
}

export function PaginatedListingGrid({ initialListings, title = 'Veículos em Destaque' }: PaginatedListingGridProps) {
  // Deduplicar listagem inicial
  const deduplicatedInitial = Array.from(
    new Map((initialListings || []).map(item => [item.id, item])).values()
  );

  const [listings, setListings] = useState<ListingCardType[]>(deduplicatedInitial);
  const [page, setPage] = useState<number>(0);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(deduplicatedInitial.length >= 20);

  useEffect(() => {
    const deduped = Array.from(
      new Map((initialListings || []).map(item => [item.id, item])).values()
    );
    setListings(deduped);
    setPage(0);
    setHasMore(deduped.length >= 20);
  }, [initialListings]);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      // Envia tanto pagina/tamanho quanto page/size para compatibilidade total
      const response = await api.get(`/listings?pagina=${nextPage}&tamanho=20&page=${nextPage}&size=20`);
      const content = response.data?.content || [];

      if (content.length === 0) {
        setHasMore(false);
      } else {
        const adaptedContent: ListingCardType[] = content.map((item: any, index: number) => ({
          id: item.id ? String(item.id) : `page-${nextPage}-${index}`,
          title: item.titulo || 'Veículo',
          brand: item.marcaNome || 'Marca',
          model: item.modeloNome || 'Modelo',
          year: item.anoFabricacao || new Date().getFullYear(),
          city: item.cidade || 'Cidade',
          state: item.estado || 'Estado',
          partsAvailable: Array.isArray(item.pecasDisponiveis) ? item.pecasDisponiveis.length : (item.totalPecas || 0),
          createdAt: item.publicadoEm || new Date().toISOString(),
          imageUrl: item.urlFotoPrincipal || 'https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg?auto=compress&cs=tinysrgb&w=800',
          imageCount: 1,
          sponsored: item.patrocinadoAtivo || false,
          verifiedSeller: item.vendedorVerificado || false,
        }));

        setListings(prev => {
          const existingIds = new Set(prev.map(item => item.id));
          const newUniqueItems = adaptedContent.filter(item => !existingIds.has(item.id));
          if (newUniqueItems.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...prev, ...newUniqueItems];
        });

        setPage(nextPage);
        if (content.length < 20) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar mais veículos:', error);
      setHasMore(false);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (!listings || listings.length === 0) {
    return (
      <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {title && <h2 className="text-2xl font-bold font-display text-foreground mb-6">{title}</h2>}
        <div className="p-8 text-center bg-surface border border-border rounded-3xl text-muted">
          Nenhum veículo encontrado no momento.
        </div>
      </section>
    );
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold font-display text-foreground">{title}</h2>
        <span className="text-sm font-medium text-muted">
          Exibindo {listings.length} veículos
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-10 flex justify-center">
          <button
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="px-8 py-3.5 rounded-full bg-surface border border-brand text-brand hover:bg-brand hover:text-white font-semibold text-sm transition-all duration-200 shadow-sm disabled:opacity-50 flex items-center gap-2"
          >
            {isLoadingMore ? (
              <>
                <span className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
                Carregando mais veículos...
              </>
            ) : (
              'Carregar mais veículos (+20)'
            )}
          </button>
        </div>
      )}
    </section>
  );
}
