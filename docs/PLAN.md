# Plano de Correção: Redirecionamento Pós-Login do Comprador

## 🎯 Objetivo
Garantir que, ao realizar o login como Comprador (`BUYER`), o usuário seja direcionado diretamente para a listagem de veículos disponíveis para venda (`/(tabs)/index.tsx`), em vez de cair na aba de Perfil.

## 🔍 Análise Atual
1. **Ponto de Login:** `apps/mobile/app/(auth)/login.tsx` direciona usuários `BUYER` usando `router.replace('/(tabs)')`.
2. **Layout de Tabs:** `apps/mobile/app/(tabs)/_layout.tsx` define a tab `index` como a primeira da lista (Início) e `profile` como a última.
3. **Causa Provável:** 
   - A rota `/(tabs)` sem o sufixo `/index` pode estar resolvendo para a última aba visitada pelo estado de navegação em cache do Expo Router, ou caindo na aba de perfil devido a um redirecionamento implícito.
   - Alternativamente, o cache do bundler ou estado persistido localmente do aplicativo está mantendo o usuário na rota de perfil anterior.

## 🛠️ Plano de Ação

### Fase 1: Correção do Roteamento do Login
- Alterar as chamadas `router.replace('/(tabs)')` em `apps/mobile/app/(auth)/login.tsx` para usar o caminho explícito e canônico: `router.replace('/(tabs)/')` ou `router.replace('/(tabs)/index')`.
- Ajustar tanto o login por E-mail/Senha quanto o login via Google.

### Fase 2: Correção do Roteamento Inicial
- Atualizar `apps/mobile/app/index.tsx` para redirecionar explicitamente para `/(tabs)/` em vez de `/(tabs)`.

### Fase 3: Verificação e Validação
- Limpar cache de navegação local e validar o fluxo de login de comprador e vendedor.

## 🧪 Critérios de Aceite
- Ao logar com `comprador@pecae.com.br`, a tela inicial apresentada deve ser o **Terminal de Veículos/Peças** (`apps/mobile/app/(tabs)/index.tsx`).
- O fluxo do vendedor não deve ser afetado negativamente.
