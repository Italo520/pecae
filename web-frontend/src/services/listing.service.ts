import { z } from 'zod';
import { ListingCard, VehicleCategory, listingCardSchema, vehicleCategorySchema } from '@/types/listing.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export async function fetchFeaturedListings(limit = 12): Promise<ListingCard[]> {
  try {
    const res = await fetch(`${API_URL}/listings/recommended?limit=${limit}`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch featured listings: ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    return z.array(listingCardSchema).parse(data);
  } catch (error) {
    console.error('Error in fetchFeaturedListings:', error);
    return [];
  }
}

export async function fetchVehicleCategories(): Promise<VehicleCategory[]> {
  try {
    const res = await fetch(`${API_URL}/catalog/vehicle-categories`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch vehicle categories: ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    return z.array(vehicleCategorySchema).parse(data);
  } catch (error) {
    console.error('Error in fetchVehicleCategories:', error);
    return [];
  }
}

