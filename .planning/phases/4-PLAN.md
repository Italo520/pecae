# Phase 4: Busca Aprimorada e Filtros

Este plano detalha a implementação técnica para a Fase 4, incluindo o novo fluxo de busca em cascata via Bottom Sheets, e o suporte backend/banco de dados para Combustível e Quilometragem.

## User Review Required
> [!IMPORTANT]
> - O frontend passará a usar Bottom Sheets customizados para a seleção de filtros pesados (Marcas, Modelos, Versões).
> - Como discutido, a filtragem de Quilometragem será do tipo "Até X km" (`mileageMax`).



## Open Questions
> [!WARNING]
> 1. Os endpoints da API para listar Marcas, Modelos e Versões (`GET /brands`, `GET /models?brandId=X`, etc.) já existem no backend ou precisarão ser criados nesta fase também? (Assumirei que precisam ser criados ou ajustados se não existirem).
> 2. Devemos executar a migração do Prisma (`npx prisma migrate dev`) automaticamente após alterar o `schema.prisma`?

## Threat Model
<threat_model>
### Trust Boundaries
| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| App Mobile / API Backend | O app móvel envia parâmetros de filtros e consultas textuais ao backend via HTTPS. | Parâmetros de consulta (filtros e strings de busca) atravessam esta borda. |
| API Backend / Banco de Dados | O backend monta as queries do Prisma e faz consultas de busca avançada e catálogo no PostgreSQL. | Parâmetros de consulta convertidos em clausulas SQL atravessam esta borda. |

### STRIDE Register
| Threat ID | Category | Component | Disposition | Mitigation Plan |
|-----------|----------|-----------|-------------|-----------------|
| T-4-01 | Denial of Service | API de Busca / PostgreSQL | mitigate | Adição de índices no banco nas colunas indexáveis (`mileage`, `fuelType`, `brandId`, `modelId`) para consultas rápidas e paginação (limit/offset) forçada em todas as buscas de veículos. |
| T-4-02 | Injection | API de Busca / Prisma | mitigate | Uso estrito do Prisma ORM (que parametriza queries nativamente) e validação de parâmetros com class-validator no DTO de filtros (`search-filters.dto.ts`). |
| T-4-03 | Information Disclosure | API de Catálogo / PostgreSQL | mitigate | Endpoints de catálogo (`/catalog/brands`, etc.) expõem apenas dados públicos (marcas, modelos e anos cadastrados no catálogo) sem revelar registros confidenciais de usuários ou transações. |
</threat_model>

## Proposed Changes

---

### Backend (Database & API)
Atualização do modelo de dados e dos endpoints de busca para suportar os novos parâmetros.

#### [MODIFY] `apps/api/prisma/schema.prisma`
- Adicionar `mileage Int?` ao modelo `Vehicle`.
- Adicionar `fuelType FuelType?` ao modelo `Vehicle` (apesar de `VehicleVersion` já ter, isso permite override/busca otimizada).

#### [MODIFY] API de Busca (`apps/api/.../search.controller.ts` ou similar)
- Adicionar suporte para os query params `mileageMax` e `fuelType`.
- Adicionar suporte para os query params em cascata: `brandId`, `modelId`, `versionId`.
- Ajustar a query do Prisma no endpoint `/search` para aplicar os filtros recebidos (`lte` para mileage, exact match para fuel e relacionamentos).

#### [NEW/MODIFY] API de Catálogo (`apps/api/.../catalog.controller.ts` ou similar)
- Criar/Verificar rotas para Fetch on Demand:
  - `GET /catalog/brands`
  - `GET /catalog/models?brandId=X`
  - `GET /catalog/versions?modelId=Y`

---

### Frontend (Hooks & API Client)
Ajuste nas requisições HTTP do lado do mobile.

#### [MODIFY] `apps/mobile/src/hooks/useVehicles.ts`
- Atualizar a interface do `useSearchVehicles` para aceitar `mileageMax`, `fuelType`.
- Garantir que os IDs de cascata (`brandId`, `modelId`, `versionId`) estão sendo enviados corretamente.

#### [NEW] `apps/mobile/src/hooks/useCatalog.ts`
- Criar hooks do React Query (`useBrands`, `useModels`, `useVersions`) para consumir as APIs de Fetch On Demand.

---

### Frontend (UI/UX)
Refatoração visual e integração com o novo fluxo.

#### [MODIFY] `apps/mobile/app/(tabs)/search.tsx`
- **Bottom Sheets Customizados:** Implementar um componente de Bottom Sheet unificado contendo uma `FlatList` e um campo de busca interno.
- **Estado Local em Cascata:** Adicionar seletores de "Marca", "Modelo", "Ano", "Versão", "Combustível" e "Quilometragem". 
- Ao selecionar uma opção de nível superior (ex: Marca), limpar os níveis inferiores (Modelo, Versão).
- **Filtro de Estado (UF):** Preencher por padrão com o estado do usuário, ou permitir selecionar.

#### [MODIFY] `apps/mobile/app/(tabs)/index.tsx`
- Refatorar o componente de busca na home para que um submit de busca (ou clique na barra) redirecione imediatamente para `/search?q={termo}`, transferindo a responsabilidade da busca avançada para a tela dedicada.

## Verification Plan

### Automated Tests
- Executar linting e checagem de tipos no Frontend e Backend.
- Rodar `npx prisma generate` e verificar validação do schema.

### Manual Verification
1. Fazer o cadastro de um veículo e confirmar se o backend salva `mileage` e `fuelType`.
2. Acessar a Home, digitar um texto na busca e confirmar que redireciona para a aba Search com o termo preenchido.
3. Na aba Search, abrir o filtro de Marca, selecionar uma marca, confirmar se o filtro de Modelo carrega opções correspondentes à marca (Fetch on demand).
4. Selecionar "Combustível: Flex" e "Até 50.000 km" e verificar se a API retorna os veículos corretamente.
