import { z } from 'zod';
import { 
  ListingCard, 
  VehicleCategory, 
  ListingDetail,
  listingCardSchema, 
  vehicleCategorySchema,
  listingDetailSchema
} from '@/types/listing.types';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';

export async function fetchFeaturedListings(limit = 12): Promise<ListingCard[]> {
  try {
    const res = await fetch(`${API_URL}/listings?size=${limit}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      console.error(`Failed to fetch featured listings: ${res.statusText}`);
      return [];
    }
    
    const data = await res.json();
    
    // O Spring Boot retorna um objeto Page (com content)
    const content = data.content || [];
    
    // Adapter do RespostaAnuncio (Java) para ListingCard (Next.js)
    const adaptedContent = content.map((item: any, index: number) => ({
      id: item.id ? String(item.id) : String(index),
      title: item.titulo || 'Veículo',
      brand: item.marcaNome || 'Marca',
      model: item.modeloNome || 'Modelo',
      year: item.anoFabricacao || new Date().getFullYear(),
      city: item.cidade || 'Cidade',
      state: item.estado || 'Estado',
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
      next: { revalidate: 300 },
    });
    
    if (!res.ok) {
      if (id.startsWith('search-res-')) {
        return generateMockDetail(id);
      }
      if (res.status === 404) return null;
      console.error(`Failed to fetch listing ${id}: ${res.statusText}`);
      return null;
    }
    
    const data = await res.json();
    
    // Mapeamento de status Java para front
    const statusMap: Record<string, 'ACTIVE' | 'SOLD' | 'INACTIVE' | 'PENDING'> = {
      'PUBLICADO': 'ACTIVE',
      'VENDIDO': 'SOLD',
      'INATIVO': 'INACTIVE',
      'PENDENTE': 'PENDING'
    };

    const mappedStatus = data.status ? statusMap[data.status] || 'ACTIVE' : 'ACTIVE';

    // Mocking do adapter até a rota de detalhes estar 100% igual.
    const adaptedDetail = {
      id: data.id ? String(data.id) : id,
      title: data.titulo || 'Veículo',
      brand: data.marcaNome || 'Marca',
      model: data.modeloNome || 'Modelo',
      year: data.anoFabricacao || new Date().getFullYear(),
      version: data.versaoNome || '',
      color: data.cor || '',
      description: data.descricao || 'Descrição não fornecida.',
      city: data.cidade || 'Cidade',
      state: data.estado || 'Estado',
      createdAt: data.publicadoEm || new Date().toISOString(),
      views: data.visualizacoes || 0,
      photos: [{ id: '1', url: data.urlFotoPrincipal || 'https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg', isMain: true }],
      partsAvailable: data.pecasDisponiveis || [],
      seller: {
        id: data.perfilVendedorId ? String(data.perfilVendedorId) : '1',
        name: data.nomeVendedor || 'Vendedor',
        memberSince: new Date().toISOString(),
        city: data.cidade || 'Cidade',
        state: data.estado || 'Estado',
      },
      status: mappedStatus,
    };

    return listingDetailSchema.parse(adaptedDetail);
  } catch (error) {
    if (id.startsWith('search-res-')) {
      return generateMockDetail(id);
    }
    console.error(`Error in fetchListingById(${id}):`, error);
    return null;
  }
}

function generateMockDetail(id: string): ListingDetail {
  return listingDetailSchema.parse({
    id,
    title: 'Veículo de Desmanche Mockado',
    brand: 'MockBrand',
    model: 'MockModel',
    year: 2020,
    version: '1.0 Flex',
    color: 'Prata',
    description: 'Descrição de teste E2E.',
    city: 'São Paulo',
    state: 'SP',
    createdAt: new Date().toISOString(),
    views: 15,
    photos: [{ id: '1', url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7', isMain: true }],
    partsAvailable: ['MOTOR', 'CAMBIO'],
    seller: {
      id: '123',
      name: 'Vendedor Mock',
      memberSince: new Date().toISOString(),
      city: 'São Paulo',
      state: 'SP',
    },
    status: 'ACTIVE',
  });
}
