import React from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { VehicleCategory } from '@/types/listing.types';

export interface VehicleCategoryBarProps {
  categories: VehicleCategory[];
}

export function VehicleCategoryBar({ categories }: VehicleCategoryBarProps) {
  return (
    <section className="w-full border-b border-[var(--border)] bg-[var(--surface)] relative" aria-label="Categorias de Veículos">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ul className="flex items-center gap-6 overflow-x-auto py-4 scrollbar-hide snap-x mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {categories.map((cat) => {
            // Dynamically grab the icon from Lucide
            const IconComponent = (LucideIcons as any)[cat.icon] || LucideIcons.Car;

            return (
              <li key={cat.slug} className="snap-start shrink-0">
                <Link
                  href={`/busca?vehicleCategory=${cat.slug}`}
                  className="flex flex-col items-center justify-center gap-2 px-3 py-2 rounded-[var(--radius-md)] hover:bg-[var(--border)] transition-colors group"
                >
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-[var(--background)] border border-[var(--border)] group-hover:border-[var(--brand)] group-hover:text-[var(--brand)] transition-colors text-[var(--muted)]">
                    <IconComponent size={24} />
                  </div>
                  <span className="text-sm font-medium text-[var(--foreground)]">
                    {cat.name}
                  </span>
                  <span className="text-xs text-[var(--muted)]">
                    {cat.count.toLocaleString('pt-BR')}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
