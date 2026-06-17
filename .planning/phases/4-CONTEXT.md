# Phase 4: Busca Aprimorada e Filtros — Context

**Created:** 2026-06-17

## Domain
Filtros avançados de busca (Cascata) e Refatoração de API para Combustível/Quilometragem.

## Locked Requirements
> [!NOTE]
> Requisitos foram travados na fase de Especificação. Leia `.planning/phases/4-SPEC.md` antes de planejar.

## Implementation Decisions

### UI e Componentes
- **Seletores em Cascata**: Utilizaremos **Bottom Sheets customizados** para a seleção de Tipo, Marca, Modelo, Ano e Versão.
  - Para listas grandes (ex: Modelos), o Bottom Sheet terá uma barra de busca interna para rápida localização.
  - Essa abordagem garante uma UX idêntica e premium tanto em iOS e Android, quanto boa adaptação na Web.

### Estado e Fluxo de Dados
- **Lógica de Carregamento**: Será utilizado **Fetch On Demand** (carregamento sob demanda).
  - A cada seleção concluída (ex: clicou em uma Marca), o frontend faz uma requisição à API para popular o próximo seletor (Modelos).
  - Isso garante menor consumo de payload inicial e evita prender a thread montando catálogos gigantes.

### Modelo de Dados / Backend
- **Combustível**: Armazenado e pesquisado no banco de dados como `ENUM` (ex: `FLEX`, `GASOLINA`, `ALCOOL`, `DIESEL`, `ELETRICO`, `HIBRIDO`). A UI oferecerá seleção exata e visual (chips/radio).
- **Quilometragem**: O cadastro armazenará o valor numérico exato (`Int`). A UI de busca oferecerá uma seleção por limites (ex: "Até 50.000 km", "Até 100.000 km") usando queries condicionais `<=`.

## Canonical References
- `.planning/phases/4-SPEC.md` (Locked requirements — MUST read before planning)
- `apps/mobile/app/(tabs)/search.tsx` (Componente visual principal e hook state)
- `apps/mobile/app/(tabs)/index.tsx` (Redirect da barra inicial)

## Code Context
- Já possuímos design system inicial configurado (temas, cores) e `react-native-reanimated` / `@gorhom/bottom-sheet` se estiver instalado, ou usaremos modais nativos simulando um Bottom Sheet customizado (Peçaê UI) conforme padrão visual atual (Glassmorphism).
