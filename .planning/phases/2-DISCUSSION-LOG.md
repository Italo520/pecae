# Phase 2: Navegação Deslogada (Guest Access) — Discussion Log

This file is a historical log of the discussion that produced CONTEXT.md. It is for human reference only and is NOT consumed by downstream agents.

## Area: Redirecionamento Pós-Login
**Options presented:**
1. (Recommended) Passar `returnUrl` na navegação do Guard. Após o login, rotear de volta exatamente para onde estava (ex: `/vehicle/123`). Melhor UX, mas exige ajustar o `login.tsx` para ler os params.
2. Ignorar de onde veio. Ao fazer login, enviar sempre para a Home `/(tabs)/`. Mais fácil de implementar, mas o usuário perde a página da sucata.
3. Fazer login abrir num Modal/BottomSheet sobreposto à tela atual. Assim não perdemos o estado, fecha o modal e já pode clicar de novo. Exige mais esforço de UI.

**User selection:**
`(Recommended) Passar returnUrl na navegação do Guard. Após o login, rotear de volta exatamente para onde estava (ex: /vehicle/123). Melhor UX, mas exige ajustar o login.tsx para ler os params.`

**Notes:**
- A prioridade é UX focada na conversão de venda (reter o interesse no veículo após barreira de auth).
- Optou-se pela solução de deep link via rotas em vez do uso complexo de Modais para login, pois o login é um fluxo isolado que limpa a stack, logo a passagem de `returnUrl` atende perfeitamente.
