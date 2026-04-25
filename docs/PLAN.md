# PLAN.md - Seeds de Veículos na Home

## 1. Análise do Problema
Os veículos cadastrados via seed não estão sendo exibidos na página principal do aplicativo mobile (`apps/mobile/app/(tabs)/index.tsx`) após o login. Atualmente, a Home exibe placeholders estáticos. O objetivo é popular o banco de dados com dados de teste reais (veículos, fotos e anúncios) e fazer o frontend consumi-los, mantendo a estética "Industrial Precision / The Digital Forge".

## 2. Abordagem Técnica
Como o `StitchMCP` é uma ferramenta de design/UI e não de manipulação direta de banco de dados, usaremos o **Prisma ORM** do backend para criar os seeds de dados e o **StitchMCP** como referência visual e de design system.

### Backend (`apps/api`)
- Atualizar o arquivo de seed do Prisma (ou criar um novo script) para inserir:
  - Marcas, Modelos, Versões e Anos (Catálogo).
  - Veículos com URLs de fotos (usaremos imagens de carros de alta qualidade via Unsplash ou similares como placeholders).
  - Anúncios (`Listings`) ativos.
- Garantir que existe o endpoint `GET /api/v1/listings` que retorna os anúncios com os dados do veículo e fotos.

### Frontend (`apps/mobile`)
- Modificar `apps/mobile/app/(tabs)/index.tsx` para:
  - Fazer o fetch dos anúncios usando `useQuery`.
  - Substituir os placeholders estáticos por uma lista horizontal/grid de veículos reais.
  - Aplicar os componentes `PecaeGlassCard` e manter o padrão visual escuro/tecnológico.

## 3. Divisão de Tarefas (Fase 2)

### 🤖 Agente: `database-architect`
- Validar o schema do Prisma para garantir que as relações `Vehicle` -> `VehiclePhoto` -> `Listing` estão corretas.
- Criar/Atualizar o script de seed com dados consistentes.

### 🤖 Agente: `backend-specialist`
- Implementar/Ajustar o controller/service de `Listings` para retornar os dados necessários para a Home.

### 🤖 Agente: `frontend-specialist`
- Implementar o consumo da API na tela `index.tsx` do Mobile.
- Ajustar o layout dos cards para exibir a imagem do veículo de forma premium.

## 4. Critérios de Aceitação
- [ ] Banco de dados populado com pelo menos 5 veículos com fotos.
- [ ] Home do app mobile exibindo os veículos reais da API.
- [ ] Nenhuma quebra de interface ao carregar os dados.
- [ ] Design System "Industrial Precision" preservado.
