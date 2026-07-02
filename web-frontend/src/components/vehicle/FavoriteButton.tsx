'use client';

import React, { useMemo } from 'react';
import { Heart } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuthStore } from '@/store/auth-store';

export function FavoriteButton({ listingId }: { listingId: string }) {
  const { isAuthenticated } = useAuthStore();
  const { getFavorites, toggleFavorite } = useFavorites();
  const { data: favorites } = getFavorites;

  const isFavorited = useMemo(() => {
    if (!favorites) return false;
    return favorites.some((fav: any) => fav.listing?.id === listingId);
  }, [favorites, listingId]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      alert('Você precisa estar logado para favoritar.');
      return;
    }
    toggleFavorite.mutate(listingId);
  };

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={handleToggle}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle(e as any);
        }
      }}
      className={`absolute top-2 right-2 p-2 rounded-full backdrop-blur-md transition-colors z-10 cursor-pointer ${
        isFavorited 
          ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' 
          : 'bg-black/20 text-white hover:bg-black/40'
      }`}
      aria-label={isFavorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
    >
      <Heart size={20} className={isFavorited ? 'fill-current' : ''} />
    </div>
  );
}
