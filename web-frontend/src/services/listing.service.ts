import { z } from 'zod';
import { 
  ListingCard, 
  VehicleCategory, 
  ListingDetail,
  listingCardSchema, 
  vehicleCategorySchema,
  listingDetailSchema
} from '@/types/listing.types';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api-pecae.italohub.cloud/api/v1';

export async function fetchFeaturedListings(limit = 20, page = 0): Promise<ListingCard[]> {
  try {
    const res = await fetch(`${API_URL}/listings?size=${limit}&page=${page}`, {
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
      partsAvailable: Array.isArray(item.pecasDisponiveis) ? item.pecasDisponiveis.length : (item.totalPecas || 0), 
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
  // Retorna os tipos de veículos para filtragem rápida na Home Page
  const defaultTypes: VehicleCategory[] = [
    { slug: 'Carro', name: 'Carros', count: 0, icon: 'Car' },
    { slug: 'Moto', name: 'Motos', count: 0, icon: 'Bike' },
    { slug: 'Caminhão', name: 'Caminhões', count: 0, icon: 'Truck' },
    { slug: 'Ônibus', name: 'Ônibus', count: 0, icon: 'Bus' },
    { slug: 'Van', name: 'Vans & Utilitários', count: 0, icon: 'CarFront' },
    { slug: 'Agro', name: 'Agro & Pesados', count: 0, icon: 'Tractor' },
  ];

  return defaultTypes;
}

export async function fetchListingById(id: string): Promise<ListingDetail | null> {
  try {
    const res = await fetch(`${API_URL}/listings/${id}`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
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

    const adaptedDetail = {
      id: data.id ? String(data.id) : id,
      title: data.titulo || `${data.marcaNome || ''} ${data.modeloNome || ''}`.trim() || 'Veículo',
      brand: data.marcaNome || 'Não informada',
      model: data.modeloNome || 'Não informado',
      year: data.anoFabricacao || new Date().getFullYear(),
      version: data.versaoNome || '',
      color: data.cor || '',
      description: data.descricao || 'Sem descrição.',
      observacoes: data.observacoes || null,
      city: data.cidade || '',
      state: data.estado || '',
      createdAt: data.publicadoEm || data.criadoEm || new Date().toISOString(),
      views: data.visualizacoes || 0,
      photos: data.fotos && data.fotos.length > 0 
        ? data.fotos.map((f: any, idx: number) => ({ 
            id: f.id ? String(f.id) : String(idx + 1), 
            url: f.urlFoto || f.url || '', 
            isMain: f.tipo === 'MAIN' || f.ordem === 1 || idx === 0,
            order: f.ordem !== undefined ? f.ordem : idx
          }))
        : [{ id: '1', url: data.urlFotoPrincipal || 'https://images.pexels.com/photos/1164778/pexels-photo-1164778.jpeg', isMain: true, order: 0 }],
      partsAvailable: Array.isArray(data.pecasDisponiveis) 
        ? data.pecasDisponiveis.map((p: any) => typeof p === 'string' ? p : (p.nome || p.codigo || p.id || String(p)))
        : [],
      seller: {
        id: data.perfilVendedorId ? String(data.perfilVendedorId) : 'vendedor',
        name: data.nomeVendedor || 'Vendedor PECAÊ',
        memberSince: data.criadoEm || new Date().toISOString(),
        city: data.cidade || '',
        state: data.estado || '',
        whatsapp: data.telefoneVendedor || undefined
      },
      status: mappedStatus,
    };

    return listingDetailSchema.parse(adaptedDetail);
  } catch (error) {
    console.error('Error in fetchListingById:', error);
    return null;
  }
}
