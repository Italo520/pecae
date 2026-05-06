# Plano de Desenvolvimento — PECAÊ

## 🎯 Objetivos
Corrigir violações das Regras de Negócio (RN03 e RN04) e completar a implementação dos fluxos de Cadastro de Sucata (M05) e Busca (M07) seguindo rigorosamente a documentação em `docs-modules`.

---

## 🏗️ Fase 1: Saneamento e Alinhamento de Backend (Imediato)
**Meta**: Eliminar campos proibidos e consolidar a lógica de criação de anúncios.

1. **Remoção do Campo de Preço (RN04)**:
   - Alterar `prisma/schema.prisma` para remover `price` do modelo `Listing`.
   - Executar migração do banco de dados.
   - Atualizar DTOs (`CreateListingDto`, `UpdateListingDto`, `ListingDetailResponseDto`).
   - Remover lógica de preço nos serviços e controladores.

2. **Unificação da Lógica de Cadastro (RN03 & RN14)**:
   - Eliminar a lógica de "Desmembramento" no `VehiclesService` (não criar anúncios individuais por peça).
   - Garantir que cada `Vehicle` tenha exatamente um `Listing` principal associado.
   - Consolidar `VehiclesService.create` e `ListingsService.create` para evitar duplicação.
   - Assegurar que toda criação/edição resete o status para `PENDING` (Moderação).

3. **Correção de Tipagem**:
   - Resolver os casts `as any` no Prisma para garantir segurança de tipos.

---

## 📱 Fase 2: Implementação e Ajuste de Fluxos Mobile
**Meta**: Ajustar o Wizard de cadastro e a busca conforme as especificações.

1. **Ajuste do M05 (Cadastro de Sucata)**:
   - Remover campos de preço no `VehicleWizard`.
   - Implementar a atualização rápida de peças disponíveis (`updateAvailableParts`) que não exige nova moderação.
   - Integrar fluxo de confirmação de upload de fotos com a API.

2. **Ajuste do M07 (Busca e Catálogo)**:
   - Refinar filtros geográficos e por marca/modelo.
   - Garantir que apenas anúncios `PUBLISHED` sejam visíveis para compradores.

---

## ✨ Fase 3: Refinamento e Validação (Digital Forge)
**Meta**: Estética premium e garantia de qualidade.

1. **UI/UX "Digital Forge"**:
   - Aplicar tokens de design (Industrial Glassmorphism) em todos os novos componentes.
2. **Testes de Regressão**:
   - Executar suíte de testes unitários.
   - Criar testes de integração para o novo fluxo unificado de cadastro.
