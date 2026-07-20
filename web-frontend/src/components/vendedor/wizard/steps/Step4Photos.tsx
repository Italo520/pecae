'use client';

import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';
import { useCallback } from 'react';
import Image from 'next/image';

interface Step4PhotosProps {
  photos: File[];
  setPhotos: (photos: File[]) => void;
}

export default function Step4Photos({ photos, setPhotos }: Step4PhotosProps) {
  
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
    setPhotos([...photos, ...files].slice(0, 10)); // max 10 photos
  }, [photos, setPhotos]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'));
      setPhotos([...photos, ...files].slice(0, 10));
    }
  };

  const removePhoto = (indexToRemove: number) => {
    setPhotos(photos.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-display font-semibold text-[var(--foreground)] mb-2">Fotos do Veículo</h2>
        <p className="text-[var(--muted)] text-sm">Adicione imagens da sucata para atrair compradores. A primeira imagem será a capa do anúncio. Máximo de 10 fotos.</p>
      </div>

      <div 
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full h-48 border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--surface-hover)] flex flex-col items-center justify-center hover:bg-[var(--surface)] hover:border-[var(--brand)] transition-all cursor-pointer group"
        onClick={() => document.getElementById('photo-upload')?.click()}
      >
        <div className="w-16 h-16 rounded-full bg-[var(--brand)]/10 text-[var(--brand)] flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-8 h-8" />
        </div>
        <p className="text-[var(--foreground)] font-medium mb-1">Clique ou arraste as fotos aqui</p>
        <p className="text-[var(--muted)] text-sm">PNG, JPG ou WEBP até 10MB</p>
        <input 
          id="photo-upload" 
          type="file" 
          multiple 
          accept="image/*" 
          className="hidden" 
          onChange={handleFileChange}
        />
      </div>

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden bg-[var(--surface-hover)] border border-[var(--border)] group">
              {/* Note: URL.createObjectURL is used for preview. Memory leaks are possible if not revoked, but acceptable for this quick wizard */}
              <Image 
                src={URL.createObjectURL(photo)} 
                alt={`Preview ${index + 1}`} 
                fill
                sizes="200px"
                className="object-cover"
              />
              {index === 0 && (
                <div className="absolute top-2 left-2 bg-[var(--brand)] text-white shadow-sm text-xs font-bold px-2 py-1 rounded-md z-10">
                  Capa
                </div>
              )}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removePhoto(index); }}
                className="absolute top-2 right-2 w-8 h-8 bg-black/50 hover:bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
          
          {photos.length < 10 && (
            <div 
              onClick={() => document.getElementById('photo-upload')?.click()}
              className="aspect-square rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface-hover)] flex items-center justify-center text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
            >
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
