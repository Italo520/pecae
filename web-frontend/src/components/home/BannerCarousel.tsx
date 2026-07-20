'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AdBanner } from '@/types/listing.types';

export interface BannerCarouselProps {
  ads: AdBanner[];
  variant?: 'home' | 'sidebar' | 'detail';
}

export function BannerCarousel({ ads, variant = 'home' }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (ads.length <= 1 || isHovered) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [ads.length, isHovered]);

  const handleImageError = useCallback((adId: string) => {
    setFailedImages(prev => new Set(prev).add(adId));
  }, []);

  if (!ads || ads.length === 0) {
    return null; // Não renderiza se não houver anúncios
  }

  // Define styling based on the variant
  let containerClasses = "";
  let imageWrapperClasses = "relative w-full overflow-hidden rounded-3xl bg-border";
  
  if (variant === 'home') {
    containerClasses = "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8";
    imageWrapperClasses += " h-[150px] md:h-[250px]";
  } else if (variant === 'detail') {
    containerClasses = "w-full";
    imageWrapperClasses += " h-[120px] md:h-[200px]";
  } else if (variant === 'sidebar') {
    containerClasses = "w-full";
    imageWrapperClasses += " h-[400px] md:h-[600px] !rounded-xl"; // taller for sidebar
  }

  return (
    <section 
      className={containerClasses}
      role="region" 
      aria-label="Anúncios em destaque"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={imageWrapperClasses}>
        {ads.map((ad, index) => (
          <Link 
            key={ad.id} 
            href={ad.linkUrl}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {failedImages.has(ad.id) ? (
              // Fallback visual quando a imagem falha no carregamento
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[var(--surface)] to-[var(--border)]">
                <span className="text-muted text-sm">Anúncio Patrocinado</span>
              </div>
            ) : (
              <Image
                src={ad.imageUrl}
                alt={`Anúncio Patrocinado ${index + 1}`}
                fill
                unoptimized
                className="object-cover"
                priority={index === 0}
                onError={() => handleImageError(ad.id)}
              />
            )}
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
                  index === currentIndex ? 'bg-brand w-6' : 'bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

