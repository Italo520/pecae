'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ListingCard } from '@/types/listing.types';

export function RecentlyViewed() {
  const [recentListings, setRecentListings] = useState<ListingCard[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('pecae-recently-viewed');
      if (stored) {
        const parsed = JSON.parse(stored) as ListingCard[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          setRecentListings(parsed.slice(0, 10)); // max 10
        }
      }
    } catch (e) {
      console.error('Failed to parse recently viewed', e);
    }
  }, []);

  if (recentListings.length === 0) {
    return null; // Don't render anything if empty
  }

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-label="Vistos Recentemente">
      <h2 className="text-xl font-bold font-display text-[var(--foreground)] mb-4">
        Vistos Recentemente
      </h2>
      
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x mandatory">
        {recentListings.map((listing) => (
          <Link
            key={listing.id}
            href={`/veiculo/${listing.id}`}
            className="snap-start shrink-0 w-[240px] flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-md)] overflow-hidden hover:shadow-sm transition-shadow group"
          >
            <div className="relative w-full h-[140px] bg-[var(--border)] overflow-hidden">
              <Image
                src={listing.imageUrl}
                alt={`${listing.brand} ${listing.model}`}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="p-3 flex flex-col gap-1">
              <h3 className="text-sm font-semibold text-[var(--foreground)] truncate">
                {listing.title}
              </h3>
              <p className="text-xs text-[var(--muted)]">
                {listing.year} &bull; {listing.partsAvailable} peças
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
