# Phase 2: Cadastro de Anúncios Web (Stepper UI - Passos Iniciais)

## 1. Visão Geral
A Fase 2 tem como objetivo criar a estrutura inicial do assistente de cadastro (Wizard/Stepper) de sucatas na web (`/vendedor/anunciar`). O foco desta fase é a construção do layout do Stepper e os três primeiros passos do formulário, que coletam informações textuais/estruturadas (sem envio de imagens ainda, o que fica para a Fase 3). O estado do formulário inteiro será mantido do lado do cliente utilizando `react-hook-form`.

## 2. Requisitos Técnicos

### 2.1. Estrutura do Wizard (Stepper)
- Rota: `/vendedor/anunciar`.
- Componente visual que exibe as 5 etapas da criação do anúncio, destacando a etapa atual.
  - Step 1: Placa/Chassi
  - Step 2: Veículo (Tabela FIPE)
  - Step 3: Peças Disponíveis
  - Step 4: Fotos (Fase 3)
  - Step 5: Revisão e Preço (Fase 3)

### 2.2. Gestão de Estado
- Um único formulário (`useForm` do `react-hook-form`) englobando todos os dados.
- Uso do `@hookform/resolvers/zod` para validação step a step. Se o step atual for inválido, o usuário não pode avançar.
- O schema Zod importado de `@pecae/shared` (`CreateVehicleSchema`) servirá como base, com validações parciais por step.

### 2.3. Steps Iniciais (Fase 2)
- **Step 1 (Placa/Chassi):** Inputs para placa, chassi (opcional), cor, e tipo de veículo.
- **Step 2 (FIPE):** Seleção em cascata (Marca → Modelo → Ano) usando a API pública ou os endpoints já existentes (`API_ENDPOINTS.CATALOG`).
- **Step 3 (Peças):** Uma lista/grid de categorias de peças (`PartCategory`) para o vendedor selecionar via checkboxes (ex: Motor, Câmbio, Portas, etc.).

## 3. UI / UX Design
- Tela focada, sem distrações. Possível ocultar a sidebar nesta rota ou usar um modal de tela inteira para maior imersão.
- Navegação entre steps com botões "Voltar" e "Avançar".
- Inputs com estilo padronizado `bg-white/5 border-white/10` focando em Glassmorphism.

## 4. Estrutura de Arquivos
- `src/app/(protected)/vendedor/anunciar/page.tsx`
- `src/components/vendedor/wizard/VehicleWizard.tsx` (Root form)
- `src/components/vendedor/wizard/StepperContext.tsx`
- `src/components/vendedor/wizard/steps/Step1Identification.tsx`
- `src/components/vendedor/wizard/steps/Step2Fipe.tsx`
- `src/components/vendedor/wizard/steps/Step3Parts.tsx`
