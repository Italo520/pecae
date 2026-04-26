# Plano de Trabalho: M13 — Anúncios e Publicidade In-App

Este documento define o plano detalhado para o desenvolvimento e implementação do módulo M13, responsável pela monetização via anúncios programáticos (AdMob) e anúncios diretos (Sponsored Listings).

---

## 🎯 Objetivos & Critérios de Sucesso
1. **Monetização Sustentável**: Integrar AdMob para banners e intersticiais sem degradar a UX.
2. **Anúncios Diretos (Sponsored)**: Permitir que vendedores destaquem veículos no topo da busca.
3. **Tracking Confiável**: Registrar impressões e cliques de forma assíncrona (BullMQ).
4. **LGPD Compliance**: Solicitar consentimento via CMP antes de carregar anúncios.

---

## 💻 Decisões de Arquitetura (Socratic Gate)
- **IDs do AdMob:** Opção A (Test IDs fixos em ambiente de dev/homologação).
- **Persistência do Capping:** Opção B (Multiplataforma — Armazenado no Backend/Redis para consistência).
- **Distribuição de Sponsored:** Opção A (Distribuição Justa — Ordenação por `impressions ASC` para pacing uniforme).

---

## 🛠️ Task Breakdown (Fase de Planejamento)

### [x] M13-T01: Schema Prisma (Modelagem de Campanhas e Tracking)
- **Agente:** `database-architect`
- **Ação:** Criar models `AdCampaign`, `AdImpression`, `AdClick` e adicionar a flag `isSponsoredActive` no model `Listing`.
- **INPUT:** `M13_anuncios_inapp.json` + Decisões de Arquitetura.
- **OUTPUT:** `schema.prisma` atualizado + Migrations.
- **VERIFY:** `npx prisma migrate dev --create-only` e validação do schema.

### [x] M13-T02: Backend Core — Serviços e Validações de Campanha
- **Agente:** `backend-specialist`
- **Ação:** Implementar `AdCampaignService` com validações (ex: apenas listings `PUBLISHED` podem ser patrocinados) e job BullMQ para expiração automática.
- **INPUT:** Models do Prisma.
- **OUTPUT:** `AdCampaignService.ts`.
- **VERIFY:** Testes unitários de validação de regras de negócio.

### [x] M13-T03: Endpoints Admin & Tracking Público
- **Agente:** `backend-specialist`
- **Ação:** Criar endpoints CRUD para Admin gerenciar campanhas e endpoints públicos `POST /ads/track/*` (fire-and-forget via BullMQ).
- **INPUT:** `AdCampaignService`.
- **OUTPUT:** `AdController.ts`.
- **VERIFY:** Requisições via Postman/cURL verificando tempo de resposta < 10ms para tracking.

### [x] M13-T04: Integração com M07 (Injeção de Sponsored na Busca)
- **Agente:** `backend-specialist`
- **Ação:** Modificar `SearchService` para injetar até 2 Sponsored Listings no topo dos resultados, respeitando o targeting e removendo duplicatas.
- **INPUT:** `SearchService` (M07) + `AdCampaignService`.
- **OUTPUT:** `SearchService.ts` modificado.
- **VERIFY:** Busca retornando anúncios patrocinados marcados com `isSponsored: true`.

### [x] M13-T05: Integração Mobile (Google AdMob SDK + CMP)
- **Agente:** `mobile-developer`
- **Ação:** Instalar `react-native-google-mobile-ads`, configurar `app.json`, implementar diálogo CMP (UMP) e os componentes `AdBanner` e `AdInterstitial`.
- **INPUT:** Configurações AdMob.
- **OUTPUT:** Componentes mobile e hooks de anúncios.
- **VERIFY:** Exibição de anúncios de teste no app sem layout shift.

### [x] M13-T06: Interface Admin (Gestão de Campanhas)
- **Agente:** `frontend-specialist`
- **Ação:** Criar telas no painel admin para criação, pausa, cancelamento de campanhas e visualização de métricas (CTR).
- **INPUT:** Endpoints do `AdController`.
- **OUTPUT:** Telas de Admin.
- **VERIFY:** Fluxo completo de criação de campanha no painel.


---

## 🏁 Phase X: Verificação Final
- [ ] Executar `python .agent/skills/vulnerability-scanner/scripts/security_scan.py .`
- [ ] Executar `python .agent/skills/lint-and-validate/scripts/lint_runner.py .`
- [ ] Validar build: `npm run build`
