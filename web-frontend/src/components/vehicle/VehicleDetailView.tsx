import { ListingDetail } from '@/types/listing.types';
import { Breadcrumb } from './Breadcrumb';
import { PhotoGallery } from './PhotoGallery';
import { SocialProof } from './SocialProof';
import { PartsList } from './PartsList';
import { SellerCard } from './SellerCard';
import { ContactCTA } from './ContactCTA';
import { ShareButton } from './ShareButton';
import { ReportButton } from './ReportButton';
import { SimilarVehicles } from './SimilarVehicles';
import { RecentlyViewedTracker } from './RecentlyViewedTracker';

import { AdBanner } from '@/types/listing.types';

interface VehicleDetailViewProps {
  listing: ListingDetail;
  ads?: AdBanner[];
}

import { BannerCarousel } from '@/components/home/BannerCarousel';

export function VehicleDetailView({ listing, ads = [] }: VehicleDetailViewProps) {
  // Adiciona ao recém vistos no lado do cliente
  const imageUrl = listing.photos.find(p => p.isMain)?.url || listing.photos[0]?.url || '';

  return (
    <div className="min-h-screen bg-background">
      <RecentlyViewedTracker id={listing.id} title={listing.title} imageUrl={imageUrl} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {ads && ads.length > 0 && (
          <div className="mb-6">
            <BannerCarousel ads={ads} variant="detail" />
          </div>
        )}

        {/* Row 1: Top Navigation and Info */}
        <div className="mb-6">
          <Breadcrumb brand={listing.brand} model={listing.model} year={listing.year} />
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-foreground tracking-tight mt-2">
            {listing.title}
          </h1>
          <SocialProof views={listing.views} createdAt={listing.createdAt} />
        </div>

        {/* Layout Grid: 2/3 Content | 1/3 Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area (Left) */}
          <div className="w-full lg:w-2/3 space-y-8">
            <PhotoGallery photos={listing.photos} title={listing.title} />
            
            <div className="bg-surface border border-border rounded-3xl p-6 shadow-sm backdrop-blur-md">
              <h2 className="text-xl font-bold font-display mb-4 text-foreground border-b border-border pb-2">Sobre este veículo</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-6">
                <div>
                  <p className="text-sm text-muted">Marca</p>
                  <p className="font-semibold text-foreground">{listing.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Modelo</p>
                  <p className="font-semibold text-foreground">{listing.model}</p>
                </div>
                <div>
                  <p className="text-sm text-muted">Ano</p>
                  <p className="font-semibold text-foreground">{listing.year}</p>
                </div>
                {listing.version && (
                  <div>
                    <p className="text-sm text-muted">Versão</p>
                    <p className="font-semibold text-foreground">{listing.version}</p>
                  </div>
                )}
                {listing.color && (
                  <div>
                    <p className="text-sm text-muted">Cor</p>
                    <p className="font-semibold text-foreground">{listing.color}</p>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-bold font-display text-foreground mb-2 mt-6">Descrição do Veículo</h3>
              <p className="text-foreground/80 whitespace-pre-line leading-relaxed">
                {listing.description && listing.description !== listing.observacoes
                  ? listing.description
                  : `Sucata doadora de peças ${listing.brand} ${listing.model}${listing.year ? ` (${listing.year})` : ''}. Veículo cadastrado no sistema PECAÊ com garantia de procedência de desmanche credenciado pelo DETRAN.`}
              </p>

              {listing.observacoes && (
                <div className="mt-6 pt-4 border-t border-border">
                  <h3 className="text-lg font-bold font-display text-foreground mb-2">Observações do Vendedor</h3>
                  <p className="text-foreground/80 whitespace-pre-line leading-relaxed">
                    {listing.observacoes}
                  </p>
                </div>
              )}
            </div>

            <PartsList parts={listing.partsAvailable} />
          </div>

          {/* Sticky Sidebar Area (Right) */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-6">
              <div className="bg-surface border border-border shadow-sm rounded-3xl p-6 backdrop-blur-md">
                <SellerCard seller={listing.seller} />
                <ContactCTA listingId={listing.id} sellerId={listing.seller.id} whatsapp={listing.seller.whatsapp} sellerName={listing.seller.name} />
                
                <div className="mt-6 pt-6 border-t border-border">
                  <ShareButton title={`Confira este ${listing.title} na PECAÊ`} />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Row 3: Similar Vehicles and Report */}
        <SimilarVehicles currentId={listing.id} brand={listing.brand} model={listing.model} />
        <ReportButton />
        
      </main>
    </div>
  );
}
