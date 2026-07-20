import { z } from 'zod';

export const listingCardSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().optional(),
  status: z.string(),
  visualizacoes: z.number().default(0),
  marcaNome: z.string(),
  modeloNome: z.string(),
  versaoNome: z.string().optional(),
  anoFabricacao: z.number(),
  cor: z.string().optional(),
  cidade: z.string(),
  estado: z.string().length(2),
  urlFotoPrincipal: z.string().url().nullable().optional(),
  nomeVendedor: z.string(),
  vendedorVerificado: z.boolean().default(false),
  perfilVendedorId: z.string().optional(),
  patrocinadoAtivo: z.boolean().default(false),
  publicadoEm: z.string().optional(),
  pecasDisponiveis: z.array(z.string()).optional(),
});

export type ListingCard = z.infer<typeof listingCardSchema>;

export const paginationMetaSchema = z.object({
  currentPage: z.number(),
  totalPages: z.number(),
  pageSize: z.number(),
  totalElements: z.number(),
  isLast: z.boolean(),
});

export const paginatedListingsSchema = z.object({
  data: z.array(listingCardSchema),
  meta: paginationMetaSchema,
});

export type PaginatedListings = z.infer<typeof paginatedListingsSchema>;
