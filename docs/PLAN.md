# Plano de Trabalho: M06 — Avaliações e Reputação

Este documento define o plano detalhado para a implementação do módulo M06, permitindo que compradores avaliem vendedores após negociações.

---

## 🎯 Objetivos & Critérios de Sucesso
1. **Integridade dos Dados:** Constraint de unicidade por `chatRoomId` e validação de rating (1-5) no banco e na API.
2. **Segurança & LGPD:** Anonimização dos nomes dos compradores tanto no Backend quanto no Frontend.
3. **Regra de Negócio:** Avaliação disponível apenas se houver interação no chat.

---

## 💻 Tipo de Projeto & Tech Stack
- **Tipo:** Full Stack (API NestJS + App Expo)
- **Tech Stack:**
  - Backend: NestJS + Prisma ORM + PostgreSQL
  - Mobile: React Native (Expo) + Expo Router
  - Queue: BullMQ

---

## 📁 Arquivos Afetados
- `apps/api/prisma/schema.prisma`
- `apps/api/src/modules/review/...` (A ser criado)
- `apps/mobile/app/chat/[roomId]/avaliar.tsx` (A ser criado)
- `apps/mobile/app/seller/[id].tsx` (Atualizar perfil)

---

## 🛠️ Task Breakdown (Execução Individual)

### Fase 1: Backend & Banco de Dados (P0)

#### [x] M06-T01-ST01: Schema Prisma — Review & SellerStats
- **Agente:** `database-architect`
- **Ação:** Criar model `Review` e atualizar `SellerStats`. Adicionar CHECK constraint via SQL raw.
- **INPUT:** `apps/api/prisma/schema.prisma`
- **OUTPUT:** Migration aplicada e schema atualizado.
- **VERIFY:** `npx prisma migrate dev` executa sem erros.

#### [x] M06-T01-ST02: API — CRUD de Avaliações
- **Agente:** `backend-specialist`
- **Ação:** Implementar endpoints POST /reviews e GET /sellers/:id/reviews. Validar interação e anonimização.
- **INPUT:** Prisma Service.
- **OUTPUT:** Endpoints funcionais.
- **VERIFY:** Testes manuais/unitários.

#### [x] M06-T01-ST03: Worker BullMQ
- **Agente:** `backend-specialist`
- **Ação:** Criar worker para recálculo assíncrono do rating médio.
- **INPUT:** BullMQ config.
- **OUTPUT:** Job processor ativo.
- **VERIFY:** `SellerStats` atualizado após nova review.

### Fase 2: Mobile (P2)

#### [ ] M06-T02-ST01: Tela/Modal de Avaliação
- **Agente:** `mobile-developer`
- **Ação:** Componente `StarRatingPicker` e lógica no chat.
- **INPUT:** Chat screen.
- **OUTPUT:** UI interativa.
- **VERIFY:** Visualização no Expo.

#### [ ] M06-T02-ST02: Exibição no Perfil do Vendedor
- **Agente:** `mobile-developer`
- **Ação:** Renderizar reviews anonimizadas no perfil.
- **INPUT:** Perfil do vendedor.
- **OUTPUT:** UI atualizada.
- **VERIFY:** Visualização no Expo.

---

## 🔍 Phase X: Verificação Final
- [ ] Lint & Type Check: `npm run lint`
- [ ] Testes de Integração
