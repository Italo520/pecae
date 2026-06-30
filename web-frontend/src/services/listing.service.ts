import { z } from 'zod';
import { 
  ListingCard, 
  VehicleCategory, 
  ListingDetail,
  listingCardSchema, 
  vehicleCategorySchema,
  listingDetailSchema
} from '@/types/listing.types';

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

export async function fetchListingById(id: string): Promise<ListingDetail | null> {
  try {
    const res = await fetch(`${API_URL}/listings/${id}`, {
      // Usaremos no ISR. Revalida a cada 5 minutos
      next: { revalidate: 300 },
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      console.error(`Failed to fetch listing ${id}: ${res.statusText}`);
      return null;
    }
    
    const data = await res.json();
    return listingDetailSchema.parse(data);
  } catch (error) {
    console.error(`Error in fetchListingById(${id}):`, error);
    return null;
  }
}
