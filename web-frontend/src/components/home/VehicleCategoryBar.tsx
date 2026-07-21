import React from 'react';
import Link from 'next/link';
import { Car, Bike, Truck, Bus, CarFront, Tractor, LucideIcon } from 'lucide-react';
import { VehicleCategory } from '@/types/listing.types';

export interface VehicleCategoryBarProps {
  categories: VehicleCategory[];
}

const ICON_MAP: Record<string, LucideIcon> = {
  Car,
  Bike,
  Truck,
  Bus,
  CarFront,
  Tractor,
};

export function VehicleCategoryBar({ categories }: VehicleCategoryBarProps) {
  return (
    <section className="w-full border-b border-border bg-surface relative" aria-label="Categorias de Veículos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center py-4">
          <ul 
            className="flex items-center gap-6 sm:gap-8 overflow-x-auto py-2 scrollbar-hide snap-x mandatory max-w-full" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {categories.map((cat) => {
              const IconComponent = ICON_MAP[cat.icon] || Car;

              return (
                <li key={cat.slug} className="snap-start shrink-0">
                  <Link
                    href={`/busca?vehicleCategory=${encodeURIComponent(cat.slug)}`}
                    className="flex flex-col items-center justify-center gap-2.5 px-4 py-2 rounded-2xl hover:bg-background/80 transition-all duration-200 group"
                  >
                    <div className="w-14 h-14 flex items-center justify-center rounded-2xl bg-background border border-border group-hover:border-brand group-hover:text-brand group-hover:scale-105 transition-all duration-200 text-muted shadow-xs">
                      <IconComponent size={26} strokeWidth={1.75} />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-foreground group-hover:text-brand transition-colors text-center">
                      {cat.name}
                    </span>
                    {cat.count > 0 && (
                      <span className="text-xs text-muted font-medium">
                        {cat.count.toLocaleString('pt-BR')}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
