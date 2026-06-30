# Phase 2: Cadastro de Anúncios Web (Stepper UI) - Plano de Implementação

## 1. Análise
O mobile utiliza múltiplos components na pasta `components/VehicleWizard/`. Nós reproduziremos o conceito na Web, mas simplificaremos a gestão de estado usando um único Form provider (`FormProvider` do `react-hook-form`), onde os Steps são apenas views parciais renderizando os `<input>` conectados a esse form central.

## 2. Passos de Implementação

### Passo 1: Configuração do Schema e FormProvider
1. Criar `VehicleWizard.tsx` usando `useForm` tipado via Zod.
2. Definir o estado atual do step (`currentStep = 1..5`).

### Passo 2: Layout do Stepper Visual
1. Criar componente `StepperIndicator` (bolinhas ou barra de progresso horizontal) indicando os 5 passos do formulário.

### Passo 3: Step 1 (Identificação)
1. Criar `Step1Identification.tsx`.
2. Adicionar inputs para `plate` (com máscara ou uppercase), `chassis`, `color`.
3. Validar ao clicar em "Próximo".

### Passo 4: Step 2 (Seleção FIPE)
1. Criar `Step2Fipe.tsx`.
2. Usar o hook genérico (ou criar um local) para buscar Marcas → Modelos → Versões → Anos da API REST do PECAÊ. (Podemos copiar a lógica de busca em cascata que já fizemos na `Busca` web ou o que o mobile faz).
3. Selecionar e armazenar o `brand`, `model`, `version`, `year`.

### Passo 5: Step 3 (Peças Disponíveis)
1. Criar `Step3Parts.tsx`.
2. Fazer fetch das Categorias de Peças e renderizar como Grid de Checkboxes estilizáveis.
3. Armazenar um array de `partCategoryIds` no form.

## 3. Verificação
- Garantir que não é possível avançar os steps sem preencher os campos obrigatórios.
- Validar se o form guarda o valor corretamente caso o usuário avance e volte um step.
