import React from 'react';
import { Skeleton } from '@/components/ui/Skeleton';

export interface ListingGridSkeletonProps {
  count?: number;
}

export function ListingGridSkeleton({ count = 8 }: ListingGridSkeletonProps) {
  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" aria-hidden="true">
      {/* Title skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-48" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="flex flex-col bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden h-[300px]">
            {/* Image area */}
            <Skeleton className="w-full h-[180px] rounded-none" />
            
            {/* Content area */}
            <div className="p-4 flex flex-col gap-3 flex-grow">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
              
              <div className="mt-auto flex flex-col gap-2 pt-2">
                <Skeleton className="h-4 w-1/2" />
                
                <div className="flex justify-between items-center pt-2 border-t border-[var(--border)]">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
