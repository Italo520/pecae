import { z } from 'zod';

export const listingCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  city: z.string(),
  state: z.string(),
  partsAvailable: z.number(),
  createdAt: z.string(),
  imageUrl: z.string(),
  imageCount: z.number(),
  sponsored: z.boolean().optional(),
  verifiedSeller: z.boolean().optional(),
});

export const adBannerSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  linkUrl: z.string(),
  placement: z.string(),
});

export const vehicleCategorySchema = z.object({
  slug: z.string(),
  name: z.string(),
  count: z.number(),
  icon: z.string(),
});

export type ListingCard = z.infer<typeof listingCardSchema>;
export type AdBanner = z.infer<typeof adBannerSchema>;
export type VehicleCategory = z.infer<typeof vehicleCategorySchema>;

