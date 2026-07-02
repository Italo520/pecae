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

interface VehicleDetailViewProps {
  listing: ListingDetail;
}

export function VehicleDetailView({ listing }: VehicleDetailViewProps) {
  // Adiciona ao recém vistos no lado do cliente
  const imageUrl = listing.photos.find(p => p.isMain)?.url || listing.photos[0]?.url || '';

  return (
    <div className="min-h-screen bg-white">
      <RecentlyViewedTracker id={listing.id} title={listing.title} imageUrl={imageUrl} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Row 1: Top Navigation and Info */}
        <div className="mb-6">
          <Breadcrumb brand={listing.brand} model={listing.model} year={listing.year} />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mt-2">
            {listing.title}
          </h1>
          <SocialProof views={listing.views} createdAt={listing.createdAt} />
        </div>

        {/* Layout Grid: 2/3 Content | 1/3 Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content Area (Left) */}
          <div className="w-full lg:w-2/3 space-y-8">
            <PhotoGallery photos={listing.photos} title={listing.title} />
            
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 border-b border-gray-100 pb-2">Sobre este veículo</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Marca</p>
                  <p className="font-semibold text-gray-900">{listing.brand}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Modelo</p>
                  <p className="font-semibold text-gray-900">{listing.model}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Ano</p>
                  <p className="font-semibold text-gray-900">{listing.year}</p>
                </div>
                {listing.version && (
                  <div>
                    <p className="text-sm text-gray-500">Versão</p>
                    <p className="font-semibold text-gray-900">{listing.version}</p>
                  </div>
                )}
                {listing.color && (
                  <div>
                    <p className="text-sm text-gray-500">Cor</p>
                    <p className="font-semibold text-gray-900">{listing.color}</p>
                  </div>
                )}
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-6">Descrição</h3>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                {listing.description || 'O vendedor não adicionou uma descrição.'}
              </p>
            </div>

            <PartsList parts={listing.partsAvailable} />
          </div>

          {/* Sticky Sidebar Area (Right) */}
          <div className="w-full lg:w-1/3">
            <div className="sticky top-6">
              <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6">
                <SellerCard seller={listing.seller} />
                <ContactCTA listingId={listing.id} sellerId={listing.seller.id} whatsapp={listing.seller.whatsapp} sellerName={listing.seller.name} />
                
                <div className="mt-6 pt-6 border-t border-gray-100">
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
