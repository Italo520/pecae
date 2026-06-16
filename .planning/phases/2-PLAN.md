# Phase 2: Navegação Deslogada (Guest Access) — Plan

## Goal
Permitir acesso de visitantes ao catálogo, pesquisa e anúncios, exigindo login de forma controlada através de deep linking, preservando a navegação (retorno para a tela de origem) e bloqueando áreas restritas como Favoritos.

## Plan

### Fase 2.1: Interceptador de Rota no Guard
- **Arquivo**: `apps/mobile/src/hooks/useAuthGuard.ts`
- **Ação**:
  - Importar `usePathname` e `useGlobalSearchParams` do `expo-router`.
  - Dentro do `requireAuth`, obter a rota atual via `usePathname()`.
  - No `Alert.alert`, modificar o `onPress` do botão "Fazer Login" para fazer `router.push({ pathname: '/(auth)/login', params: { returnUrl: pathname } })`.

### Fase 2.2: Redirecionamento após Login e Cadastro
- **Arquivo**: `apps/mobile/app/(auth)/login.tsx`
- **Ação**:
  - Importar e utilizar `useGlobalSearchParams` para pegar o `returnUrl`.
  - No sucesso do `onSubmit` (e-mail/senha) e do `onSuccess` (Google OAuth), verificar se o usuário é do tipo comprador e se existe o parâmetro `returnUrl`.
  - Se sim, usar `router.replace(returnUrl as string)`.
  - Se não, manter o `navigation.reset` para as `(tabs)/`.

- **Arquivo**: `apps/mobile/app/(auth)/register.tsx`
- **Ação**:
  - Fazer exatamente as mesmas modificações aplicadas no `login.tsx`.

### Fase 2.3: Bloqueio de UI na Aba Favoritos
- **Arquivo**: `apps/mobile/app/(tabs)/favoritos.tsx`
- **Ação**:
  - Importar `useAuthStore` e extrair `isAuthenticated`.
  - Renderizar condicionalmente (`!isAuthenticated`) um Empty State de "Acesso Restrito", idêntico visualmente ao presente na aba de mensagens, indicando "Faça login para ver seus favoritos" e contendo um botão que envia para `/(auth)/login`.

### Fase 2.4: Verificação
- **Ação**:
  - Navegar pelo aplicativo deslogado.
  - Acessar a página de uma sucata e clicar no coração (Favoritar).
  - Verificar se o Alerta aparece.
  - Clicar em "Fazer Login", efetuar login.
  - Comprovar que o aplicativo redireciona de volta para a sucata original.
  - Clicar na aba Favoritos sem estar logado e ver a tela de "Acesso Restrito".
