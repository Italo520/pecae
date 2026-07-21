import React from 'react';

export default function VehicleDetailLoading() {
  return (
    <div className="min-h-screen bg-background py-8 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Skeleton */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-16 bg-surface rounded-md" />
          <div className="h-4 w-4 bg-surface rounded-md" />
          <div className="h-4 w-24 bg-surface rounded-md" />
          <div className="h-4 w-4 bg-surface rounded-md" />
          <div className="h-4 w-40 bg-surface rounded-md" />
        </div>

        {/* Title & Badge Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-2">
            <div className="h-8 w-72 sm:w-96 bg-surface border border-border rounded-xl" />
            <div className="h-4 w-48 bg-surface rounded-md" />
          </div>
          <div className="h-10 w-32 bg-surface rounded-full border border-border" />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Image Gallery & Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Big Image Skeleton */}
            <div className="relative aspect-[16/10] w-full bg-surface border border-border rounded-3xl overflow-hidden flex items-center justify-center">
              <div className="w-12 h-12 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            </div>

            {/* Thumbnails Skeleton */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-24 h-18 shrink-0 bg-surface border border-border rounded-xl" />
              ))}
            </div>

            {/* Technical Specs Card Skeleton */}
            <div className="p-6 bg-surface border border-border rounded-3xl space-y-4">
              <div className="h-6 w-40 bg-background rounded-md" />
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="p-3 bg-background rounded-2xl border border-border/50 space-y-2">
                    <div className="h-3 w-16 bg-surface rounded" />
                    <div className="h-5 w-24 bg-surface rounded-md" />
                  </div>
                ))}
              </div>
            </div>

            {/* Available Parts Categories Skeleton */}
            <div className="p-6 bg-surface border border-border rounded-3xl space-y-4">
              <div className="h-6 w-56 bg-background rounded-md" />
              <div className="flex flex-wrap gap-2 pt-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <div key={i} className="h-8 w-28 bg-background border border-border rounded-xl" />
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Seller & Action Card Skeleton */}
          <div className="space-y-6">
            <div className="p-6 bg-surface border border-border rounded-3xl space-y-6 sticky top-24">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-background border border-border" />
                <div className="space-y-2">
                  <div className="h-5 w-36 bg-background rounded-md" />
                  <div className="h-4 w-24 bg-background rounded-md" />
                </div>
              </div>

              <div className="h-12 w-full bg-brand/20 border border-brand/40 rounded-full" />
              <div className="h-12 w-full bg-background border border-border rounded-full" />

              <div className="p-4 bg-background rounded-2xl border border-border/50 space-y-2">
                <div className="h-4 w-32 bg-surface rounded" />
                <div className="h-3 w-full bg-surface rounded" />
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
