import { z } from 'zod';
import { AdBanner, adBannerSchema } from '@/types/listing.types';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';

/**
 * Banners locais de fallback por placement.
 * Utilizados quando a API retorna URLs de placeholder quebradas (ex: via.placeholder.com)
 * ou quando a API está indisponível.
 */
const FALLBACK_BANNERS: Record<string, AdBanner> = {
  home_top: {
    id: 'fallback-home',
    imageUrl: '/banners/pecas-originais.png',
    linkUrl: '/busca',
    placement: 'home_top',
  },
  home_hero: {
    id: 'fallback-hero',
    imageUrl: '/banners/pecas-originais.png',
    linkUrl: '/busca',
    placement: 'home_hero',
  },
  search_sidebar: {
    id: 'fallback-search',
    imageUrl: '/banners/pneus-promocao.png',
    linkUrl: '/busca?query=pneus',
    placement: 'search_sidebar',
  },
  listing_detail_top: {
    id: 'fallback-detail',
    imageUrl: '/banners/seguro-auto.png',
    linkUrl: '#seguro',
    placement: 'listing_detail_top',
  },
};

/**
 * Verifica se uma URL de imagem é inválida (placeholder offline ou vazia).
 */
function isUrlBroken(url: string): boolean {
  if (!url || url.trim() === '') return true;
  if (url.includes('via.placeholder.com')) return true;
  if (url.includes('placeholder.com')) return true;
  return false;
}

export async function fetchBannerAds(placement: string, limit = 3): Promise<AdBanner[]> {
  const placementKey = placement.toLowerCase();

  try {
    // A API Java serve um banner por vez baseado no posicionamento
    const res = await fetch(`${API_URL}/ads/serve/${placement.toUpperCase()}`, {
      cache: 'no-store',
    });
    
    if (res.status === 204) {
      // Sem banner ativo na API — usar fallback local se existir
      const fallback = FALLBACK_BANNERS[placementKey];
      return fallback ? [fallback] : [];
    }

    if (!res.ok) {
      console.error(`Failed to fetch banner ads: ${res.statusText}`);
      const fallback = FALLBACK_BANNERS[placementKey];
      return fallback ? [fallback] : [];
    }

    const text = await res.text();
    if (!text || text.trim() === '') {
      const fallback = FALLBACK_BANNERS[placementKey];
      return fallback ? [fallback] : [];
    }
    const data = JSON.parse(text);
    
    // Adapter do RespostaAdServido (Java) para AdBanner (Next.js)
    let imageUrl = data.urlImagem || '';

    // Substituir URLs de placeholder quebradas por banners locais
    if (isUrlBroken(imageUrl)) {
      const fallback = FALLBACK_BANNERS[placementKey];
      imageUrl = fallback?.imageUrl || '/banners/pecas-originais.png';
    }

    const adaptedBanner = {
      id: data.criativoId || '1',
      imageUrl,
      linkUrl: data.urlDestino || '#',
      placement: (data.placement || placement).toLowerCase(),
    };

    const parsed = adBannerSchema.parse(adaptedBanner);
    console.log('[fetchBannerAds] Final ads returned:', [parsed]);
    return [parsed]; // O front espera um array
  } catch (error) {
    console.error('Error in fetchBannerAds:', error);
    // Fallback graceful quando a API está completamente indisponível
    const fallback = FALLBACK_BANNERS[placementKey];
    console.log('[fetchBannerAds] Returning fallback due to error:', [fallback]);
    return fallback ? [fallback] : [];
  }
}
