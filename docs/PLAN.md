# Plano de Trabalho: M08 — Chat e Negociação

Este documento define o plano detalhado para o desenvolvimento e implementação do módulo M08, que gerencia a comunicação em tempo real entre comprador e vendedor no PECAÊ.

---

## 🎯 Objetivos & Critérios de Sucesso
1. **Comunicação Segura**: Chat exclusivo entre comprador e vendedor por anúncio.
2. **REST Endpoints**: CRUD completo de salas e mensagens.
3. **Persistência**: Histórico persistido no Postgres via Prisma.
4. **Realtime Local**: Implementação de Polling Inteligente / SSE no backend e frontend para tempo real em desenvolvimento.

---

## 💻 Tipo de Projeto & Tech Stack
- **Tipo:** Full Stack (API NestJS + App Expo)
- **Tech Stack:**
  - Backend: NestJS + Prisma ORM + PostgreSQL + BullMQ
  - Mobile: React Native (Expo) + Expo Router

---

## 📁 Arquivos Afetados / A Criar

### Backend:
- `apps/api/src/chat/chat.module.ts` (Novo)
- `apps/api/src/chat/chat.service.ts` (Novo)
- `apps/api/src/chat/chat.controller.ts` (Novo)
- `apps/api/src/chat/dto/create-room.dto.ts` (Novo)
- `apps/api/src/chat/dto/send-message.dto.ts` (Novo)

### Mobile:
- `apps/mobile/app/(tabs)/mensagens.tsx` (Novo/Atualizar)
- `apps/mobile/app/chat/[roomId].tsx` (Novo)

---

## 🛠️ Task Breakdown (Execução Individual)

### Fase 1: Backend (Database & API)
#### [x] M08-T01-ST01: Schema Prisma
- **Agente:** `database-architect`
- **Ação:** Adicionar tabelas `ChatRoom`, `ChatMessage` e `ChatRead` no `schema.prisma`. (Concluído)

#### [x] M08-T01-ST02: ChatService & Controller
- **Agente:** `backend-specialist`
- **Ação:** Endpoints `POST /chat/rooms`, `GET /chat/rooms`, `GET /chat/rooms/:id/messages`, `POST /chat/rooms/:id/messages`. (Concluído)

#### [x] M08-T01-ST03: WebSocket Gateway / SSE
- **Agente:** `backend-specialist`
- **Ação:** Criar suporte para tempo real (Endpoints SSE + Polling de fallback em RN). (Concluído)

### Fase 2: Mobile (UI & Integração)
#### [x] M08-T02-ST01: Tela de Lista de Conversas
- **Agente:** `frontend-specialist`
- **Ação:** Implementar aba Mensagens (`mensagens.tsx`) com badge de não lidas. (Concluído)

#### [x] M08-T02-ST02: Tela de Chat 1:1
- **Agente:** `frontend-specialist`
- **Ação:** Tela `app/chat/[roomId].tsx` com FlatList invertida e envio de mensagens. (Concluído)

---

## ✅ Execução Completa
Módulo finalizado com sucesso.
