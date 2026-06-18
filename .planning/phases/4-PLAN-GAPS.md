# Phase 4: Busca Aprimorada e Filtros — Gap Closure Plan

Este plano detalha as correções de UI/UX aplicadas aos filtros de busca no aplicativo móvel para atender ao feedback do usuário por uma experiência premium e refinada (estilo marketplaces renomados).

## Proposed Changes

### Frontend (UI/UX)
Melhorias no design e usabilidade dos componentes de filtro no celular.

#### [MODIFY] `apps/mobile/src/components/Search/BottomSheetSelector.tsx`
- **Drag Handle (Grabber)**: Adicionar um indicador visual horizontal centralizado no topo do Bottom Sheet para affordance de deslizar.
  - Adicionar `<View style={styles.dragHandle} />` antes do cabeçalho.
  - Adicionar regra de estilo `dragHandle`: largura 40, altura 5, cor de borda com opacidade, bordas arredondadas e margem vertical.
- **Visual e Cores**: Ajustar o espaçamento do título e alinhar o botão de fechar. Garantir que as opções selecionadas tenham feedback visual limpo e fonte consistente.

#### [MODIFY] `apps/mobile/app/(tabs)/search.tsx`
- **Estilização dos Chips**: Refinar o visual dos chips horizontais de filtro (`filterChip`) aplicando maior transparência e feedback ativo com as cores do tema do Peçaê (usando `colors.brand`).

## Verification Plan

### Automated Tests
- Executar linting e checagem de tipos no Mobile (`npm run lint --prefix apps/mobile`).

### Manual Verification
1. Abrir a aba de Busca e clicar em qualquer filtro (ex: Combustível).
2. Verificar se o Bottom Sheet exibe o Drag Handle horizontal centralizado no topo.
3. Observar se o estilo e o espaçamento estão polidos e integrados com a identidade visual Glassmorphism.
