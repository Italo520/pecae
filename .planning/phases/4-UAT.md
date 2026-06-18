---
status: diagnosed
phase: 4-busca-aprimorada
source: [4-SUMMARY.md]
started: 2026-06-18T09:42:00-03:00
updated: 2026-06-18T09:45:49-03:00
---

## Current Test

[testing complete]

## Tests

### 1. Cold Start Smoke Test
expected: Com o banco de dados atualizado e o schema gerado, execute a inicialização do servidor backend e do aplicativo Expo a partir de um estado limpo. O backend deve inicializar sem erros de conexão e o app Expo deve abrir a tela principal com a listagem inicial carregando com sucesso.
result: pass

### 2. Redirecionamento de Busca na Home
expected: Ao digitar um termo (ex: "Gol") na barra de busca da tela inicial (Home) e submeter, o usuário deve ser redirecionado para a aba "Search" com o campo de pesquisa preenchido e exibindo os resultados correspondentes.
result: pass

### 3. Filtros de Busca em Cascata
expected: Na tela de Busca, ao abrir o Bottom Sheet e selecionar uma Marca (ex: Volkswagen), o seletor de Modelos deve ser populado sob demanda (Fetch on Demand) apenas com os modelos dessa marca. Selecionar um modelo deve liberar a seleção de versões correspondentes.
result: pass

### 4. Filtros de Quilometragem e Combustível
expected: Na tela de Busca, o usuário deve conseguir aplicar filtros de "Combustível" (ex: Flex, Gasolina) e "Quilometragem" (ex: "Até 50.000 km"), e a API deve retornar somente os veículos que satisfaçam esses critérios acumulativos.
result: issue
reported: "precisa melhora a ui e ux conforme os marketplaces mais renomados"
severity: minor

## Summary

total: 4
passed: 3
issues: 1
pending: 0
skipped: 0

## Gaps

- truth: "Na tela de Busca, o usuário deve conseguir aplicar filtros de \"Combustível\" (ex: Flex, Gasolina) e \"Quilometragem\" (ex: \"Até 50.000 km\"), e a API deve retornar somente os veículos que satisfaçam esses critérios acumulativos."
  status: failed
  reason: "User reported: precisa melhora a ui e ux conforme os marketplaces mais renomados"
  severity: minor
  test: 4
  root_cause: "Interface de filtros fragmentada por múltiplos modais de lista vertical simples de 70% de altura, gerando alta fricção de cliques e layout abaixo do padrão estético premium (Falta de grabber visual, grid de chips e sliders/campos numéricos)."
  artifacts:
    - path: "apps/mobile/src/components/Search/BottomSheetSelector.tsx"
      issue: "Modal de seleção simples sem indicador visual de puxar (grabber), layout de lista vertical ineficiente para poucas opções."
    - path: "apps/mobile/app/(tabs)/search.tsx"
      issue: "Filtros de combustível e quilometragem disparados individualmente em vez de consolidados ou expostos em grids de chips rápidos."
  missing:
    - "Adicionar grabber/indicador de puxar (Drag Handle) no topo do modal em BottomSheetSelector.tsx"
    - "Refatorar seleção de combustível para usar um grid de chips na UI"
    - "Consolidar filtros em Bottom Sheet unificado ou aplicar estilização premium baseada em chips horizontais diretamente na barra"
  debug_session: .planning/debug/ux-filters-improvement.md
