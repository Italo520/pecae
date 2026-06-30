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

export const vehiclePhotoSchema = z.object({
  id: z.string(),
  url: z.string(),
  isMain: z.boolean(),
  order: z.number().optional(),
});

export const sellerPublicSchema = z.object({
  id: z.string(),
  name: z.string(),
  rating: z.number().optional(),
  memberSince: z.string(),
  whatsapp: z.string().optional(),
  verified: z.boolean().optional(),
  city: z.string(),
  state: z.string(),
});

export const listingDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  brand: z.string(),
  model: z.string(),
  year: z.number(),
  version: z.string().optional(),
  color: z.string().optional(),
  description: z.string(),
  city: z.string(),
  state: z.string(),
  createdAt: z.string(),
  views: z.number().optional(),
  photos: z.array(vehiclePhotoSchema),
  partsAvailable: z.array(z.string()), // Strings estáticas de categorias/peças disponíveis
  seller: sellerPublicSchema,
  status: z.enum(['ACTIVE', 'SOLD', 'INACTIVE', 'PENDING']),
});

export type VehiclePhoto = z.infer<typeof vehiclePhotoSchema>;
export type SellerPublic = z.infer<typeof sellerPublicSchema>;
export type ListingDetail = z.infer<typeof listingDetailSchema>;
