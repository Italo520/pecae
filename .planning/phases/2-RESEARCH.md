# Phase 2: Navegação Deslogada (Guest Access) — Research

## Contexto e Escopo
A fase 2 visa permitir que usuários não autenticados naveguem pelo catálogo, detalhes dos anúncios e busca, mas sejam bloqueados de forma amigável ao tentarem realizar ações que exigem conta (Favoritar, Enviar Mensagem). Foi decidido (em CONTEXT.md) que a abordagem será o uso de deep linking: o Guard passará a URL atual para a tela de Login, e a tela de Login redirecionará de volta.

## Arquivos Chave Analisados

1. **`apps/mobile/src/hooks/useAuthGuard.ts`**:
   - É o centralizador das checagens. Usa `useAuthStore` e dispara um alerta que redireciona para `/(auth)/login`.
   - Modificação necessária: Obter a rota atual via `usePathname` e `useGlobalSearchParams` do `expo-router`. Enviar o parâmetro `returnUrl` na navegação do Alert (Ex: `router.push({ pathname: '/(auth)/login', params: { returnUrl: pathname } })`).

2. **`apps/mobile/app/(auth)/login.tsx`** e **`register.tsx`**:
   - Atualmente, ao logar com sucesso, eles reiniciam a stack chamando `(navigation as any).reset(...)` apontando para `/(tabs)/`.
   - Modificação necessária: Usar `useGlobalSearchParams` para pegar o `returnUrl`. Se existir, invés de forçar a `(tabs)/`, usar `router.replace(returnUrl as string)`.

3. **`apps/mobile/app/(tabs)/favoritos.tsx`**:
   - Falha silenciosamente ou fica em 'loading' eterno/crash porque tenta carregar favoritos sem Auth (embora `useFavorites` use `enabled: !!token`). 
   - Modificação necessária: Implementar um Empty State "ACESSO RESTRITO" caso `!isAuthenticated`, idêntico ao já existente e bem implementado na tela de `mensagens.tsx`.

4. **`apps/mobile/app/(tabs)/_layout.tsx` e `profile.tsx`**:
   - A aba "Entrar/Perfil" é bem resolvida por `profile.tsx` que redireciona diretamente para `/login` se não autenticado. A busca e home são acessíveis porque o backend (`OptionalJwtAuthGuard`) não trava.
   - Nenhuma modificação necessária nesta parte.

## Conclusão
O backend já está preparado para aceitar visitantes. O esforço é 100% focado no frontend (Expo Router) para roteamento com persistência de estado e proteção das abas Favoritos/Mensagens. Nenhuma arquitetura de banco de dados (`schema_push`) será afetada.
