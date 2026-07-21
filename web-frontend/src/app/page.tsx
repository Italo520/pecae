import React, { Suspense } from 'react';
import { HeroSection } from '@/components/home/HeroSection';
import { VehicleCategoryBar } from '@/components/home/VehicleCategoryBar';
import { BannerCarousel } from '@/components/home/BannerCarousel';
import { PaginatedListingGrid } from '@/components/home/PaginatedListingGrid';
import { ListingGridSkeleton } from '@/components/home/ListingGridSkeleton';
import { RecentlyViewed } from '@/components/home/RecentlyViewed';
import { SellerCTA } from '@/components/home/SellerCTA';
import { fetchFeaturedListings, fetchVehicleCategories } from '@/services/listing.service';
import { fetchBannerAds } from '@/services/ads.service';

export const dynamic = 'force-dynamic'; // E2E needs live data

async function getHomeData() {
  const [listings, categories, ads] = await Promise.all([
    fetchFeaturedListings(20, 0),
    fetchVehicleCategories(),
    fetchBannerAds('HOME_TOP', 3),
  ]);
  return { listings, categories, ads };
}

export default async function HomePage() {
  const { listings, categories, ads } = await getHomeData();

  return (
    <>
      {ads.length > 0 && (
        <Suspense fallback={<div className="h-[250px] w-full bg-[var(--surface)] animate-pulse" />}>
          <BannerCarousel ads={ads} />
        </Suspense>
      )}

      <HeroSection />

      {categories.length > 0 && (
        <VehicleCategoryBar categories={categories} />
      )}

      <Suspense fallback={<ListingGridSkeleton count={8} />}>
        <PaginatedListingGrid initialListings={listings} title="Veículos em Destaque" />
      </Suspense>

      <RecentlyViewed />
      
      <SellerCTA />
    </>
  );
}
