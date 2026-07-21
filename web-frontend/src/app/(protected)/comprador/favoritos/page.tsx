'use client';

import { Heart, Trash2, Search, Car, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useFavorites } from '@/hooks/useFavorites';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { toast } from 'sonner';

export default function FavoritosPage() {
  const { getFavorites, toggleFavorite } = useFavorites();
  const { data: favorites, isLoading } = getFavorites;

  const handleToggleFavorite = (id: string) => {
    toggleFavorite.mutate(id, {
      onSuccess: () => toast.success('Favorito removido'),
      onError: () => toast.error('Erro ao remover favorito'),
    });
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold text-[var(--foreground)] mb-2 flex items-center gap-3">
              <Heart className="w-8 h-8 text-[var(--brand)]" />
              Favoritos
            </h1>
            <p className="text-[var(--muted)]">
              Acompanhe as sucatas e peças que você salvou.
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
            <input 
              type="text" 
              placeholder="Buscar nos favoritos..."
              className="w-full md:w-64 bg-[var(--background)] border border-[var(--border)] rounded-xl pl-10 pr-4 py-2 text-sm text-[var(--foreground)] placeholder-[var(--muted)] focus:outline-none focus:border-[var(--brand)]/50 focus:ring-1 focus:ring-[var(--brand)]/50 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (!Array.isArray(favorites) || favorites.length === 0) ? (
          <EmptyState 
            icon={<Heart className="w-8 h-8" />} 
            title="Nenhum favorito salvo" 
            description="Você ainda não salvou nenhum anúncio. Explore o catálogo e salve seus favoritos!"
            cta={<Link href="/" className="px-5 py-2.5 bg-[var(--brand)] text-[var(--brand-foreground)] rounded-lg font-medium hover:opacity-90 transition-colors">Explorar Catálogo</Link>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav: any) => (
              <div key={fav.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden hover:border-[var(--border-hover)] hover:shadow-md transition-all group flex flex-col">
                {/* Image */}
                <div className="relative h-48 overflow-hidden bg-[var(--background)]">
                  <img 
                    src={fav.listing?.images?.[0] || 'https://via.placeholder.com/600'} 
                    alt={fav.listing?.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <button onClick={() => handleToggleFavorite(fav.listing.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-[var(--brand)] hover:bg-black/70 hover:scale-110 transition-all">
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 text-xs text-[var(--muted)] mb-2">
                    <Calendar className="w-3 h-3" />
                    Salvo em {new Date(fav.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  
                  <h3 className="text-base font-semibold text-[var(--foreground)] mb-1 line-clamp-2">{fav.listing?.title}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-[var(--muted)] mb-4">
                    <Car className="w-3.5 h-3.5" />
                    {fav.listing?.seller?.name || 'Vendedor'}
                  </div>

                  <div className="mt-auto pt-4 border-t border-[var(--border)] flex items-center justify-between">
                    <span className="text-[var(--brand)] font-medium text-lg">
                      {fav.listing?.price ? `R$ ${fav.listing.price}` : 'Sob Consulta'}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleFavorite(fav.listing.id)} className="p-2 text-[var(--muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <Link href={`/`} className="p-2 bg-[var(--brand)]/10 text-[var(--brand)] hover:bg-[var(--brand)]/20 rounded-lg transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
