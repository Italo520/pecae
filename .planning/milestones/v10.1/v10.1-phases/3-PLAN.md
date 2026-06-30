# Phase 3: Conclusão do Wizard e Envio de Imagens Web - Plano de Implementação

## 1. Análise
O backend deve receber um payload JSON contendo os detalhes do veículo. No mobile (`useCreateVehicle`), a submissão das fotos pode envolver o envio delas como um array multipart ou o envio de URIs e, possivelmente, uma rota dedicada a upload (presigned URL). Na versão Web, utilizaremos a rota existente `API_ENDPOINTS.VEHICLES.CREATE`. Se for `multipart/form-data`, passamos `FormData`.

## 2. Passos de Implementação

### Passo 1: Step 4 - Upload de Imagens
1. Criar componente `Step4Photos.tsx`.
2. Implementar lógica simples de drag-and-drop e botão oculto de file input `accept="image/*" multiple`.
3. Renderizar thumbnails (com `URL.createObjectURL`) numa grid.
4. Armazenar um array de arquivos local no componente ou no `VehicleWizardClient`. Vamos colocar no form se usarmos um campo `z.any()` para files ou no estado do parent.

### Passo 2: Step 5 - Revisão e Preço
1. Criar componente `Step5Price.tsx`.
2. Montar interface contendo:
   - Input de `observacoes` (Textarea opcional).
   - Input numérico para Preço ou um switch "Sob Consulta".
   - Resumo rápido das seleções feitas nos passos anteriores.

### Passo 3: Integração e Hook de Submissão
1. Atualizar o arquivo `useVehicles.ts` adicionando `useCreateVehicle` hook com `react-query` `useMutation`.
2. Lógica do mutation:
   - Receber `VehicleCreateInput` (e opcionalmente array de imagens).
   - Se o backend aceita multipart para fotos direto no endpoint principal, construímos o `FormData`. Se usar endpoint separado, enviamos o JSON e depois chamamos o endpoint de imagens. (Neste plano, assumiremos o endpoint padrão da API que lida com isso ou simplificaremos focado na criação base do dado).
   - Redirecionar para `/vendedor/dashboard` ao concluir com sucesso.

## 3. Verificação
- Testar o drag-and-drop de arquivos para ver as miniaturas renderizando corretamente.
- Testar o comportamento do formulário submetendo os dados, garantindo que o `isPending` e os botões desabilitam corretamente durante o upload para evitar múltiplos submits.
