'use client';

import React, { useState } from 'react';
import { Heart } from 'lucide-react';

export function FavoriteButton({ listingId }: { listingId: string }) {
  const [isFavorited, setIsFavorited] = useState(false);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // prevent card click
    setIsFavorited(!isFavorited);
    // TODO: implement actual favorite logic calling API/Context
  };

  return (
    <div 
      role="button"
      tabIndex={0}
      onClick={toggleFavorite}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleFavorite(e as any);
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
