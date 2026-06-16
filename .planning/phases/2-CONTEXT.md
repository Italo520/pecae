# Phase 2: Navegação Deslogada (Guest Access) — Context

**Domain:** Permissão de navegação para usuários não autenticados no catálogo, busca e visualização de itens, mantendo ações vitais guardadas por redirecionamento preservado.

> [!IMPORTANT]
> **Locked Requirements:** Os requisitos sobre O QUE construir, bem como os limites e critérios de aceitação, estão definidos em [2-SPEC.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/phases/2-SPEC.md). **LEIA ESTE DOCUMENTO PRIMEIRO.** Esta seção de contexto documenta apenas as escolhas de como implementar e de engenharia de software.

## Canonical Refs
- [ROADMAP.md](file:///c:/Users/italo/Desktop/Projects/pecae/.planning/ROADMAP.md)

## Decisions

### 1. UX de Redirecionamento Pós-Login
- **Decisão:** O App usará deep linking paramétrico interno (passagem de state/params via Expo Router). O hook `useAuthGuard` será atualizado para capturar a rota atual (`usePathname`) e enviá-la para a tela de login como um param `returnUrl`.
- **Comportamento Esperado:** A tela de Login (`apps/mobile/app/(auth)/login.tsx`) interceptará o sucesso na autenticação. Se existir `returnUrl`, o router será direcionado (`router.replace` ou `push`) para a URL recuperada, invés de forçar o usuário à `/(tabs)/` (Home).
- **Justificativa:** Garantir a melhor Experiência do Usuário (UX) no fluxo de conversão (comprador olhando vitrine -> tenta iniciar chat -> loga -> retorna automaticamente ao anúncio original).

## Prior Decisions (Contexto de Arquitetura)
- O backend (`vehicles.controller.ts` e `search.controller.ts`) já está adequadamente anotado com `@Public()` e `OptionalJwtAuthGuard`. Portanto, nenhuma mudança de permissionamento no lado do servidor é esperada. O esforço é praticamente 100% no cliente (Mobile/Expo).
