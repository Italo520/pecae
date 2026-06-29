import { z } from 'zod';
import { AdBanner, adBannerSchema } from '@/types/listing.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export async function fetchBannerAds(placement: string, limit = 3): Promise<AdBanner[]> {
  try {
    const res = await fetch(`${API_URL}/ads?placement=${placement}&limit=${limit}`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch banner ads: ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    return z.array(adBannerSchema).parse(data);
  } catch (error) {
    console.error('Error in fetchBannerAds:', error);
    return [];
  }
}

