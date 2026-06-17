# Phase 4: Busca Aprimorada e Filtros — Specification

**Created:** 2026-06-17
**Ambiguity score:** 0.15 (gate: ≤ 0.20)
**Requirements:** 3 locked

## Goal

O sistema de busca possui filtros avançados no estilo Mercado Livre (Tipo, Marca, Modelo, Ano e Versão), detecta o estado do usuário por padrão, e unifica a experiência redirecionando buscas da home para a tela principal de busca.

## Background

Atualmente, a tela de busca (`search.tsx`) possui apenas um campo de texto livre e filtros básicos de Cidade/UF escondidos em um toggle, além de chips para algumas marcas. Não há seletores em cascata de Tipo, Marca, Modelo, Ano e Versão. Na home (`index.tsx`), existe uma barra de busca que precisa redirecionar o usuário corretamente para a tela de busca com os parâmetros iniciais.

## Requirements

1. **Filtros Avançados em Cascata**: Exibir dropdowns estilo Mercado Livre para refinar a busca.
   - Current: A busca possui apenas um campo de texto e campos manuais de Cidade/UF.
   - Target: A interface de busca exibe os selects: Tipo (Motos, Carros, Caminhões), Marca, Modelo, Ano e Versão.
   - Acceptance: O usuário consegue selecionar a "Marca" e os "Modelos" disponíveis são atualizados de acordo (cascata), até chegar na "Versão".

2. **Seleção de Estado Padrão**: O filtro de Estado (UF) deve vir preenchido com a localização atual.
   - Current: O estado (UF) começa vazio, exigindo preenchimento manual.
   - Target: Ao abrir a tela de busca, o campo Estado (UF) já vem selecionado por padrão baseado na localização do usuário ou valor default da aplicação.
   - Acceptance: A tela de busca inicializa com a UF já preenchida e influenciando os resultados de busca.

3. **Redirecionamento da Home**: A busca na tela inicial leva para a busca aprimorada.
   - Current: A home (`index.tsx`) tem uma `<VehicleSearchBar />` que pode não redirecionar com os parâmetros corretos para a interface avançada ou não tem destaque apropriado.
   - Target: Ao interagir com a busca na Home e submeter o texto, o usuário é redirecionado para `/(tabs)/search` com o texto no parâmetro de URL e exibindo a busca aprimorada.
   - Acceptance: Digitar "Corolla" na Home e dar Enter/Buscar redireciona para a aba Search com "Corolla" já preenchido e ativando a requisição de busca correspondente.

## Boundaries

**In scope:**
- Modificação na UI de `search.tsx` para incluir seletores (dropdowns/pickers) de Tipo, Marca, Modelo, Ano e Versão.
- Atualização do hook/logica de busca para suportar os novos parâmetros (tipo, modelo, versão).
- Detectar/Mockar o Estado (UF) padrão do usuário ao acessar a aba Search.
- Ajustar `VehicleSearchBar` na Home (`index.tsx`) para fazer o redirecionamento com parâmetros (`?q=...`).

**Out of scope:**
- Refazer a API de busca do backend (assume-se que a API atual de veículos suporte ou será adaptada no contrato via frontend primeiro).
- Geolocalização complexa com GPS (apenas o Estado em nível básico ou através do perfil/Mock inicial).

## Constraints

- O layout dos filtros deve ser responsivo e seguir a identidade visual (Glassmorphism, cores do tema Peçaê) da plataforma.
- Pickers/Dropdowns devem funcionar bem tanto no ambiente mobile (iOS/Android) quanto na Web.

## Acceptance Criteria

- [ ] A tela de Busca exibe dropdowns de Tipo, Marca, Modelo, Ano e Versão.
- [ ] A tela de Busca carrega com a UF do usuário preenchida por padrão.
- [ ] Ao pesquisar pela Home, o usuário é levado para a tela de Busca com o parâmetro `q` preenchido e selecionado.
- [ ] Os dropdowns de Marca, Modelo e Versão funcionam em cascata (a seleção de um filtra as opções do próximo).

## Ambiguity Report

| Dimension          | Score | Min  | Status | Notes                              |
|--------------------|-------|------|--------|------------------------------------|
| Goal Clarity       | 0.90  | 0.75 | ✓      |                                    |
| Boundary Clarity   | 0.85  | 0.70 | ✓      | Backend scope limits clear         |
| Constraint Clarity | 0.80  | 0.65 | ✓      | Pickers platform constraints       |
| Acceptance Criteria| 0.85  | 0.70 | ✓      | Checkboxes defined                 |
| **Ambiguity**      | 0.15  | ≤0.20| ✓      |                                    |

## Interview Log

| Round | Perspective    | Question summary         | Decision locked                    |
|-------|----------------|-------------------------|------------------------------------|
| 1     | Auto           | Requisitos diretos      | Prompt do usuário utilizado        |

---

*Phase: 04-busca-aprimorada*
*Spec created: 2026-06-17*
*Next step: /gsd-discuss-phase 4 — implementation decisions*
