# ROADMAP.md

## Cronograma e Fases de Desenvolvimento (Organizado por Milestones)

Este documento detalha o roteiro cronológico de desenvolvimento estruturado por Milestones (Sprints) para mitigar dependências técnicas e agilizar entregas contínuas de valor.

## [CONCLUÍDA] Milestone 1 (Sprint 1) — Fundações: Autenticação & Catálogo Automotivo (Foco: M01 + M04)

> [!NOTE]
> As tarefas e estimativas originais desta Milestone foram arquivadas em [v1.0-ROADMAP.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v1.0/v1.0-ROADMAP.md) conforme o protocolo de compressão de contexto.

---

## [CONCLUÍDA] Milestone 2 (Sprint 2) — Perfis de Usuário: Comprador & Vendedor (Foco: M02 + M03)

> [!NOTE]
> As tarefas e estimativas originais desta Milestone foram arquivadas em [v2.0-ROADMAP.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v2.0/v2.0-ROADMAP.md) conforme o protocolo de compressão de contexto.

---

## [CONCLUÍDA] Milestone 3 (Sprint 3) — Inventário: Cadastro de Sucatas & Veículos (Foco: M05)

> [!NOTE]
> As tarefas e estimativas originais desta Milestone foram arquivadas em [v3.0-ROADMAP.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v3.0/v3.0-ROADMAP.md) conforme o protocolo de compressão de contexto.

---

## [CONCLUÍDA] Milestone 4 (Sprint 4) — Busca, Descoberta e Detalhe de Peças (Foco: M07)

> [!NOTE]
> As tarefas e estimativas originais desta Milestone foram arquivadas em [v4.0-ROADMAP.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v4.0/v4.0-ROADMAP.md) conforme o protocolo de compressão de contexto.

---

## [CONCLUÍDA] Milestone 5 (Sprint 5) — Negociação Real-Time: Chat, Mensageria & Push (Foco: M08)

> [!NOTE]
> As tarefas e estimativas originais desta Milestone foram arquivadas em [v5.0-ROADMAP.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v5.0/v5.0-ROADMAP.md) conforme o protocolo de compressão de contexto.

---

## [CONCLUÍDA] Milestone 6 (Sprint 6) — Moderação, Qualidade, Alertas e Notificações In-App (Foco: M06 + M09 + M11 + MFA)

> [!NOTE]
> As tarefas e estimativas originais desta Milestone foram arquivadas em [v6.0-ROADMAP.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v6.0/v6.0-ROADMAP.md) conforme o protocolo de compressão de contexto.

---

---

## [CONCLUÍDA] Milestone 7 (Sprint 7) — Monetização: Campanhas de Anúncios Patrocinados (Foco: M13)

> [!NOTE]
> As tarefas e estimativas originais desta Milestone foram arquivadas em [v7.0-ROADMAP.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v7.0/v7.0-ROADMAP.md) conforme o protocolo de compressão de contexto.

---

## [CONCLUÍDA] Milestone 8 (Sprint 8) — Analytics & Dashboards (Foco: M12)

> [!NOTE]
> As tarefas e estimativas originais desta Milestone foram arquivadas em [v8.0-ROADMAP.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v8.0/v8.0-ROADMAP.md) conforme o protocolo de compressão de contexto.

---

## Milestone 9 (Manutenção Pós-Lançamento) — Acesso e Usabilidade

### Fase 2: Navegação Deslogada (Guest Access)
- **Objetivo:** Permitir que o cliente utilize o sistema em áreas públicas (pesquisa de sucatas, anúncios, navegação no catálogo) sem necessidade de login.
- **Status:** `completed` (2026-06-18)
  - **Artefatos:**
  - SPEC: [2-SPEC.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v9.0/v9.0-phases/2-SPEC.md)
  - PLAN: [2-PLAN.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v9.0/v9.0-phases/2-PLAN.md)
  - SUMMARY: [2-SUMMARY.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v9.0/v9.0-phases/2-SUMMARY.md)
  - VERIFICATION: `Verificado e concluído`

### Fase 4: Busca Aprimorada e Filtros
- **Objetivo:** Implementação de busca com filtros avançados em cascata (Tipo, Marca, Modelo, Ano, Versão) integrados com a API FIPE, ordenação e detecção de Estado padrão.
- **Status:** `executed` (2026-06-18)
- **Artefatos:**
  - SPEC: [4-SPEC.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v9.0/v9.0-phases/4-SPEC.md)
  - PLAN: [4-PLAN.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v9.0/v9.0-phases/4-PLAN.md)
  - CONTEXT: [4-CONTEXT.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v9.0/v9.0-phases/4-CONTEXT.md)
  - SUMMARY: [4-SUMMARY.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v9.0/v9.0-phases/4-SUMMARY.md)
  - VALIDATION: [4-VALIDATION.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/milestones/v9.0/v9.0-phases/4-VALIDATION.md)

### Fase 1: Migração Completa do Backend NestJS → Java 25 (Spring Boot)
- **Objetivo:** Reescrita integral do backend PECAÊ de NestJS/TypeScript + Prisma para Java 25 + Spring Boot 3.5+ + Spring Data JPA + Hibernate 7, usando arquitetura Package-by-Feature com 19 subfases.
- **Status:** `in-progress` (Fase 01 a 13 concluídas)
- **Subfases Concluídas:**
  - **Fase 01: Fundação e Infraestrutura** (concluída)
  - **Fase 02: User + Auth** (concluída em 2026-06-22)
  - **Fase 03: Buyer Profile** (concluída em 2026-06-22)
  - **Fase 04: Seller Profile** (concluída em 2026-06-22)
  - **Fase 05: Catalog** (concluída em 2026-06-22)
  - **Fase 06: Vehicle + Photos** (concluída em 2026-06-22)
  - **Fase 07: Anúncio / Listing** (concluída em 2026-06-22)
  - **Fase 08: Chat** (concluída em 2026-06-22)
  - **Fase 09: Avaliações (Review)** (concluída)
  - **Fase 10: Moderação e Denúncias (Report)** (concluída)
  - **Fase 11: Notificações (Notification)** (concluída)
  - **Fase 12: Favoritos e Buscas Salvas** (concluída em 2026-06-23)
  - **Fase 13: Analytics e Dashboards** (concluída em 2026-06-23)
- **Artefatos:**
  - SPEC Geral: [1-SPEC.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/phases/1-SPEC.md)
  - PLAN (Fase 13): [13-PLAN.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/phases/13-PLAN.md)
  - WALKTHROUGH (Fase 13): [walkthrough.md](file:///C:/Users/italo/.gemini/antigravity-ide/brain/b57986f7-9703-4791-b986-1c864211a21d/walkthrough.md)

### Fase 16: Validação E2E Frontend e Remoção do Legado NestJS
- **Objetivo:** Testar e validar a integração completa do Frontend (Mobile) com o novo Backend Java. Caso haja sucesso total, excluir permanentemente a aplicação legada em NestJS do repositório, marcando o fim definitivo da migração.
- **Status:** `completed` (2026-06-25)
- **Artefatos:**
  - SPEC: [16-SPEC.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/phases/16-SPEC.md)
  - PLAN: [16-PLAN.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/phases/16-PLAN.md)
  - SUMMARY: [16-SUMMARY.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/phases/16-SUMMARY.md)

