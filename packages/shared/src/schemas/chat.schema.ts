import { z } from 'zod';

export const chatInterlocutorSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  avatar: z.string().nullable().optional(),
});

export type ChatInterlocutor = z.infer<typeof chatInterlocutorSchema>;

export const chatUltimaMensagemSchema = z.object({
  conteudo: z.string(),
  remetenteId: z.string().uuid(),
  criadaEm: z.string().datetime(),
});

export type ChatUltimaMensagem = z.infer<typeof chatUltimaMensagemSchema>;

export const salaChatSchema = z.object({
  id: z.string().uuid(),
  anuncioId: z.string().uuid().nullable().optional(),
  veiculoId: z.string().uuid().nullable().optional(),
  tituloDaConversa: z.string(),
  miniaturaDaConversa: z.string().nullable().optional(),
  vendedorId: z.string().uuid(),
  interlocutor: chatInterlocutorSchema,
  ultimaMensagem: chatUltimaMensagemSchema.nullable().optional(),
  naoLidos: z.number().int().nonnegative(),
  atualizadaEm: z.string(),
  anuncioStatus: z.string().nullable().optional(),
  anuncioVendidoEm: z.string().nullable().optional(),
});

export type SalaChat = z.infer<typeof salaChatSchema>;

export const mensagemChatSchema = z.object({
  id: z.string().uuid(),
  salaId: z.string().uuid(),
  remetenteId: z.string().uuid(),
  conteudo: z.string(),
  criadaEm: z.string(),
  lido: z.boolean().optional(),
});

export type MensagemChat = z.infer<typeof mensagemChatSchema>;

export const cursorMensagensSchema = z.object({
  itens: z.array(mensagemChatSchema),
  proximoCursor: z.string().nullable().optional(),
});

export type CursorMensagens = z.infer<typeof cursorMensagensSchema>;

export const enviarMensagemRequisicaoSchema = z.object({
  conteudo: z.string().min(1, 'Mensagem não pode ser vazia').max(2000, 'Mensagem muito longa'),
});

export type EnviarMensagemRequisicao = z.infer<typeof enviarMensagemRequisicaoSchema>;

export const criarSalaRequisicaoSchema = z.object({
  anuncioId: z.string().uuid().optional(),
  veiculoId: z.string().uuid().optional(),
  vendedorId: z.string().uuid(),
});

export type CriarSalaRequisicao = z.infer<typeof criarSalaRequisicaoSchema>;
