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
    const res = await fetch(`${API_URL}/listings?size=${limit}`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch featured listings: ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    
    // O Spring Boot retorna um objeto Page (com content)
    const content = data.content || [];
    
    // Adapter do RespostaAnuncio (Java) para ListingCard (Next.js)
    const adaptedContent = content.map((item: any) => ({
      id: item.id,
      title: item.titulo || '',
      brand: item.marcaNome || '',
      model: item.modeloNome || '',
      year: item.anoFabricacao || new Date().getFullYear(),
      city: item.cidade || '',
      state: item.estado || '',
      partsAvailable: 0, 
      createdAt: item.publicadoEm || new Date().toISOString(),
      imageUrl: item.urlFotoPrincipal || 'https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg?auto=compress&cs=tinysrgb&w=800',
      imageCount: 1, 
      sponsored: item.patrocinadoAtivo || false,
      verifiedSeller: item.vendedorVerificado || false,
    }));

    return z.array(listingCardSchema).parse(adaptedContent);
  } catch (error) {
    console.error('Error in fetchFeaturedListings:', error);
    return [];
  }
}

export async function fetchVehicleCategories(): Promise<VehicleCategory[]> {
  try {
    const res = await fetch(`${API_URL}/catalog/categories`, {
      next: { revalidate: 60 },
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch vehicle categories: ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    
    // Adapter de RespostaCategoriaPeca (Java) para VehicleCategory (Next.js)
    const adaptedContent = data.map((item: any) => ({
      slug: item.id, // backend retorna id, o front usa slug como key
      name: item.name || '',
      count: 0, // backend não retorna contagem de veículos na categoria ainda
      icon: item.iconUrl || 'car',
    }));

    return z.array(vehicleCategorySchema).parse(adaptedContent);
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
    
    // Mocking do adapter até a rota de detalhes estar 100% igual.
    // Atualmente o listingDetailSchema exige mais dados que o /listings comum
    const adaptedDetail = {
      id: data.id,
      title: data.titulo || '',
      brand: data.marcaNome || '',
      model: data.modeloNome || '',
      year: data.anoFabricacao || new Date().getFullYear(),
      version: data.versaoNome || '',
      color: data.cor || '',
      description: data.descricao || 'Descrição não fornecida.',
      city: data.cidade || '',
      state: data.estado || '',
      createdAt: data.publicadoEm || new Date().toISOString(),
      views: data.visualizacoes || 0,
      photos: [{ id: '1', url: data.urlFotoPrincipal, isMain: true }],
      partsAvailable: [], // TODO: mapear peças do backend
      seller: {
        id: data.perfilVendedorId || '1',
        name: data.nomeVendedor || 'Vendedor',
        memberSince: new Date().toISOString(),
        city: data.cidade || '',
        state: data.estado || '',
      },
      status: data.status || 'ACTIVE',
    };

    return listingDetailSchema.parse(adaptedDetail);
  } catch (error) {
    console.error(`Error in fetchListingById(${id}):`, error);
    return null;
  }
}
