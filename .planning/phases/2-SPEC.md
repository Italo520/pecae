# Phase 2: Navegação Deslogada (Guest Access) — Specification

**Created:** 2026-06-16
**Ambiguity score:** 0.10 (gate: ≤ 0.20)
**Requirements:** 3 locked

## Goal

Permitir que usuários não autenticados (Guest) possam utilizar as áreas públicas do aplicativo (Pesquisar sucatas, acessar detalhes de anúncios, navegar no catálogo) sem bloqueios de login obrigatório na inicialização ou navegação.

## Background

Atualmente, a API já expõe rotas públicas (`@Public()` em `/vehicles/:id` e `/search`). O arquivo `index.tsx` de rotas do Expo verifica o estado de autenticação e redireciona os usuários não logados para `/(tabs)/`, o que já permite em teoria o acesso à navegação principal. Porém, há áreas da UI e possivelmente headers ou lógicas de proteção globais que o usuário reporta que estão exigindo login precocemente ou impedindo o fluxo "Navegar, acessar anúncio e pesquisar" fluir perfeitamente sem autenticação. Esta fase deve formalizar a regra de negócio no App e validar todas as rotas para garantir que as portas públicas do app estejam totalmente liberadas e apenas as ações restritas (Favoritar, Iniciar Chat, Vender) exijam login e emitam o Alert correto.

## Requirements

1. **Acesso livre à tela inicial e catálogo**: O aplicativo não deve exigir login imediatamente ao abrir e nem deve bloquear o carregamento das abas principais (Home e Pesquisar).
   - Current: O app aparentemente já tem redirecionamento para a Home via `index.tsx`, mas a percepção do usuário é de limitação de acesso.
   - Target: Todo o conteúdo de catálogo, incluindo fotos de veículos, filtros básicos, listas de recomendados e banners, devem carregar normalmente sem Token no cabeçalho HTTP.
   - Acceptance: Renderização dos "Recomendados", banners e busca funciona retornando HTTP 200 para um visitante 100% deslogado.

2. **Detalhes do Veículo (Anúncio)**: O usuário deslogado pode clicar em um "card" e ver todos os detalhes técnicos do veículo.
   - Current: O componente `vehicle/[id].tsx` existe.
   - Target: O componente carrega as informações do `/vehicles/:id` consumindo a rota pública (que aceita `OptionalJwtAuthGuard`). As imagens carregam normalmente.
   - Acceptance: Tela de detalhes de um veículo é aberta sem exibir alertas de "Acesso Restrito".

3. **Intercepção no Botão Certo (UX de bloqueio tardio)**: Se o usuário deslogado tentar Iniciar Negociação ou Favoritar, um popup o direcionará para o Login, e o estado deve ser mantido se possível.
   - Current: `requireAuth` é usado no clique de Favoritar e Iniciar Negociação.
   - Target: Garantir que a intercepção seja limpa e redirecione para a página de auth `/(auth)/login` apenas nos botões de conversão primária, sem "quebrar" a UI da página de fundo.
   - Acceptance: Clicar no coração (Favorito) sem login dispara o Alert de `useAuthGuard`. Clicar em Iniciar Chat dispara o Alert. A tela de trás permanece renderizada.

## Boundaries

**In scope:**
- Validar fluxo de bootup e splash screen sem token de usuário.
- Fluxo de "Pesquisa de Sucatas".
- Visualização de Perfil de Vendedor (caso a plataforma possua uma tela pública de perfil de vendedor).
- Visualização de detalhes do Anúncio (Vehicle details).

**Out of scope:**
- Chat (Restrito a usuários logados — Fica bloqueado pelo `useAuthGuard`).
- Publicar Peças / Sucatas (Restrito a Vendedores).
- Painel de Analytics (Admin/Vendedor).
- Gerenciar Perfil (Configurações).

## Constraints

- Não podemos expor dados sensíveis do vendedor na tela de detalhe se a lei de moderação exigir que apenas logados vejam (porém o sistema atual pelo `@Public()` no endpoint indica que os detalhes são públicos).
- O backend já deve suportar buscas sem JWT Token. O uso de tokens expirados no LocalStorage do frontend não deve travar o app em uma "tela branca" ou "loop de refresh token" infinito.

## Acceptance Criteria

- [ ] Instalar o app limpo (limpando cookies/AsyncStorage) não impede o acesso à Home.
- [ ] A aba "Pesquisar" retorna resultados válidos sem auth header.
- [ ] O usuário consegue acessar a tela de um veículo `/vehicle/123` e ver as peças disponíveis.
- [ ] O botão de "Favoritos" intercepta com um alerta "Você precisa estar logado".
- [ ] O botão de "Mensagens/Chat" intercepta com um alerta "Você precisa estar logado".

## Ambiguity Report

| Dimension          | Score | Min  | Status | Notes                              |
|--------------------|-------|------|--------|------------------------------------|
| Goal Clarity       | 0.95  | 0.75 | ✓      | Regra de negócio explícita         |
| Boundary Clarity   | 0.90  | 0.70 | ✓      | Bem claro o que entra/sai          |
| Constraint Clarity | 0.85  | 0.65 | ✓      | App deve aceitar boot deslogado    |
| Acceptance Criteria| 0.90  | 0.70 | ✓      | Checklist de 5 itens falsificáveis |
| **Ambiguity**      | 0.10  | ≤0.20| ✓      | Totalmente claro e objetivo        |

## Interview Log

| Round | Perspective    | Question summary                                | Decision locked                                             |
|-------|----------------|-------------------------------------------------|-------------------------------------------------------------|
| 1     | Auto-Analysis  | Como a API lida com deslogados hoje?            | A API expõe `@Public()` no search e detalhes de veículo.    |
| 2     | Auto-Analysis  | O que a view frontend protege com o Guard hoje? | O clique em favoritos, chat e as abas do Seller.            |
| 3     | UX Analista    | Qual a expectativa correta de navegação?        | Ver tudo, exceto conversões/ações de estado privado.        |

---

*Phase: 02-guest-access*
*Spec created: 2026-06-16*
*Next step: /gsd-discuss-phase 2 — implementation decisions (verificações nas abas, requests offline, clean state, etc.)*
