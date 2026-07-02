'use client';

import { useState } from 'react';
import Image from 'next/image';
import { VehiclePhoto } from '@/types/listing.types';

interface PhotoGalleryProps {
  photos: VehiclePhoto[];
  title: string;
}

export function PhotoGallery({ photos, title }: PhotoGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  if (!photos || photos.length === 0) {
    return (
      <div className="w-full h-64 md:h-96 bg-surface border border-border rounded-xl flex items-center justify-center">
        <span className="text-muted">Sem fotos</span>
      </div>
    );
  }

  const sortedPhotos = [...photos].sort((a, b) => {
    if (a.isMain && !b.isMain) return -1;
    if (!a.isMain && b.isMain) return 1;
    return (a.order || 0) - (b.order || 0);
  });

  const nextPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === sortedPhotos.length - 1 ? 0 : prev + 1));
  };

  const prevPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? sortedPhotos.length - 1 : prev - 1));
  };

  return (
    <>
      <div className="relative group rounded-3xl overflow-hidden shadow-sm border border-border bg-black">
        {/* Main Image */}
        <div 
          className="relative w-full h-64 md:h-96 lg:h-[480px] cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        >
          <Image
            src={sortedPhotos[currentIndex].url}
            alt={`${title} - Foto ${currentIndex + 1}`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 800px"
            className="object-contain"
            priority={currentIndex === 0}
          />
        </div>

        {/* Navigation Arrows */}
        {sortedPhotos.length > 1 && (
          <>
            <button 
              onClick={prevPhoto}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              aria-label="Foto anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button 
              onClick={nextPhoto}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white text-black rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
              aria-label="Próxima foto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
            
            {/* Counter Badge */}
            <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
              {currentIndex + 1} / {sortedPhotos.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sortedPhotos.length > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
          {sortedPhotos.map((photo, idx) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(idx)}
              className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors ${
                idx === currentIndex ? 'border-brand' : 'border-transparent hover:border-border'
              }`}
            >
              <Image
                src={photo.url}
                alt={`${title} - Miniatura ${idx + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white"
            onClick={() => setIsLightboxOpen(false)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div className="relative w-full h-full max-w-6xl max-h-screen p-4 flex items-center justify-center">
            <Image
              src={sortedPhotos[currentIndex].url}
              alt={`${title} - Foto ${currentIndex + 1} ampliada`}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {sortedPhotos.length > 1 && (
            <>
              <button 
                onClick={prevPhoto}
                className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button 
                onClick={nextPhoto}
                className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/80 text-sm bg-black/50 px-4 py-2 rounded-full">
                {currentIndex + 1} de {sortedPhotos.length}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
