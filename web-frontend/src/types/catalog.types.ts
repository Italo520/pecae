import { z } from 'zod';
import { listingCardSchema } from './listing.types';

export const brandSchema = z.object({
  id: z.string(),
  name: z.string(),
  vehicleType: z.string().optional(),
});

export const modelSchema = z.object({
  id: z.string(),
  brandId: z.string(),
  name: z.string(),
});

export const versionSchema = z.object({
  id: z.string(),
  modelId: z.string(),
  year: z.number().optional(),
  name: z.string(),
});

export type Brand = z.infer<typeof brandSchema>;
export type Model = z.infer<typeof modelSchema>;
export type Version = z.infer<typeof versionSchema>;
