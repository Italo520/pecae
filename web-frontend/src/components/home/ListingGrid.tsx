import React from 'react';
import Link from 'next/link';
import { ListingCard as ListingCardType } from '@/types/listing.types';
import { ListingCard } from '@/components/vehicle/ListingCard';

export interface ListingGridProps {
  listings: ListingCardType[];
  title?: string;
  viewAllUrl?: string;
}

export function ListingGrid({ listings, title, viewAllUrl }: ListingGridProps) {
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
      {(title || viewAllUrl) && (
        <div className="flex items-center justify-between mb-6">
          {title && <h2 className="text-2xl font-bold font-display text-foreground">{title}</h2>}
          {viewAllUrl && (
            <Link href={viewAllUrl} className="text-sm font-medium text-brand hover:underline">
              Ver todos &rarr;
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </section>
  );
}
