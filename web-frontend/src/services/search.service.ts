import { z } from 'zod';
import { Brand, brandSchema, Model, modelSchema, Version, versionSchema } from '@/types/catalog.types';
import { PaginatedListings, VehicleSearchInput } from '@/types/search.types';
import { listingCardSchema } from '@/types/listing.types';

const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333/api/v1';

export async function fetchBrands(): Promise<Brand[]> {
  try {
    const res = await fetch(`${API_URL}/catalog/brands`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return mockBrands;
    const data = await res.json();
    return z.array(brandSchema).parse(data);
  } catch (error) {
    return mockBrands;
  }
}

export async function fetchModels(brandId: string): Promise<Model[]> {
  try {
    const res = await fetch(`${API_URL}/catalog/brands/${brandId}/models`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return mockModels.filter(m => m.brandId === brandId);
    const data = await res.json();
    return z.array(modelSchema).parse(data);
  } catch (error) {
    return mockModels.filter(m => m.brandId === brandId);
  }
}

export async function fetchVersions(modelId: string, year: string): Promise<Version[]> {
  try {
    // We pass both modelId and year as per the cascading requirement Marca->Modelo->Ano->Versão
    const res = await fetch(`${API_URL}/catalog/models/${modelId}/versions?year=${year}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return (mockVersions as any[]).filter((v: any) => v.modelId === modelId && v.year.toString() === year) as any;
    const data = await res.json();
    return z.array(versionSchema).parse(data);
  } catch (error) {
    return (mockVersions as any[]).filter((v: any) => v.modelId === modelId && v.year.toString() === year) as any;
  }
}

export async function fetchYears(versionId: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_URL}/catalog/versions/${versionId}/years`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((item: any) => ({
      id: item.id,
      name: (item.name || item.year || item.ano || '').toString(),
      fuelType: item.fuelType || 'Flex'
    }));
  } catch (error) {
    return [];
  }
}

export async function fetchPartCategories(): Promise<any[]> {
  try {
    const res = await fetch(`${API_URL}/catalog/categories`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data;
  } catch (error) {
    return [];
  }
}

export async function fetchSearchResults(params: VehicleSearchInput): Promise<PaginatedListings> {
  try {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Mapear campos se necessário
        if (key === 'page') {
          // Spring Boot usa 0-indexed para páginas
          const pVal = parseInt(value.toString());
          query.append('pagina', (pVal - 1).toString());
        } else if (key === 'perPage') {
          query.append('tamanho', value.toString());
        } else {
          query.append(key, value.toString());
        }
      }
    });

    const res = await fetch(`${API_URL}/listings?${query.toString()}`, {
      cache: 'no-store', // Always fresh
    });
    
    if (!res.ok) return generateMockSearchResults(params);
    const data = await res.json();
    
    const content = data.content || [];
    const adaptedListings = content.map((item: any, index: number) => ({
      id: item.id ? String(item.id) : String(index),
      title: item.titulo || 'Veículo',
      brand: item.marcaNome || 'Marca',
      model: item.modeloNome || 'Modelo',
      year: item.anoFabricacao || new Date().getFullYear(),
      city: item.cidade || 'Cidade',
      state: item.estado || 'Estado',
      partsAvailable: item.quantidadePecasDisponiveis || 0,
      createdAt: item.publicadoEm || new Date().toISOString(),
      imageUrl: item.urlFotoPrincipal || 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=600&h=400',
      imageCount: item.fotosCount || 1,
      verifiedSeller: item.vendedorVerificado || false,
      sponsored: item.patrocinado || false
    }));

    return {
      data: adaptedListings,
      meta: {
        page: (data.number || 0) + 1,
        perPage: data.size || 20,
        total: data.totalElements || 0,
        hasNextPage: !data.last
      }
    };
  } catch (error) {
    return generateMockSearchResults(params);
  }
}

export async function fetchSearchSuggestions(q: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_URL}/search/suggestions?q=${encodeURIComponent(q)}`, {
      next: { revalidate: 30 },
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (error) {
    return [];
  }
}

// -------------------------------------------------------------
// Fallback Mocks
// -------------------------------------------------------------

const mockBrands: Brand[] = [
  { id: 'b1', name: 'Honda', vehicleType: 'Carro' },
  { id: 'b2', name: 'Volkswagen', vehicleType: 'Carro' },
  { id: 'b3', name: 'Yamaha', vehicleType: 'Moto' },
];

const mockModels: Model[] = [
  { id: 'm1', brandId: 'b1', name: 'Civic' },
  { id: 'm2', brandId: 'b1', name: 'Fit' },
  { id: 'm3', brandId: 'b2', name: 'Gol' },
];

const mockVersions: any[] = [
  { id: 'v1', modelId: 'm1', year: 2018, name: 'EXL 2.0 16V' },
  { id: 'v2', modelId: 'm1', year: 2018, name: 'Touring 1.5 Turbo' },
  { id: 'v3', modelId: 'm1', year: 2019, name: 'EXL 2.0 16V' },
  { id: 'v4', modelId: 'm2', year: 2015, name: 'LX 1.4' },
];

function generateMockSearchResults(params: VehicleSearchInput): PaginatedListings {
  const page = params.page || 1;
  const perPage = 12;
  const hasNextPage = page < 3; // Simulate 3 pages of mock data

  const mockListings = Array.from({ length: perPage }).map((_, i) => ({
    id: `search-res-${page}-${i}`,
    title: `Veículo de Desmanche - ${params.brandId || 'Marca'}`,
    brand: params.brandId ? 'Honda' : 'Volkswagen',
    model: params.modelId ? 'Civic' : 'Gol',
    year: params.year ? parseInt(params.year.toString()) : 2018,
    city: 'São Paulo',
    state: params.state || 'SP',
    partsAvailable: Math.floor(Math.random() * 50) + 10,
    createdAt: new Date(Date.now() - 86400000 * i).toISOString(),
    imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=600&h=400',
    imageCount: Math.floor(Math.random() * 10) + 1,
    verifiedSeller: i % 3 === 0,
    sponsored: i === 0,
  }));

  return {
    data: mockListings,
    meta: {
      page,
      perPage,
      total: 36,
      hasNextPage
    }
  };
}
