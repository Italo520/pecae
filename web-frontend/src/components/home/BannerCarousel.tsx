'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AdBanner } from '@/types/listing.types';

export interface BannerCarouselProps {
  ads: AdBanner[];
}

export function BannerCarousel({ ads }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (ads.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads.length, isHovered]);

  if (!ads || ads.length === 0) {
    return null; // Do not render if there are no ads
  }

  return (
    <section 
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      role="region" 
      aria-label="Anúncios em destaque"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative w-full h-[150px] md:h-[250px] overflow-hidden rounded-[var(--radius-lg)] bg-[var(--border)]">
        {ads.map((ad, index) => (
          <Link 
            key={ad.id} 
            href={ad.linkUrl}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            <Image
              src={ad.imageUrl}
              alt={`Anúncio Patrocinado ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </Link>
        ))}

        {ads.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
            {ads.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Ir para o anúncio ${index + 1}`}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  index === currentIndex ? 'bg-[var(--brand)] w-6' : 'bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
