import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Camera, MapPin } from 'lucide-react';
import { ListingCard as ListingCardType } from '@/types/listing.types';
import { Badge } from '@/components/ui/Badge';
import { FavoriteButton } from './FavoriteButton';

export interface ListingCardProps {
  listing: ListingCardType;
}

// Utilitário para tempo relativo
function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return 'agora mesmo';
  if (hours < 24) return `há ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `há ${days} dia${days > 1 ? 's' : ''}`;
  return `há ${Math.floor(days / 30)} mês(es)`;
}

export function ListingCard({ listing }: ListingCardProps) {
  const isNew = (Date.now() - new Date(listing.createdAt).getTime()) < (24 * 3600 * 1000);

  return (
    <Link 
      href={`/veiculo/${listing.id}`}
      className="group flex flex-col bg-surface border border-border rounded-3xl overflow-hidden hover:shadow-md transition-shadow relative"
    >
      {/* Top Badges & Favorite */}
      <FavoriteButton listingId={listing.id} />
      
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {listing.sponsored && <Badge variant="warning">Patrocinado</Badge>}
        {isNew && <Badge variant="brand">Novo</Badge>}
        {listing.verifiedSeller && <Badge variant="success">Verificado</Badge>}
      </div>

      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] bg-border overflow-hidden">
        <Image
          src={listing.imageUrl}
          alt={`${listing.brand} ${listing.model}`}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Photo Count */}
        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 backdrop-blur-sm">
          <Camera size={14} />
          <span>{listing.imageCount}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start gap-2 mb-1">
          <h3 className="font-semibold text-foreground line-clamp-2 leading-tight font-display">
            {listing.title}
          </h3>
        </div>
        
        <p className="text-sm text-muted mb-3">
          {listing.year}
        </p>

        <div className="mt-auto flex flex-col gap-2">
          <p className="text-sm font-medium text-brand">
            {listing.partsAvailable} peças disponíveis
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted pt-3 border-t border-border">
            <span className="flex items-center gap-1">
              <MapPin size={12} />
              {listing.city}, {listing.state}
            </span>
            <span>{timeAgo(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
