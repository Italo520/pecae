import { notFound } from 'next/navigation';
import { fetchListingById, fetchFeaturedListings } from '@/services/listing.service';
import { VehicleDetailView } from '@/components/vehicle/VehicleDetailView';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';
// Tempo de revalidação em segundos para a página via ISR (1 hora)
export const revalidate = 3600; 
// Permite que páginas não geradas no build time sejam geradas on-demand
export const dynamicParams = true;

interface PageProps {
  params: {
    id: string;
  };
}

// Gera metadata para SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const listing = await fetchListingById(params.id);
    
    if (!listing) {
      return {
        title: 'Veículo | PECAÊ',
        description: 'Anúncio de veículo na PECAÊ.',
      };
    }

    return {
      title: `${listing.title} | PECAÊ Sucatas`,
      description: `Sucata de ${listing.title}. ${listing.partsAvailable.length} categorias de peças disponíveis em ${listing.city}, ${listing.state}.`,
      openGraph: {
        title: `${listing.title} | PECAÊ`,
        description: `Peças para ${listing.title} em ${listing.city}-${listing.state}`,
        images: listing.photos && listing.photos.length > 0 ? [listing.photos[0].url] : [],
      },
    };
  } catch (err) {
    return {
      title: 'Veículo | PECAÊ',
      description: 'Anúncio de veículo na PECAÊ.',
    };
  }
}

// SSG: Gera os 100 anúncios mais recentes no build time
export async function generateStaticParams() {
  try {
    // Simulando busca dos 100 mais recentes buscando os "recomendados" por agora
    // Numa API real chamariamos algo como /listings/recent?limit=100
    const recentListings = await fetchFeaturedListings(100);
    
    return recentListings.map((listing) => ({
      id: listing.id,
    }));
  } catch (error) {
    console.error('Falha ao gerar rotas estáticas:', error);
    return [];
  }
}

import { fetchBannerAds } from '@/services/ads.service';

export default async function VehicleDetailPage({ params }: PageProps) {
  let listing = null;
  let ads: any[] = [];

  try {
    const [listingResult, adsResult] = await Promise.allSettled([
      fetchListingById(params.id),
      fetchBannerAds('LISTING_DETAIL_TOP', 1)
    ]);
    
    if (listingResult.status === 'fulfilled') {
      listing = listingResult.value;
    }
    if (adsResult.status === 'fulfilled') {
      ads = adsResult.value || [];
    }
  } catch (err) {
    console.error('Error loading listing detail page:', err);
  }

  if (!listing) {
    notFound();
  }

  return <VehicleDetailView listing={listing} ads={ads} />;
}
