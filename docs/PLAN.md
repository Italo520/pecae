# Plano de Trabalho: M12 — Analytics e Dashboard

Este documento define o plano detalhado para o desenvolvimento e implementação do módulo M12, responsável pela coleta e exibição de métricas de anúncios e plataforma para vendedores e administradores.

---

## 🎯 Objetivos & Critérios de Sucesso
1. **Coleta Eficiente e LGPD**: Registrar visualizações (views) de anúncios de forma assíncrona com anonimização via hash SHA-256 de IPs usando salt estático em `.env` (`ANALYTICS_HASH_SALT`).
2. **Aggregates Pré-calculados**: Utilizar BullMQ cron para processar métricas pesadas a cada 6h sem degradar performance em tempo real.
3. **UX com Gráficos Fluidos**: Renderizar painéis interativos no app mobile.
4. **Fallback Contas Novas**: Exibir guia incentivando o cadastro de anúncios quando as métricas forem zeradas.

---

## 💻 Tipo de Projeto & Tech Stack
- **Tipo:** Full Stack (NestJS API + Workers + App Expo Mobile)
- **Tech Stack:** 
  - NestJS + Prisma
  - BullMQ (Fila e Cron agendado)
  - Mobile: Victory Native (Gráficos) ou similar compatível

---

## 🛠️ Task Breakdown (Execução Individual)

### [ ] M12-T01: Schema Prisma (Analytics & Aggregates)
- **Agente:** `database-architect`
- **Ação:** Criar models `ListingView` (dedup 24h por IP hasheado) e `ListingStats` (cache aggregates).
- **Subtasks:**
  - Adicionar models no `schema.prisma`.
  - Executar migrations locais.

### [ ] M12-T02: AnalyticsController (Endpoints & Registro)
- **Agente:** `backend-specialist`
- **Ação:** Implementar endpoints REST essenciais:
  - `POST /listings/:id/view` (Fire-and-forget via BullMQ).
  - `GET /analytics/seller/me` (Série temporal de views + cards).
  - `GET /analytics/admin` (Métricas globais protegidas por Role Admin).

### [ ] M12-T03: BullMQ Cron (Recálculo Periódico)
- **Agente:** `backend-specialist`
- **Ação:** Criar `RecalcMetricsWorker` que roda a cada 6h para processar e atualizar `ListingStats` e `SellerStats`.

### [ ] M12-T04: Dashboard Analytics Vendedor (Mobile Interface)
- **Agente:** `frontend-specialist` / `mobile-developer`
- **Ação:** Criar aba `app/(seller)/analytics.tsx` com:
  - SegmentedControl (7d / 30d / 90d).
  - Cards (Views, Chats, Conversão).
  - Gráfico de linha temporal.
  - Empty state com guia interativo para novos vendedores.

### [ ] M12-T05: Dashboard Analytics Admin (Mobile Interface)
- **Agente:** `frontend-specialist` / `mobile-developer`
- **Ação:** Integrar métricas do sistema como um todo no painel de moderação/admin existente (`app/(admin)` ou similar).


---

## 🏁 Critérios de Saída
Validação via scripts e aprovação dos painéis.
