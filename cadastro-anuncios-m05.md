# Módulo M05 — Cadastro de Sucata / Veículo

## 📋 Status: Planejado
O objetivo deste módulo é permitir que o vendedor cadastre sucatas completas através de um wizard intuitivo, gerencie fotos e peças disponíveis, garantindo que todo anúncio passe por uma moderação obrigatória.

---

## 🛠️ Task List

### Phase 1: Database & Core Models
- [x] **M05-T01-DB01**: Definir enums `VehicleStatus`, `ListingStatus` e `PhotoType` no Prisma.
- [x] **M05-T01-DB02**: Criar models `Vehicle`, `VehiclePhoto` e `Listing` com relacionamentos ao M04 e M03.
- [x] **M05-T01-DB03**: Executar migration `add_vehicle_listing` e validar índices de performance.

### Phase 2: Backend API (Business Logic)
- [x] **M05-T02-B01**: Implementar `VehicleController` e `VehicleService` com criação atômica (Vehicle + Listing).
- [x] **M05-T02-B02**: Implementar lógica de detecção de duplicidade (RN10) e Transaction (RN14).
- [x] **M05-T02-B03**: Configurar upload de fotos via Presigned URLs e processamento assíncrono com BullMQ.
- [x] **M05-T02-B04**: Criar endpoints de atualização rápida de peças e status (SOLD).

### Phase 3: Mobile Wizard (The Digital Wizard)
- [x] **M05-T03-M01**: Estruturar Zustand store `useWizardStore` para gerenciamento de estado entre passos.
- [x] **M05-T03-M02**: Implementar Steps 1 e 2 (Seletor de Veículo M04 + Dados Gerais).
- [x] **M05-T03-M03**: Implementar Step 3 (Seleção de `PartCategory` via grid de checkboxes).
- [x] **M05-T03-M04**: Implementar Step 4 (Galeria de fotos com Drag-to-reorder e compressão).
- [x] **M05-T03-M05**: Implementar Step 5 (Revisão final e submissão à API).

### Phase 4: Management & Polish
- [x] **M05-T04-P01**: Implementar tela de edição de anúncio (modo edit do wizard).
- [x] **M05-T04-P02**: Implementar fluxo de Marcar como Vendido e listagem de inventário.
- [x] **M05-T04-P03**: Executar auditoria de segurança (Secrets) e performance (Lighthouse).

---

## 📐 Architecture Decisions
1.  **Imagens**: Upload direto ao Supabase Storage via presigned URL para evitar gargalos na API.
2.  **Moderação**: Todo anúncio novo ou editado nasce como `PENDING` (RN14).
3.  **Performance**: Thumbnails gerados via BullMQ worker em background.
4.  **UX**: Wizard não persiste no banco até o passo final (Zustand state only).

---

## 🚫 Done When
- [x] Vendedor consegue cadastrar uma sucata completa com pelo menos 4 fotos.
- [x] O anúncio criado aparece com status "Em Revisão" no dashboard.
- [x] A edição de qualquer dado (exceto peças) força o anúncio de volta para moderação.
- [x] O sistema impede (ou avisa) sobre anúncios duplicados.
- [ ] Testes de integração validam a criação atômica (Prisma Transaction).
