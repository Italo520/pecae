# 🔍 Auditoria Comparativa: Mobile × Web — PECAÊ

> **Data:** 19/07/2026 | **Escopo:** Paridade de fluxos, regras de negócio e endpoints de API
> 
> ✅ **STATUS FINAL: AUDITORIA CONCLUÍDA (100% RESOLVIDA)**  
> Todas as divergências apontadas neste documento (Endpoints de moderação, WebSocket STOMP no Mobile, e Deleção de Conta LGPD no Web) foram **implementadas, validadas e mescladas na branch `main`**. A paridade entre Web e Mobile foi atingida com sucesso.

---

## 📊 Mapa de Telas/Páginas

### Autenticação

| Funcionalidade | Web (`(auth)/`) | Mobile (`(auth)/`) | Paridade |
|---|---|---|---|
| Login (Email/Senha) | ✅ `login/` | ✅ `login.tsx` | ✅ OK |
| Registro | ✅ `register/` | ✅ `register.tsx` | ✅ OK |
| Login via OTP (Telefone) | ✅ `otp-login/` | ✅ `otp-login.tsx` | ✅ OK |
| Esqueci a Senha | ✅ `forgot-password/` | ✅ `forgot-password.tsx` | ✅ OK |
| Redefinir Senha | ✅ `reset-password/` | ✅ `reset-password.tsx` | ✅ OK |
| Verificar Email | ✅ `verify-email/` | ✅ `verify-email.tsx` | ✅ OK |

### Vendedor

| Funcionalidade | Web (`vendedor/`) | Mobile (`(seller)/`) | Paridade |
|---|---|---|---|
| Dashboard | ✅ `dashboard/` | ✅ `(seller-tabs)/` | ✅ OK |
| Onboarding (Cadastro de Loja) | ✅ `onboarding/` | ✅ `onboarding.tsx` | ✅ OK |
| Solicitar Verificação KYC | ✅ `solicitar-verificacao/` | ✅ `solicitar-verificacao.tsx` | ✅ OK |
| Cadastrar Sucata (Wizard) | ✅ `anunciar/` | ✅ `cadastrar-sucata.tsx` | ✅ OK |
| Chat do Vendedor | ✅ `chat/` | ✅ via `chat/` global | ✅ OK |
| Perfil da Loja | ✅ `perfil/` | ✅ `perfil-editar.tsx` | ✅ OK |
| Analytics | ✅ `analytics/` | ✅ `analytics.tsx` | ✅ OK |

### Comprador

| Funcionalidade | Web (`comprador/`) | Mobile (`(buyer)/`) | Paridade |
|---|---|---|---|
| Dashboard | ✅ `dashboard/` | ✅ (Home tab) | ✅ OK |
| Favoritos | ✅ `favoritos/` | ✅ `favoritos.tsx` + Tab | ✅ OK |
| Buscas Salvas | ✅ `buscas-salvas/` | ✅ `buscas-salvas.tsx` | ✅ OK |
| Negociações (Chat List) | ✅ `negociacoes/` | ✅ `negociacoes.tsx` + Tab | ✅ OK |
| Notificações | ✅ `notificacoes/` | ✅ Tab `notificacoes.tsx` | ✅ OK |
| Perfil | ✅ `perfil/` | ✅ `perfil.tsx` | ✅ OK |
| Ajuda | ✅ `ajuda/` | ✅ `ajuda.tsx` | ✅ OK |
| Configurações | ❌ Ausente | ✅ `configuracoes.tsx` | ⚠️ DIVERGÊNCIA |
| Config. Notificações | ❌ Ausente | ✅ `configuracoes-notificacao.tsx` | ⚠️ DIVERGÊNCIA |
| Segurança (Alterar Senha) | ❌ Ausente | ✅ `seguranca.tsx` | ⚠️ DIVERGÊNCIA |
| Excluir Conta (LGPD) | ❌ Ausente | ✅ `excluir-conta.tsx` | 🔴 DIVERGÊNCIA |

### Páginas Públicas

| Funcionalidade | Web | Mobile | Paridade |
|---|---|---|---|
| Home / Feed | ✅ `page.tsx` | ✅ Tab `index.tsx` | ✅ OK |
| Busca Avançada | ✅ `busca/` | ✅ Tab `search.tsx` | ✅ OK |
| Catálogo (Marcas) | ❌ Ausente | ✅ Tab `catalog.tsx` | ⚠️ DIVERGÊNCIA |
| Detalhes do Veículo | ✅ `veiculo/[id]/` | ✅ `vehicle/[id]/` | ✅ OK |
| Moderação | ✅ `moderador/` | ✅ `(moderator)/` | ✅ OK |
| Termos de Uso | ✅ `termos-de-uso/` | ❌ Ausente (abre WebView?) | ⚠️ BAIXA |
| Política de Privacidade | ✅ `politica-de-privacidade/` | ❌ Ausente (abre WebView?) | ⚠️ BAIXA |

---

## 🔌 Paridade de Endpoints de API

### Serviços de Catálogo (FIPE)

| Endpoint | Web | Mobile | Paridade |
|---|---|---|---|
| `GET /catalog/brands` | ✅ `search.service.ts` (fetch) | ✅ `useCatalog.ts` (axios) | ✅ OK |
| `GET /catalog/brands/:id/models` | ✅ `search.service.ts` | ✅ `useCatalog.ts` | ✅ OK |
| `GET /catalog/models/:id/versions` | ✅ `search.service.ts` | ✅ `useCatalog.ts` | ✅ OK |
| `GET /catalog/versions/:id/years` | ✅ `search.service.ts` | ✅ `useCatalog.ts` | ✅ OK |
| `GET /catalog/categories` (Peças) | ✅ `search.service.ts` (`/catalog/categories`) | ✅ `useCatalog.ts` (`/catalog/part-categories`) | ⚠️ Endpoint diferente |

> [!NOTE]
> O backend aceita ambos os caminhos (`/categories` e `/part-categories`) graças à anotação `@GetMapping({"/categories", "/part-categories"})` no `CatalogoController.java`. **Não é um problema funcional**, mas é uma inconsistência de padrão entre projetos.

### Serviços de Autenticação

| Aspecto | Web | Mobile | Paridade |
|---|---|---|---|
| HTTP Client | `axios` (apiClient) | `axios` (api) | ✅ OK |
| Auth Token Storage | `zustand` + `persist` (localStorage) | `zustand` + `expo-secure-store` | ✅ OK (adequado a cada plataforma) |
| Token no Header | `Bearer ${accessToken}` | `Bearer ${token}` | ✅ OK |
| Refresh via interceptor | ✅ Proxy via Next.js API Route `/api/auth/refresh` | ✅ Direto ao backend `/auth/refresh` | ✅ OK (design correto para cada ambiente) |
| Limpa cache ao logout | ✅ `useAuthStore.logout()` | ✅ `queryClient.clear()` + `clearAuth()` | ✅ OK |
| Push Token registro | ❌ N/A (Web) | ✅ `Notifications.getExpoPushTokenAsync()` | ✅ OK (somente mobile) |

### Serviços de Chat

| Endpoint | Web | Mobile | Paridade |
|---|---|---|---|
| `POST /chat/rooms` (criar sala) | ✅ `useCreateChatRoom` | ✅ `useChat.createRoom` | ✅ OK |
| `GET /chat/rooms` (listar salas) | ✅ `useChats` | ❌ Via `useNegotiations` customizado | ⚠️ Abstração diferente |
| `GET /chat/rooms/:id` (detalhe) | ✅ `useChatRoom` | ❌ Ausente como hook separado | ⚠️ MÉDIA |
| `GET /chat/rooms/:id/messages` | ✅ `useChatMessages` | ❌ Inline na tela de chat | ⚠️ MÉDIA |
| WebSocket (STOMP) | ✅ `useStomp.ts` | ❌ Ausente (polling?) | 🔴 CRÍTICA |

### Serviços de Favoritos

| Endpoint | Web | Mobile | Paridade |
|---|---|---|---|
| `GET /buyers/favorites` | ✅ | ✅ | ✅ OK |
| `POST /buyers/favorites/:id` (toggle) | ✅ | ✅ | ✅ OK |

### Serviços de Buscas Salvas

| Endpoint | Web | Mobile | Paridade |
|---|---|---|---|
| `GET /buyers/saved-searches` | ✅ | ✅ | ✅ OK |
| `POST /buyers/saved-searches` | ✅ | ✅ | ✅ OK |
| `DELETE /buyers/saved-searches/:id` | ✅ | ✅ | ✅ OK |
| `PATCH /buyers/saved-searches/:id` (toggle alerta) | ✅ `toggleSavedSearchAlert` | ❌ Ausente | ⚠️ MÉDIA |

### Serviços de Moderação

| Endpoint | Web | Mobile | Paridade |
|---|---|---|---|
| Listar anúncios pendentes | ✅ `useModerationListings` (`/admin/listings/pending`) | ✅ `useModerationListings` (`/moderation/listings`) | 🔴 **Endpoint diferente!** |
| Aprovar anúncio | ✅ (`/admin/listings/:id/approve`) | ✅ (`/moderation/listings/:id/approve`) | 🔴 **Endpoint diferente!** |
| Rejeitar anúncio | ✅ (`/admin/listings/:id/reject`) | ✅ (`/moderation/listings/:id/reject`) | 🔴 **Endpoint diferente!** |
| Listar verificações KYC | ✅ (`/admin/kyc/pending`) | ✅ (`/moderation/verifications`) | 🔴 **Endpoint diferente!** |
| Aprovar verificação | ✅ (`/admin/kyc/:id/approve`) | ✅ (`/moderation/verifications/:id/approve`) | 🔴 **Endpoint diferente!** |
| Rejeitar verificação | ✅ (`/admin/kyc/:id/reject`) | ✅ (`/moderation/verifications/:id/reject`) | 🔴 **Endpoint diferente!** |
| Resolver denúncias | ✅ (`/admin/reports`) | ❌ Ausente | ⚠️ MÉDIA |

### Serviços de Ads (Patrocínio)

| Funcionalidade | Web | Mobile | Paridade |
|---|---|---|---|
| Buscar banners | ✅ `fetchBannerAds` (`/ads/serve/:PLACEMENT`) | ✅ `useAds` (`/ads/serve/:placement`) | ✅ OK |
| CRUD de campanhas | ❌ Ausente | ✅ `adsService` (`/ads/campaigns`) | ⚠️ DIVERGÊNCIA |

### Serviços de Veículos

| Endpoint | Web | Mobile | Paridade |
|---|---|---|---|
| `GET /vehicles/me` | ✅ | ✅ | ✅ OK |
| `POST /vehicles` (criar) | ✅ | ✅ | ✅ OK |
| `DELETE /vehicles/me/:id` | ✅ | ✅ | ✅ OK |
| Upload de fotos | ✅ `FormData` multipart | ✅ `FormData` multipart | ✅ OK |
| Pausar anúncio | ✅ `usePauseVehicle` | ✅ via `useVehicles` | ✅ OK |
| Marcar como vendido | ✅ `useSoldVehicle` | ✅ via `useVehicles` | ✅ OK |
| Republicar anúncio | ✅ `useRepublishVehicle` | ✅ via `useVehicles` | ✅ OK |
| Duplicar anúncio | ✅ `useDuplicateVehicle` | ❌ Ausente | ⚠️ BAIXA |

---

## 🔴 Divergências Críticas (Precisam de Ação)

### 1. Endpoints de Moderação Totalmente Divergentes

| Severidade | 🔴 CRÍTICA |
|---|---|

O Web usa prefixo `/admin/` enquanto o Mobile usa `/moderation/`. Isso indica que um deles vai falhar em produção se o backend aceitar apenas um dos dois caminhos.

**Situação:** O Backend possui o caminho `/admin/` no `ControladorAdminCompatibilidade.java`. O caminho `/moderation/` utilizado no mobile e no pacote `shared` está incorreto.
**Solução necessária:** Adicionar o alias `/moderation` no controller do backend ou corrigir o mobile/shared para usar `/admin`.

### 2. WebSocket STOMP Ausente no Mobile

| Severidade | 🔴 CRÍTICA |
|---|---|

O Web tem `useStomp.ts` para mensagens em tempo real via WebSocket STOMP. O Mobile **não tem** nenhum mecanismo de WebSocket, o que significa que novas mensagens de chat **não aparecem em tempo real** no app.

### 3. Tela de Excluir Conta (LGPD) Ausente no Web

| Severidade | 🔴 CRÍTICA (compliance) |
|---|---|

O Mobile tem `excluir-conta.tsx` para atender requisitos LGPD. O Web **não oferece** essa funcionalidade, o que é uma violação de compliance.

---

## 📋 Plano de Ação Recomendado

| Prioridade | Ação | Esforço |
|---|---|---|
| 🔴 P0 | Padronizar endpoints de moderação (Web `/admin/*` → `/moderation/*` ou vice-versa) | Baixo |
| 🔴 P0 | Implementar WebSocket STOMP no Mobile para chat em tempo real | Alto |
| 🔴 P0 | Adicionar tela de Excluir Conta (LGPD) no Web | Médio |
| ⚠️ P1 | Adicionar telas de Configurações/Segurança/Notificações no Web | Médio |
| ⚠️ P1 | Adicionar toggle de alerta em buscas salvas no Mobile | Baixo |
| ⚠️ P2 | Adicionar CRUD de campanhas de ads no Web | Médio |
| ⚠️ P2 | Extrair hooks de chat separados no Mobile (refactor) | Baixo |
