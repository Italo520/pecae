import type { Metadata } from 'next';
import { fetchSearchResults, fetchBrands } from '@/services/search.service';
import { SearchPageClient } from '@/components/search/SearchPageClient';
import { vehicleSearchInputSchema } from '@/types/search.types';

interface SearchPageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  // If we had brandName in searchParams, we could use it here.
  // For now, let's use the query or a generic title.
  const query = searchParams.query ? String(searchParams.query) : 'Peças e Veículos';
  
  return {
    title: `Busca: ${query} — PECAÊ`,
    description: `Encontre ${query} em desmanches verificados na PECAÊ.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Normalize searchParams for our schema
  const normalizedParams: Record<string, string | number> = {};
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      normalizedParams[key] = value;
    } else if (Array.isArray(value) && value.length > 0) {
      normalizedParams[key] = value[0];
    }
  });

  // Ensure page is number for our initial SSR fetch
  if (normalizedParams.page) {
    normalizedParams.page = parseInt(String(normalizedParams.page), 10);
  }

  // Parse cleanly
  const params = vehicleSearchInputSchema.parse(normalizedParams);

  // Parallel fetch for SSR
  const [results, brands] = await Promise.all([
    fetchSearchResults(params),
    fetchBrands(),
  ]);

  return (
    <SearchPageClient 
      initialResults={results} 
      brands={brands} 
      searchParams={params} 
    />
  );
}
