# Plano de Implementação: Recuperação e Finalização PECAÊ

> **Objetivo:** Transformar o esqueleto atual em um marketplace funcional, seguro e testável.

---

## 🧹 Fase 1: Saneamento e Segurança
**Agente:** `orchestrator`, `security-auditor`

### 1.1. Configurações Globais
- [x] **Segurança**: Configurar `CORS_ORIGIN` no `.env` e aplicar no `main.ts`.
- [x] **Guards**: Tornar `JwtAuthGuard` global e usar `@Public()` onde necessário.
- [x] **Soft Delete Migration**: Adicionar campo `deletedAt` nos modelos `Listing`, `Vehicle`, `SellerProfile` e `BuyerProfile` no Prisma.
- [x] **Cleanup**: Remover arquivos de debug (`scratch/`, `debug-*.md`, `fix-imports.sh`).

### 1.2. Infraestrutura de Testes
- [x] Configurar ambiente de testes E2E com base de dados separada (Docker).
- [x] Implementar primeiro teste de fumaça (Health Check).

---

## 📦 Fase 2: Core Marketplace (M01, M04, M05)
**Agente:** `backend-specialist`

### 2.1. CRUD Completo de Listings (Padronização Soft Delete)
- [x] **Controller**: Adicionar `POST /listings`, `PATCH /listings/:id`, `DELETE /listings/:id`.
- [x] **Service**: 
    - [x] Implementar lógica de persistência no Prisma (vinculação com `SellerProfile` e `Vehicle`).
    - [x] **Soft Delete**: Garantir que o método `remove` apenas atualize o campo `deletedAt`.
    - [x] **Global Filtering**: Garantir que as buscas (`findMany`) filtrem por `deletedAt: null` por padrão.
- [x] **Validation**: Criar DTOs rigorosos para criação/edição.

### 2.2. Correções de Auth
- [x] **Email Verification**: Corrigir `verifyEmail` para atualizar `emailVerified: true` e `emailVerifiedAt`.
- [x] **SMS Integration**: Criar interface `SmsService` e preparar para Twilio/AWS (manter Mock injetável para local).

---

## 💬 Fase 3: Comunicação e Chat (M07)
**Agente:** `backend-specialist`
- [x] **Gateway**: Criar `ChatGateway` usando Socket.io para comunicação em tempo real.
- [x] **Auth**: Validar JWT no handshake do WebSocket.
- [x] **Rooms**: Implementar entrada em salas por `roomId`.
- [x] **Real-time**: Emitir mensagens recebidas para todos os participantes da sala.

---

## 🔍 Fase 4: Inteligência e Moderação (M07, M09, M12)
**Agentes:** `backend-specialist`, `database-architect`, `security-auditor`

### 4.1. Busca e Filtros Avançados (Search)
- [x] **Database**: Otimizar busca usando índices GIN em campos de texto (Prisma Raw Queries para Full-Text Search).
- [x] **Service**: Criar `SearchService` com suporte a filtros dinâmicos:
    - Texto (Título/Descrição)
    - Veículo (Marca, Modelo, Ano, Categoria)
    - Localização (Estado/Cidade)
    - Preço (Min/Max)
- [x] **Controller**: Endpoint `GET /search` público (marcado com `@Public()`).

### 4.2. Sistema de Moderação (Hardening)
- [x] **Role Guard**: Implementar `RolesGuard` e decorador `@Roles('ADMIN', 'MODERATOR')`.
- [x] **Endpoints**: `PATCH /moderation/listings/:id/approve` e `reject`.
- [x] **Safety**: Garantir que o `ListingsService.findAll` público filtre automaticamente `status: 'PUBLISHED'`.

### 4.3. Analytics e Filas (BullMQ)
- [x] **Queue**: Criar `analytics.queue` para processar eventos de visualização.
- [x] **Worker**: Implementar worker que incrementa `views` no `Listing` de forma assíncrona.
- [x] **Integration**: Disparar evento no endpoint `GET /listings/:id`.

---

## 🧪 Fase 5: Qualidade e Mobile Audit
**Agentes:** `test-engineer`, `mobile-developer`

### 5.1. Cobertura de Testes (Sem Browser)
- [x] **Unit Tests**:
    - `AuthService`: Validar fluxos de OTP, verificação de e-mail e expiração de token.
    - `ListingsService`: Testar lógica de criação, soft-delete e proteção de status.
    - `SearchService`: Testar parsing de filtros e lógica de Full-Text Search.
- [x] **Integration Tests (API)**:
    - Fluxo de Registro -> Login -> Criação de Anúncio (Supertest).
    - Fluxo de Moderação -> Publicação -> Busca (Supertest).
    - Verificação de Segurança (Garantir que rotas privadas retornam 401/403).

### 5.2. Auditoria Mobile e Ajustes Finais [CONCLUÍDO]
- [x] **Correção de Navegação (Wizard)**: Ajustar redirecionamento do Step 5 para `inventory`.
- [x] **Refatoração do VehicleSelector**: Adicionar o nível de "Versão" (Brand > Model > Version > YearFab) para compatibilidade com o backend.
- [x] **Implementação de Soft Delete UI**: 
    - [x] Adicionar mutação `deleteVehicle` no hook `useVehicles`.
    - [x] Adicionar botão "Remover" com confirmação no `VehicleInventoryCard`.
- [x] **Validação de Fluxos**: Testar integração fim-a-fim do cadastro até a exibição no inventário.
- [x] **Polimento Digital Forge**: Revisar contrastes e efeitos de vidro em telas de baixa visibilidade. [CONCLUÍDO]

---

## 🚀 Fase 6: Execução e Testes Integrados (Docker)
**Agentes:** `devops-engineer`, `backend-specialist`, `test-engineer`

### 6.1. Levantamento da Infraestrutura
- [x] **Docker Compose**: Executar `docker compose up --build` para subir Postgres, Redis e API. [CONCLUÍDO]
- [x] **Database Initialization**: Validar se as migrações e o seed foram aplicados corretamente pelo `entrypoint.sh`. [CONCLUÍDO]
- [x] **Log Monitoring**: Acompanhar logs para garantir que não há erros de conexão entre os serviços. [CONCLUÍDO]

### 6.2. Testes de Fumaça (API)
- [x] **Health Check**: Validar `GET /api/v1/health`. [CONCLUÍDO]
- [x] **Auth Check**: Tentar login com o usuário admin seed (`admin@pecae.com.br`). [CONCLUÍDO]
- [x] **Inventory Check**: Verificar se o inventário retorna vazio (conforme esperado para um novo seller). [CONCLUÍDO]

### 6.3. Testes Mobile Web
- [x] **Web Access**: Acessar `http://localhost:8080` e validar se a aplicação mobile carrega no browser. [CONCLUÍDO]
- [x] **Flow Validation**: Testar o fluxo de cadastro de veículo (Wizard) e verificar se o dado é persistido no Postgres do container. [CONCLUÍDO]

---

## 🛠️ Fase 7: Estabilização de Auth & Mobile UX (Browser/Web)
**Agentes:** `frontend-specialist`, `security-auditor`, `ux-designer`

### 7.1. Persistência de Auth (Web/Mobile)
- [ ] **Auth Store Audit**: Corrigir possíveis race conditions no `initializeAuth`. Garantir que `isLoading` seja tratado corretamente para evitar redirecionamentos precoces no browser.
- [x] **State Restoration**: Validar se o `localStorage` está sendo lido corretamente antes do primeiro render do `ProtectedRoute`.

### 7.2. UI/UX: Menu & Light Mode
- [x] **Theme Calibration**: Ajustar `pecae-tokens.ts`. No modo claro, aumentar a opacidade do `surface` e `border` para garantir contraste em fundos claros.
- [x] **Menu Redesign**: Aplicar "Industrial Glassmorphism" no `perfil.tsx`. Usar `Space Grotesk` para títulos e `Manrope` para corpo.
- [x] **Visual Audit**: Garantir que todos os componentes sejam visíveis no modo claro (contraste mínimo 4.5:1).

### 7.3. Auditoria de Rotas (Buyer)
- [x] **Route Verification**: Implementar ou corrigir as rotas: `favoritos`, `buscas-salvas`, `compras`, `seguranca`, `ajuda`.
- [x] **Navigation Flow**: Garantir que o botão "Voltar" funcione corretamente em todas as sub-páginas sem perder o contexto.

---

## 🏁 Critérios de Aceite
1. CORS configurado e seguro.
2. Anúncios podem ser criados, editados e deletados por usuários autenticados.
3. E-mail verificado altera de fato o status no banco.
4. Chat funciona em tempo real (Gateway ativo).
5. **Novo**: Auth context é mantido após refresh no browser.
6. **Novo**: Menu do comprador é visualmente premium em Dark e Light mode.
7. Sem arquivos de lixo no repositório.
6. **Docker**: Todos os serviços subindo com um único comando e banco populado.
