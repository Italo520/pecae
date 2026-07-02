import Link from 'next/link';
import Image from 'next/image';
import { fetchFeaturedListings } from '@/services/listing.service';

interface SimilarVehiclesProps {
  currentId: string;
  brand: string;
  model: string;
}

export async function SimilarVehicles({ currentId, brand, model }: SimilarVehiclesProps) {
  // Simulação de busca de similares. No mundo real, passaríamos a marca/modelo para a API.
  // Por enquanto, usamos a listagem em destaque filtrando o veículo atual.
  const allListings = await fetchFeaturedListings(5);
  const similarListings = allListings.filter(l => l.id !== currentId).slice(0, 4);

  if (!similarListings || similarListings.length === 0) return null;

  return (
    <div className="mt-16 pt-8 border-t border-border">
      <h2 className="text-2xl font-bold font-display text-foreground mb-6">Veículos Similares ({brand} {model})</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {similarListings.map(listing => (
          <Link href={`/veiculo/${listing.id}`} key={listing.id} className="group block bg-surface border border-border rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 backdrop-blur-md">
            <div className="relative h-48 w-full bg-background overflow-hidden">
              <Image 
                src={listing.imageUrl || '/placeholder-car.jpg'} 
                alt={listing.title} 
                fill 
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-md">
                {listing.year}
              </div>
            </div>
            
            <div className="p-5">
              <h3 className="font-bold font-display text-foreground group-hover:text-brand transition-colors line-clamp-2">
                {listing.title}
              </h3>
              <p className="text-sm text-muted mt-1">{listing.city}, {listing.state}</p>
              
              <div className="mt-4 flex items-center text-sm font-bold text-brand">
                Ver detalhes
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
