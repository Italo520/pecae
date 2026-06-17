# Phase 4: Busca Aprimorada e Filtros — Specification

**Created:** 2026-06-17
**Ambiguity score:** 0.12 (gate: ≤ 0.20)
**Requirements:** 4 locked

## Goal

O sistema de busca possui filtros avançados no estilo Mercado Livre (Tipo, Marca, Modelo, Ano, Versão, Combustível e Quilometragem), detecta o estado do usuário por padrão, unifica a experiência redirecionando buscas da home para a tela principal de busca, e o backend/API são refatorados para suportar e exigir esses novos dados tanto na busca quanto no cadastro de veículos.

## Background

Atualmente, a tela de busca (`search.tsx`) possui apenas um campo de texto livre e filtros básicos de Cidade/UF escondidos em um toggle, além de chips para algumas marcas. Não há seletores em cascata de Tipo, Marca, Modelo, Ano e Versão, nem filtros para Combustível e Quilometragem. Na home (`index.tsx`), existe uma barra de busca que precisa redirecionar o usuário corretamente para a tela de busca com os parâmetros iniciais. A API do backend atualmente não suporta buscas com todos esses parâmetros estruturados e o cadastro de veículos não solicita informações cruciais como quilometragem e tipo de combustível de forma padronizada para otimização da busca.

## Requirements

1. **Filtros Avançados em Cascata**: Exibir dropdowns estilo Mercado Livre para refinar a busca.
   - Current: A busca possui apenas um campo de texto e campos manuais de Cidade/UF.
   - Target: A interface de busca exibe os selects: Tipo (Motos, Carros, Caminhões), Marca, Modelo, Ano, Versão, Combustível e Quilometragem.
   - Acceptance: O usuário consegue selecionar a "Marca" e os "Modelos" disponíveis são atualizados de acordo (cascata), até chegar na "Versão", além de poder aplicar filtros de Combustível e Quilometragem.

2. **Refatoração da API de Busca e Cadastro**: O backend deve suportar os novos parâmetros de busca e o cadastro deve exigi-los.
   - Current: A API de veículos e o fluxo de cadastro possuem suporte básico a parâmetros de busca. Quilometragem e Combustível podem não ser padronizados ou indexados para busca estruturada avançada.
   - Target: A API de cadastro de veículos passa a solicitar (e armazenar) `combustivel` e `quilometragem`. A API de busca é refatorada para receber, validar e filtrar pelos novos parâmetros estruturados (Tipo, Marca, Modelo, Ano, Versão, Combustível, Quilometragem).
   - Acceptance: O endpoint de cadastro salva com sucesso o tipo de combustível e a quilometragem do veículo; o endpoint de busca retorna resultados corretos ao filtrar por essas propriedades e pelas propriedades em cascata (Marca, Modelo, Versão).

3. **Seleção de Estado Padrão**: O filtro de Estado (UF) deve vir preenchido com a localização atual.
   - Current: O estado (UF) começa vazio, exigindo preenchimento manual.
   - Target: Ao abrir a tela de busca, o campo Estado (UF) já vem selecionado por padrão baseado na localização do usuário ou valor default da aplicação.
   - Acceptance: A tela de busca inicializa com a UF já preenchida e influenciando os resultados de busca.

4. **Redirecionamento da Home**: A busca na tela inicial leva para a busca aprimorada.
   - Current: A home (`index.tsx`) tem uma `<VehicleSearchBar />` que pode não redirecionar com os parâmetros corretos para a interface avançada.
   - Target: Ao interagir com a busca na Home e submeter o texto, o usuário é redirecionado para `/(tabs)/search` com o texto no parâmetro de URL e exibindo a busca aprimorada.
   - Acceptance: Digitar "Corolla" na Home e dar Enter/Buscar redireciona para a aba Search com "Corolla" já preenchido e ativando a requisição de busca correspondente.

## Boundaries

**In scope:**
- Modificação na UI de `search.tsx` para incluir seletores (dropdowns/pickers) de Tipo, Marca, Modelo, Ano, Versão, Combustível e Quilometragem.
- **Refatoração da API de busca do backend** para suportar e processar os novos filtros.
- **Adaptação da API de cadastro de veículos (backend) e do fluxo de front-end de cadastro** para solicitar/enviar o tipo de combustível e a quilometragem de forma obrigatória/padronizada.
- Atualização do hook/logica de busca para suportar os novos parâmetros.
- Detectar/Mockar o Estado (UF) padrão do usuário ao acessar a aba Search.
- Ajustar `VehicleSearchBar` na Home (`index.tsx`) para fazer o redirecionamento com parâmetros (`?q=...`).

**Out of scope:**
- Geolocalização complexa com GPS em tempo real na busca (utilizaremos apenas o Estado/UF em nível básico predefinido ou extraído do perfil).

## Constraints

- O layout dos filtros deve ser responsivo e seguir a identidade visual (Glassmorphism, cores do tema Peçaê) da plataforma.
- Pickers/Dropdowns devem funcionar bem tanto no ambiente mobile (iOS/Android) quanto na Web.
- As mudanças no banco de dados para suportar a busca avançada devem manter a performance (adição de índices nos novos filtros, se necessário).

## Acceptance Criteria

- [ ] A tela de Busca exibe dropdowns de Tipo, Marca, Modelo, Ano, Versão, Combustível e Quilometragem.
- [ ] A tela de Busca carrega com a UF do usuário preenchida por padrão.
- [ ] Ao pesquisar pela Home, o usuário é levado para a tela de Busca com o parâmetro `q` preenchido e selecionado.
- [ ] Os dropdowns de Marca, Modelo e Versão funcionam em cascata.
- [ ] A API de Cadastro de Veículo armazena e exige o envio do tipo de combustível e da quilometragem do veículo.
- [ ] A API de Busca do backend filtra corretamente veículos utilizando todos os novos parâmetros solicitados.

## Ambiguity Report

| Dimension          | Score | Min  | Status | Notes                              |
|--------------------|-------|------|--------|------------------------------------|
| Goal Clarity       | 0.90  | 0.75 | ✓      |                                    |
| Boundary Clarity   | 0.95  | 0.70 | ✓      | Backend in-scope explicitly added  |
| Constraint Clarity | 0.80  | 0.65 | ✓      |                                    |
| Acceptance Criteria| 0.90  | 0.70 | ✓      | Backend & Frontend checks added    |
| **Ambiguity**      | 0.12  | ≤0.20| ✓      |                                    |

## Interview Log

| Round | Perspective    | Question summary         | Decision locked                    |
|-------|----------------|-------------------------|------------------------------------|
| 1     | Auto           | Requisitos diretos      | Prompt inicial do usuário          |
| 2     | User           | Escopo do Backend       | Backend INCLUSO: Refazer API busca e adicionar Combustível/Quilometragem no Cadastro e Busca. |

---

*Phase: 04-busca-aprimorada*
*Spec created: 2026-06-17*
*Next step: /gsd-discuss-phase 4 — implementation decisions*
