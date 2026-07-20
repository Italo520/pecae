# Phase 3: Conclusão do Wizard e Envio de Imagens Web

## 1. Visão Geral
A Fase 3 é responsável por finalizar a experiência de cadastro de veículo. Ela irá implementar a etapa de upload de imagens (Step 4), utilizando interface de arrastar e soltar (Drag and Drop), e a etapa de finalização (Step 5), onde o usuário define o preço final, as observações adicionais e revisa os dados antes de submeter tudo à API.

## 2. Requisitos Técnicos

### 2.1. Step 4 (Fotos)
- Criar `Step4Photos.tsx`.
- Componente de Dropzone permitindo que o vendedor arraste e solte arquivos de imagem (`.jpg, .png, .webp`).
- Exibição de miniaturas (thumbnails) das imagens selecionadas com a opção de excluir uma imagem.
- O array de arquivos locais (File[]) será armazenado em um estado local do Wizard ou no contexto do `react-hook-form` (dependendo da conveniência para submissão).

### 2.2. Step 5 (Preço e Revisão)
- Criar `Step5Price.tsx`.
- Formulário de definição de Preço de Venda (mascarado para Moeda Real).
- Campo de textarea para Observações.
- Exibição de um resumo visual rápido da Placa, Modelo e Peças selecionadas para aumentar a confiança do usuário antes de publicar.

### 2.3. Submissão (API)
- Criar o hook `useCreateVehicle` no diretório de hooks (ex: `src/hooks/useVehicles.ts`).
- Na tela do Wizard, o botão "Finalizar" (que aparece no passo 5) vai compilar os dados do formulário e as fotos.
- Se a API exigir FormData (para envio de arquivos combinados) ou URLs pre-signed, a lógica de mutação cuidará disso. Se utilizarmos uma rota `multipart/form-data`, o axios deve ser configurado adequadamente.

## 3. UI / UX Design
- O Drag and Drop deve ter feedbacks visuais claros (hover state indicando "Solte as imagens aqui").
- O botão final de "Anunciar Sucata" deve possuir um estado de carregamento (`isLoading`) para evitar duplos cliques.

## 4. Estrutura de Arquivos
- `src/components/vendedor/wizard/steps/Step4Photos.tsx`
- `src/components/vendedor/wizard/steps/Step5Price.tsx`
- (Atualização) `src/components/vendedor/wizard/VehicleWizardClient.tsx`
- (Atualização) `src/hooks/useVehicles.ts`
