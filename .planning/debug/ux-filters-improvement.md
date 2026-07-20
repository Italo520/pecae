# Sessão de Depuração: Melhoria de UI/UX nos Filtros de Busca

## Sintomas
O usuário relatou que a interface e experiência de usuário (UI/UX) dos filtros de busca (como combustível e quilometragem) precisam de melhorias para atingir o padrão esteticamente refinado dos marketplaces renomados do mercado (ex: OLX, Mercado Livre).

## Investigação
1. **Fricção de Navegação**:
   Atualmente, em `apps/mobile/app/(tabs)/search.tsx`, cada filtro (Tipo, Marca, Modelo, Versão, Combustível, Quilometragem) possui um chip horizontal separado. Clicar em um chip abre um modal individual (`BottomSheetSelector`). Se um usuário deseja aplicar múltiplos filtros, ele enfrenta a fricção de abrir, selecionar e fechar múltiplos modais sequencialmente.
2. **Layout do Bottom Sheet**:
   O `BottomSheetSelector` possui uma altura fixa de `70%` da tela. Para listas pequenas como `FUEL_TYPES` (6 opções) ou `TYPE_OPTIONS` (4 opções), um modal ocupando 70% da tela gera um grande vazio visual e poluição estética.
3. **Ausência de Grabber (Drag Handle)**:
   O modal `BottomSheetSelector` não possui a barra horizontal indicadora de arrastar (Drag Handle/Grabber) no topo. Marketplaces renomados usam esse indicador visual para sugerir que o modal pode ser fechado deslizando para baixo.
4. **Visual dos Filtros Simples**:
   Campos com poucas opções (como Combustível) são mais bem apresentados em marketplaces modernos através de grids de botões rápidos (chips lado a lado) do que por listas verticais longas de tela cheia.

## Conclusão e Plano de Ação
1. **Adicionar Grabber Visual**: Inserir um indicador de arrasto (`Drag Handle`) no topo do `BottomSheetSelector` para melhorar a affordance de deslizar.
2. **Ajustar Estilo Peçaê UI (Digital Forge)**: Refinar o layout visual dos modais e chips de filtro aplicando melhorias de cores, espaçamentos e consistência com o tema do projeto.
3. **Chips Rápidos**: Implementar no futuro um formato de grid para campos com poucas opções fixas de modo a otimizar o uso do espaço da tela.
