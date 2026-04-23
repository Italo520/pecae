# M04 — Catálogo Automotivo

## Objetivo
Implementar a infraestrutura completa do catálogo de veículos, incluindo banco de dados, API com cache Redis e interface mobile para seleção em cascata, seguindo os princípios SOLID e o design system "The Digital Forge".

## Success Criteria
- [x] Schema Prisma com hierarquia completa (Brand -> Model -> Version -> Year) e PartCategory.
- [x] Seed com 10 marcas e 5 modelos populares cada, operando de forma idempotente.
- [x] API NestJS com segregação de responsabilidades (Public vs Admin Controllers).
- [x] Cache Redis (Docker) com TTL de 24h e invalidação proativa no Admin.
- [x] Componente Mobile `VehicleSelector` com estética Industrial Glassmorphism (Verde).

## Tech Stack
- **Backend**: NestJS + Prisma + Redis (Local Docker).
- **Mobile**: React Native (Expo) + TanStack Query + Shopify FlashList.
- **Design**: Industrial Glassmorphism (Palette: Green).

## Tasks

### Phase 1: Database & Foundation
- [x] **M04-T01-F01**: Atualizar `schema.prisma` com enums (`FuelType`, `TransmissionType`, `VehicleSegment`) e entidades do catálogo. → Verify: `npx prisma validate`
- [x] **M04-T01-F02**: Criar e aplicar migration para as novas tabelas no Supabase. → Verify: `npx prisma migrate dev`
- [x] **M04-T01-F03**: Implementar Seed script para as 10 marcas principais e 5 modelos cada. → Verify: `npx prisma db seed` e check DB.

### Phase 2: Backend API (SOLID & Cache)
- [x] **M04-T02-B01**: Criar `CatalogModule` com `CatalogService` e `CatalogController` (Leitura Pública). → Verify: `curl GET /catalog/brands`
- [x] **M04-T02-B02**: Configurar CacheManager com Redis (Docker) e aplicar TTL de 24h nos endpoints de leitura. → Verify: Logs de cache hit/miss.
- [x] **M04-T02-B03**: Criar `AdminCatalogController` para operações CRUD (Escrita Protegida) com invalidação de cache. → Verify: `@Roles(ADMIN)` e `redis.del()`.

### Phase 3: Mobile UI (The Digital Forge)
- [x] **M04-T03-M01**: Criar hooks `useCatalog` (TanStack Query) para consumo da API. → Verify: Hook retorna data/loading.
- [x] **M04-T03-M02**: Implementar componente `VehicleSelector` com Glassmorphism Verde e FlashList. → Verify: Seleção Brand -> Model -> Version -> Year funcional.

### Phase 4: Verification
- [x] **M04-T04-V01**: Executar suite de testes unitários e integração da API. → Verify: `npm run test`
- [x] **M04-T04-V02**: Executar scripts de auditoria de segurança e UX. → Verify: `checklist.py`

## Done When
- [x] Todo o fluxo de seleção de veículo está operacional no app e persistido no banco.
- [x] A performance é otimizada via Redis (<100ms em cache hits).
- [x] O código respeita SRP (Single Responsibility Principle) com controllers segregados.
