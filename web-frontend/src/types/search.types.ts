import { z } from 'zod';
import { listingCardSchema, ListingCard } from './listing.types';

export const vehicleSearchInputSchema = z.object({
  query: z.string().optional(),
  vehicleCategory: z.string().optional(),
  brandId: z.string().optional(),
  modelId: z.string().optional(),
  year: z.string().optional(), // using string to easily read from URL searchParams
  versionId: z.string().optional(),
  state: z.string().optional(),
  page: z.number().optional().default(1),
  sort: z.string().optional(),
});

export type VehicleSearchInput = z.infer<typeof vehicleSearchInputSchema>;

export interface PaginatedListings {
  data: ListingCard[];
  meta: {
    page: number;
    perPage: number;
    total: number;
    hasNextPage: boolean;
  };
}
