import { z } from 'zod';

export const vehicleCreateSchema = z.object({
  marcaNome: z.string().min(1, 'A marca é obrigatória'),
  modeloNome: z.string().min(1, 'O modelo é obrigatório'),
  anoNome: z.string().min(1, 'O ano é obrigatório'),
  versaoNome: z.string().optional().nullable(),
  brandCode: z.string().optional(),
  modelCode: z.string().optional(),
  yearCode: z.string().optional(),
  cor: z.string().min(1, 'A cor é obrigatória').max(50, 'A cor não pode ter mais de 50 caracteres'),
  cidade: z.string().min(1, 'A cidade é obrigatória').max(100, 'A cidade não pode ter mais de 100 caracteres'),
  estado: z.string().length(2, 'O estado deve ter exatamente 2 caracteres'),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  tipoCombustivel: z.string().optional().nullable(), // Ex: GASOLINA, ETANOL, FLEX, DIESEL
  quilometragem: z.number().nonnegative('A quilometragem não pode ser negativa').optional().nullable(),
  pecasDisponiveis: z.array(z.string()).default([]),
});

export type VehicleCreateInput = z.infer<typeof vehicleCreateSchema>;

export const vehicleUpdateSchema = z.object({
  placa: z.string().max(20, 'A placa não pode ter mais de 20 caracteres').optional().nullable(),
  cor: z.string().max(50, 'A cor não pode ter mais de 50 caracteres').optional().nullable(),
  cidade: z.string().max(100, 'A cidade não pode ter mais de 100 caracteres').optional().nullable(),
  estado: z.string().length(2, 'O estado deve ter exatamente 2 caracteres').optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  tipoCombustivel: z.string().optional().nullable(),
  quilometragem: z.number().nonnegative('A quilometragem não pode ser negativa').optional().nullable(),
  pecasDisponiveis: z.array(z.string()).optional(),
});

export type VehicleUpdateInput = z.infer<typeof vehicleUpdateSchema>;

export const vehicleSearchSchema = z.object({
  marcaNome: z.string().optional().nullable(),
  modeloNome: z.string().optional().nullable(),
  versaoNome: z.string().optional().nullable(),
  anoMin: z.number().optional().nullable(),
  anoMax: z.number().optional().nullable(),
  q: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().length(2).optional().nullable(),
  tipoCombustivel: z.string().optional().nullable(),
  quilometragemMax: z.number().optional().nullable(),
  pecaCategoriaSlug: z.string().optional().nullable(),
  limite: z.number().optional().nullable(),
  pagina: z.number().optional().nullable(),
});

export type VehicleSearchInput = z.infer<typeof vehicleSearchSchema>;
