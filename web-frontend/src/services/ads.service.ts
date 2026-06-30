import { z } from 'zod';
import { AdBanner, adBannerSchema } from '@/types/listing.types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api';

export async function fetchBannerAds(placement: string, limit = 3): Promise<AdBanner[]> {
  try {
    // A API Java serve um banner por vez baseado no posicionamento
    const res = await fetch(`${API_URL}/ads/serve/${placement.toUpperCase()}`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      if (res.status === 204) return []; // No Content (nenhum banner ativo)
      console.error(`Failed to fetch banner ads: ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    
    // Adapter do RespostaAdServido (Java) para AdBanner (Next.js)
    const adaptedBanner = {
      id: data.criativoId || '1',
      imageUrl: data.urlImagem || '',
      linkUrl: data.urlDestino || '#',
      placement: (data.placement || placement).toLowerCase(),
    };

    const parsed = adBannerSchema.parse(adaptedBanner);
    return [parsed]; // O front espera um array
  } catch (error) {
    console.error('Error in fetchBannerAds:', error);
    return [];
  }
}
