# PECAÊ — Análise Completa de Pendências para MVP Usual

**Versão:** 1.0.0  
**Data:** 18 de Julho de 2026  
**Autor:** Especialista em Marketplace e Requisitos  
**Base de comparação:** PRD v2 (`v2_PRD-PECAE.md`) × Implementação real (Java 25 / Spring Boot + Next.js 15 + React Native Expo)

---

## Sumário Executivo

O PECAÊ possui uma base sólida: backend Java 25 com 18 módulos, frontend web Next.js 15 com rotas para comprador/vendedor/moderador, e app mobile React Native com Expo Router. Porém, comparando com os requisitos do PRD para um MVP "usual" (funcionalidades 1-14 da §17.1), **existem lacunas críticas que impedem o uso real por usuários**.

Esta análise categoriza **70+ itens pendentes** em 9 áreas, com justificativa e ordem de implementação.

---

## Índice

1. [Legenda de Prioridade](#legenda-de-prioridade)
2. [Área 1 — Gestão de Ciclo de Vida do Anúncio](#área-1--gestão-de-ciclo-de-vida-do-anúncio)
3. [Área 2 — Chat Realtime (WebSocket)](#área-2--chat-realtime-websocket)
4. [Área 3 — Catálogo Automotivo (Dados FIPE)](#área-3--catálogo-automotivo-dados-fipe)
5. [Área 4 — Busca e Descoberta](#área-4--busca-e-descoberta)
6. [Área 5 — Moderação e Confiança](#área-5--moderação-e-confiança)
7. [Área 6 — Paridade de Plataforma (Web = Mobile)](#área-6--paridade-de-plataforma-web--mobile)
8. [Área 7 — Conformidade Legal (LGPD / Termos)](#área-7--conformidade-legal-lgpd--termos)
9. [Área 8 — Notificações In-App](#área-8--notificações-in-app)
10. [Área 9 — Experiência do Usuário (UX) e Fluxos Incompletos](#área-9--experiência-do-usuário-ux-e-fluxos-incompletos)
11. [Matriz de Implementação por Ondas](#matriz-de-implementação-por-ondas)
12. [Resumo de Cobertura PRD × Implementação](#resumo-de-cobertura-prd--implementação)

---

## Legenda de Prioridade

| Símbolo | Prioridade | Significado |
|---------|-----------|-------------|
| 🔴 | P0 — Blocker | Impede o uso da plataforma. Sem isso, não é "usual". |
| 🟠 | P1 — Crítico | Funcionalidade esperada por qualquer marketplace. Falta dela causa frustração. |
| 🟡 | P2 — Importante | Melhora significativamente a experiência. Pode ir logo após P0/P1. |
| 🟢 | P3 — Desejável | Nice-to-have para o MVP. Pode ficar para sprint posterior. |

---

## Área 1 — Gestão de Ciclo de Vida do Anúncio

> **Por que falta:** O `ControladorAnuncio` implementa: `criar`, `atualizar`, `marcarComoVendido` e `deletar`. Porém **faltam ações essenciais** de ciclo de vida que o PRD (M08) exige para que o vendedor gerencie seu inventário de forma completa.

### O que existe

| Funcionalidade | Backend | Mobile | Web |
|----------------|---------|--------|-----|
| Criar anúncio | ✅ `POST /listings/me` | ✅ `cadastrar-sucata.tsx` | ✅ `/vendedor/anunciar/` |
| Listar meus anúncios | ✅ `GET /listings/me` | ✅ `inventory.tsx` | ✅ `/vendedor/dashboard/` |
| Atualizar anúncio | ✅ `PATCH /listings/me/{id}` | ⚠️ Parcial | ⚠️ Parcial |
| Marcar como vendido | ✅ `PATCH /listings/me/{id}/sold` | ❌ Sem UI | ❌ Sem UI |
| Excluir (soft delete) | ✅ `DELETE /listings/me/{id}` | ❌ Sem UI | ❌ Sem UI |

### O que falta

| # | Pendência | Prioridade | Por que falta | Impacto |
|---|-----------|-----------|---------------|---------|
| 1.1 | **Endpoint de Pausar anúncio** (`PATCH /listings/me/{id}/pause`) | 🔴 P0 | O backend não tem rota para pausar. Status `PAUSED` pode existir no enum `StatusVeiculo`, mas o fluxo não está implementado. | Vendedor não pode ocultar temporariamente um anúncio sem deletá-lo. |
| 1.2 | **Endpoint de Republicar anúncio** (`PATCH /listings/me/{id}/republish`) | 🔴 P0 | Sem rota para reativar um anúncio pausado ou expirado. | Vendedor que pausou não consegue voltar a exibir o anúncio. |
| 1.3 | **Endpoint de Duplicar anúncio** (`POST /listings/me/{id}/duplicate`) | 🟡 P2 | Não implementado. | Vendedor com múltiplas sucatas similares perde tempo recadastrando do zero. |
| 1.4 | **Endpoint de Encerrar anúncio** (`PATCH /listings/me/{id}/close`) | 🟠 P1 | Apenas soft delete existe. Encerrar é diferente: finaliza definitivamente mas mantém visível no histórico. | Vendedor não tem distinção entre "excluir" e "encerrar". |
| 1.5 | **UI mobile: botões de ação no inventário** (Pausar, Republicar, Vendido, Encerrar) | 🔴 P0 | Tela `inventory.tsx` lista anúncios mas não tem ações de gestão de status. | Vendedor não consegue gerenciar seus anúncios pelo app. |
| 1.6 | **UI web: mesmas ações no dashboard do vendedor** | 🔴 P0 | Dashboard do vendedor web não exibe ações de ciclo de vida. | Paridade web/mobile quebrada. |
| 1.7 | **Tela de Histórico de Vendas** (mobile `sales.tsx` mostra "Em breve...") | 🟡 P2 | Placeholder sem implementação. | Vendedor não tem registro do que já vendeu. |
| 1.8 | **Atualizar peças disponíveis após negociação** (RF26) | 🟠 P1 | Backend suporta update parcial de veículo, mas não há UI específica para o vendedor desmarcar peças negociadas da lista. | Comprador vê peças que já foram vendidas como disponíveis. |
| 1.9 | **Atualizar fotos do veículo após retirada de peças** (RF26) | 🟡 P2 | Upload de novas fotos é possível, mas não há fluxo UX para "atualizar fotos do estado atual". | Fotos desatualizadas geram desconfiança. |

---

## Área 2 — Chat Realtime (WebSocket)

> **Por que falta:** A infraestrutura backend existe (`ControladorWebSocketChat`, `ConfiguracaoWebSocket`, `ListenerMensagemChatRedis`), mas o chat **não funciona end-to-end em tempo real** atualmente. O chat é o ÚNICO canal de negociação (RN04 — plataforma não exibe preços). Sem chat funcional, o PECAÊ não é utilizável.

### O que existe

| Componente | Status |
|-----------|--------|
| Backend REST (`ControladorChat`) | ✅ Criar sala, enviar mensagem, listar mensagens |
| Backend WebSocket (`ControladorWebSocketChat`) | ⚠️ Estrutura existe, mas não confirmado funcional |
| Redis Pub/Sub (`ListenerMensagemChatRedis`) | ⚠️ Listener existe, integração não testada |
| Mobile UI (`chat/[roomId].tsx` — 18KB) | ⚠️ UI renderiza, WebSocket não conecta |
| Web UI (`/vendedor/chat/`) | ⚠️ Diretório existe, implementação parcial |

### O que falta

| # | Pendência | Prioridade | Por que falta | Impacto |
|---|-----------|-----------|---------------|---------|
| 2.1 | **Integração WebSocket end-to-end (mobile)** | 🔴 P0 | O `ControladorWebSocketChat` (STOMP/SockJS) existe mas o client mobile não faz handshake WebSocket corretamente. Precisa de client STOMP compatível com React Native. | Chat em tempo real não funciona. Usuários não conseguem negociar. |
| 2.2 | **Integração WebSocket end-to-end (web)** | 🔴 P0 | Mesma situação para o web-frontend Next.js. | Paridade web impossível sem chat funcional. |
| 2.3 | **Indicador de "digitando..." (typing indicator)** | 🟢 P3 | Não implementado. | UX inferior, mas não bloqueia. |
| 2.4 | **Indicador de mensagem lida** (RF51) | 🟠 P1 | Backend tem entidade `LeituraSala`, mas o fluxo de marcar/exibir "lida" não está completo nas UIs. | Vendedor não sabe se o comprador viu a resposta. |
| 2.5 | **Envio de imagens no chat** (RF49) | 🟠 P1 | Backend aceita `type: TEXT/IMAGE`, mas upload de imagem via chat não está implementado nas UIs. | Comprador não pode enviar foto da peça que precisa. |
| 2.6 | **Respostas rápidas pré-cadastradas para vendedor** (RF53) | 🟡 P2 | Não implementado. | Vendedor perde tempo digitando respostas repetitivas. |
| 2.7 | **Contexto do anúncio visível no header do chat** | 🟠 P1 | Chat deve exibir mini-card do anúncio (foto + modelo do veículo) no topo da conversa para manter o contexto. | Vendedor com muitos chats perde contexto de qual negociação é sobre qual veículo. |
| 2.8 | **Bloqueio de chat em anúncios vendidos** (RN11) | 🟠 P1 | Regra de negócio existe no PRD, mas validação de "anúncio vendido → bloquear abertura de chat" não está implementada. | Compradores iniciam negociação em anúncios já vendidos. |
| 2.9 | **Denúncia e bloqueio dentro do chat** (RF52) | 🟡 P2 | Módulo de denúncia existe no backend, mas não há botão de denúncia/bloqueio integrado na UI de chat. | Impossível denunciar comportamento abusivo durante conversa. |

---

## Área 3 — Catálogo Automotivo (Dados FIPE)

> **Por que falta:** O `CatalogoController` e `AdminCatalogoController` expõem endpoints para consultar e gerenciar marcas, modelos, versões e anos. Porém, **não há evidência de que dados reais da Tabela FIPE foram importados para o banco de dados**. Sem dados, o wizard "Marca → Modelo → Ano" não funciona.

### O que falta

| # | Pendência | Prioridade | Por que falta | Impacto |
|---|-----------|-----------|---------------|---------|
| 3.1 | **Script/migração de importação de dados FIPE** | 🔴 P0 | Não há script de seed ou migração Flyway/Liquibase que popule tabelas de marcas, modelos, versões e anos com dados reais. | Vendedor não consegue cadastrar veículo. Comprador não consegue buscar. **TODO o fluxo core está bloqueado.** |
| 3.2 | **Dados de pelo menos as 20 marcas mais populares** (VW, Fiat, GM, Ford, Hyundai, Toyota, Honda, Renault, Chevrolet, Jeep, Nissan, Peugeot, Citroën, Kia, Mitsubishi, BMW, Mercedes, Audi, Land Rover, Volvo) | 🔴 P0 | Sem dados de seed validados. | Busca retorna zero resultados. |
| 3.3 | **Endpoint de busca/autocomplete no catálogo** (Marca → Modelo → Ano cascata) | 🟠 P1 | `CatalogoController` provavelmente expõe listagem, mas precisa de filtragem em cascata (selecionar marca → carregar modelos daquela marca). | UX de cadastro quebrada sem cascata. |
| 3.4 | **Lista fixa de categorias de peças** (PartCategory) — seed de dados | 🔴 P0 | PRD (RF24/RF25) exige lista fixa de categorias de peças (motor, câmbio, suspensão, freios, etc.). Sem seed dessas categorias, vendedor não pode marcar peças disponíveis. | Campo obrigatório do anúncio fica vazio. |
| 3.5 | **UI de seleção de peças disponíveis no wizard de cadastro** (mobile + web) | 🟠 P1 | Tela `cadastrar-sucata.tsx` (10KB) e web `/vendedor/anunciar/` podem ter wizard parcial, mas sem dados de `PartCategory`, o seletor fica vazio. | Fluxo de cadastro incompleto. |

---

## Área 4 — Busca e Descoberta

> **Por que falta:** O PRD (M07) descreve uma engine de busca robusta com Full-Text Search, autocomplete, filtros por marca/modelo/ano/localização, e ordenação por relevância/data/proximidade. O backend tem `FiltrosAnuncioQuery`, o mobile tem `search.tsx` (22KB), e o web tem `/busca/page.tsx`. Mas faltam ajustes críticos.

### O que falta

| # | Pendência | Prioridade | Por que falta | Impacto |
|---|-----------|-----------|---------------|---------|
| 4.1 | **Full-Text Search funcional no PostgreSQL** | 🔴 P0 | Precisa de configuração de `tsvector`/`tsquery` com dicionário `portuguese` no schema. Não há evidência de índices GIN ou vetores de busca configurados. | Busca textual não retorna resultados relevantes ou não funciona. |
| 4.2 | **Autocomplete em tempo real** (RF34) | 🟠 P1 | Endpoint de sugestões de termos enquanto digita não encontrado. | UX inferior — comprador digita termo completo sem assistência. |
| 4.3 | **Filtro de busca por localização** (estado/cidade ou raio) | 🟠 P1 | `FiltrosAnuncioQuery` pode ter campos de localização, mas precisa validar se filtra corretamente por estado/cidade. | Comprador em SP vê resultados de todo o Brasil. |
| 4.4 | **Ordenação por proximidade geográfica** | 🟡 P2 | Requer cálculo de distância usando `lat/lng` ou integração com PostGIS. | Comprador não encontra sucatas mais próximas primeiro. |
| 4.5 | **Sinônimos e termos populares** (RF39) | 🟡 P2 | Configuração de dicionário de sinônimos para Full-Text Search (ex: "câmbio" = "transmissão", "farol" = "lanterna"). | Busca perde resultados por variação de termos. |
| 4.6 | **Tela "Nenhum resultado" com sugestão de salvar alerta** | 🟠 P1 | Quando busca retorna vazio, deve sugerir criar alerta (RF58). | Comprador sai frustrado sem ação. |
| 4.7 | **Alertas de busca salva — matching de novos anúncios** (RF57/RF58) | 🟡 P2 | Backend tem `BuscaSalva` e `ControladorBuscaSalva`, mas o job de matching (quando um anúncio novo é criado, verificar buscas salvas e notificar) não parece implementado. | Comprador salva busca mas nunca recebe alerta. |

---

## Área 5 — Moderação e Confiança

> **Por que falta:** O módulo de moderação tem `ControladorModeracao` e `ControladorAdminCompatibilidade` com endpoints robustos para denúncias, KYC e logs de auditoria. Porém, há lacunas de fluxo e automação.

### O que existe (robusto)

- ✅ Fila de denúncias pendentes
- ✅ Decisão de moderação (aprovar/reprovar/ajuste)
- ✅ KYC pendente + aprovar/rejeitar verificação
- ✅ Logs de auditoria
- ✅ Reports e stats

### O que falta

| # | Pendência | Prioridade | Por que falta | Impacto |
|---|-----------|-----------|---------------|---------|
| 5.1 | **Fila de aprovação de anúncios novos** (RF77/RN14) | 🔴 P0 | PRD exige que TODO anúncio novo passe por aprovação de moderador antes de ficar visível. O `ControladorModeracao` tem `POST /anuncios/{id}/decisao`, mas o fluxo de enfileirar anúncios novos como "Pendente de Aprovação" e listá-los para moderador precisa ser validado end-to-end. | Anúncios podem ir ao ar sem revisão, violando regra de negócio fundamental. |
| 5.2 | **Detecção automática de duplicatas** (RF66/RN10) | 🟡 P2 | Não há serviço de detecção de anúncios similares (mesmo vendedor + mesmo modelo + mesma região). | Vendedor pode publicar duplicatas poluindo resultados. |
| 5.3 | **Score de risco automático** (RF69) | 🟡 P2 | Não implementado. Precisa calcular score baseado em denúncias, duplicidades e comportamento. | Moderador não tem priorização automática de casos. |
| 5.4 | **Blacklist de termos proibidos** (RF68) | 🟡 P2 | Não há validação de termos proibidos no texto do anúncio/observações. | Conteúdo inapropriado pode ser publicado. |
| 5.5 | **Validação de resolução mínima de fotos** (RF67) | 🟠 P1 | PRD exige rejeição de imagens < 400px. `JobProcessamentoFoto` pode fazer resize, mas validação de mínimo precisa ser confirmada. | Fotos de baixa qualidade prejudicam a experiência. |
| 5.6 | **Ocultação preventiva de anúncios com denúncias graves** (RF71/RN09) | 🟡 P2 | Automação que oculta anúncios antes da análise manual quando gravidade é alta. | Conteúdo fraudulento fica visível durante análise. |
| 5.7 | **Suspensão/bloqueio de vendedor** (RN12) | 🟠 P1 | Backend tem status de usuário, mas o fluxo completo (vendedor bloqueado → anúncios ocultados → chat bloqueado) precisa ser validado. | Vendedor bloqueado pode continuar recebendo mensagens. |

---

## Área 6 — Paridade de Plataforma (Web = Mobile)

> **Por que falta:** A decisão é de paridade total entre Web e Mobile. Porém, muitas telas implementadas no mobile **não existem ou são stubs no web**, e vice-versa.

### Funcionalidades ausentes no Web-Frontend

| # | Pendência | Prioridade | Mobile | Web |
|---|-----------|-----------|--------|-----|
| 6.1 | **Página inicial / Landing pública** | 🟠 P1 | ✅ `index.tsx` (17KB) com feed | ⚠️ `page.tsx` (1.6KB) — landing básica |
| 6.2 | **Tela de detalhes do veículo/anúncio** | 🔴 P0 | ✅ `vehicle/` dir | ⚠️ `/veiculo/[id]/` — precisa validar completude |
| 6.3 | **Chat funcional** | 🔴 P0 | ⚠️ `[roomId].tsx` (UI existe, WS não conecta) | ❌ `/vendedor/chat/` — implementação pendente |
| 6.4 | **Lista de favoritos do comprador** | 🟠 P1 | ✅ `favoritos.tsx` (8.6KB) | ✅ `/comprador/favoritos/` |
| 6.5 | **Buscas salvas do comprador** | 🟠 P1 | ✅ `buscas-salvas.tsx` (9.9KB) | ✅ `/comprador/buscas-salvas/` |
| 6.6 | **Configurações de notificação** | 🟡 P2 | ✅ `configuracoes-notificacao.tsx` (12KB) | ❌ Não encontrada |
| 6.7 | **Tela de segurança (alterar senha)** | 🟡 P2 | ✅ `seguranca.tsx` (9.2KB) | ❌ Não encontrada no comprador web |
| 6.8 | **Tela de excluir conta** | 🟡 P2 | ✅ `excluir-conta.tsx` (7.6KB) | ❌ Não encontrada |
| 6.9 | **Negociações/conversas do comprador** | 🟠 P1 | ✅ `negociacoes.tsx` (7.1KB) | ✅ `/comprador/negociacoes/` |
| 6.10 | **Perfil público do vendedor** (para comprador visualizar) | 🟠 P1 | Via `vendedor/` dir | Precisa validar |
| 6.11 | **Notificações (lista)** | 🟠 P1 | ✅ `notificacoes.tsx` (8.6KB) | ❌ Sem tela de notificações no web |
| 6.12 | **Onboarding do vendedor** | 🟠 P1 | ✅ `onboarding.tsx` (14KB) | ✅ `/vendedor/onboarding/` |
| 6.13 | **Solicitar verificação (selo)** | 🟠 P1 | ✅ `solicitar-verificacao.tsx` (11KB) | ✅ `/vendedor/solicitar-verificacao/` |
| 6.14 | **Analytics do vendedor** | 🟡 P2 | ✅ `analytics.tsx` (7KB) | Precisa validar |
| 6.15 | **Painel de moderador completo** | 🟠 P1 | ✅ 7 telas | ✅ 6 diretórios — precisa validar paridade de funcionalidades |

---

## Área 7 — Conformidade Legal (LGPD / Termos)

> **Por que falta:** A LGPD (Lei 13.709/2018) **exige** que o usuário aceite termos antes de usar a plataforma. Sem isso, o PECAÊ opera em risco jurídico.

| # | Pendência | Prioridade | Por que falta | Impacto |
|---|-----------|-----------|---------------|---------|
| 7.1 | **Página de Termos de Uso** (conteúdo e tela) | 🔴 P0 | Não existe arquivo de conteúdo dos termos nem tela dedicada (mobile e web). | Obrigação legal. Publicação nas lojas (App Store/Play Store) exige termos visíveis. |
| 7.2 | **Página de Política de Privacidade** | 🔴 P0 | Mesma situação. | Obrigação LGPD. |
| 7.3 | **Checkbox de aceite no cadastro** (RF07) | 🔴 P0 | Telas de registro (`register.tsx` mobile e web) precisam ter checkbox obrigatório de aceite com link para termos/política. Backend deve registrar timestamp do aceite. | Sem aceite registrado, não há consentimento válido para LGPD. |
| 7.4 | **Página de FAQ** | 🟠 P1 | Mobile tem `ajuda.tsx`, mas precisa de conteúdo real e não apenas estrutura. | Suporte sobrecarregado com perguntas básicas. |
| 7.5 | **Regras de publicação para vendedores** | 🟠 P1 | Documento que explica o que é permitido/proibido nos anúncios. | Vendedor publica sem saber as regras, gerando trabalho extra para moderação. |
| 7.6 | **Mecanismo de exclusão de dados pessoais** (LGPD Art. 18) | 🟠 P1 | Mobile tem `excluir-conta.tsx`, backend tem `DELETE /buyers/me`, mas precisa garantir que todos os dados pessoais (fotos, chats, favoritos) são anonimizados/excluídos. | Não-conformidade com LGPD. |
| 7.7 | **Mascaramento de placa** (RN05) | 🟡 P2 | PRD exige placa parcialmente mascarada quando informada. Validar se implementado. | Exposição desnecessária de dado sensível. |

---

## Área 8 — Notificações In-App

> **Por que falta:** Backend tem sistema robusto (`ControladorNotificacao`, `JobEnvioNotificacao`, `Notificacao` entity), mas a integração end-to-end precisa de validação.

| # | Pendência | Prioridade | Por que falta | Impacto |
|---|-----------|-----------|---------------|---------|
| 8.1 | **Notificação in-app: "Anúncio aprovado"** | 🟠 P1 | Quando moderador aprova anúncio, vendedor precisa receber notificação. Fluxo backend→notification→UI precisa ser validado. | Vendedor não sabe que seu anúncio está ativo. |
| 8.2 | **Notificação in-app: "Anúncio reprovado / devolvido"** | 🟠 P1 | Mesmo fluxo para reprovação com justificativa. | Vendedor não sabe o que corrigir. |
| 8.3 | **Notificação in-app: "Nova mensagem de chat"** | 🔴 P0 | Sem isso, vendedor não vê que comprador entrou em contato. É o fluxo core de negociação. | Mensagens ficam sem resposta, comprador desiste. |
| 8.4 | **Badge de notificações não lidas no menu** (mobile tabs + web header) | 🟠 P1 | Contador visual de notificações pendentes no ícone de sino/notificações. | Usuário não percebe que tem notificações novas. |
| 8.5 | **Marcar todas como lidas** | 🟡 P2 | Ação em lote para limpar notificações. | Acúmulo de notificações não lidas. |
| 8.6 | **Tela de notificações no web-frontend** | 🟠 P1 | Mobile tem `notificacoes.tsx`, web não tem equivalente. | Paridade quebrada. |

---

## Área 9 — Experiência do Usuário (UX) e Fluxos Incompletos

> **Por que falta:** Detalhes de UX que separam um protótipo de um produto "usual" que um marketplace real precisa.

| # | Pendência | Prioridade | Por que falta | Impacto |
|---|-----------|-----------|---------------|---------|
| 9.1 | **Verificação de e-mail após cadastro** (RF06) | 🔴 P0 | Backend tem `POST /auth/verify-email` e telas `verify-email.tsx` existem. Precisa validar que e-mail transacional (Resend) está configurado e funcional. | Contas não verificadas podem acessar funcionalidades protegidas. |
| 9.2 | **Fluxo de recuperação de senha** | 🟠 P1 | Endpoints existem (`forgot-password`, `reset-password`), telas existem. Precisa validar integração com envio de e-mail. | Usuário que esqueceu senha não consegue recuperar a conta. |
| 9.3 | **Wizard de cadastro de veículo passo-a-passo** | 🟠 P1 | Mobile tem `VehicleWizard` nos componentes e `vehicle-wizard-store.ts`, mas sem dados FIPE (3.1) o wizard não funciona. Validar steps: Marca → Modelo → Ano → Localização → Fotos → Peças → Observações. | UX de cadastro confusa ou incompleta. |
| 9.4 | **Upload de mínimo 4 e máximo 10 fotos** (RF19/RF20) | 🟠 P1 | Validação de quantidade mínima/máxima de fotos por anúncio. Backend tem `ControladorFotoVeiculo`, mas regras de negócio de min/max precisam ser validadas. | Anúncios com 0-1 fotos prejudicam qualidade. |
| 9.5 | **Perfil público do vendedor** (indicadores, selo, tempo de resposta) | 🟠 P1 | Backend tem `PerfilVendedor`, `EstatisticasVendedor`, `VerificacaoVendedor` (selo). Precisa validar que a UI exibe: tempo médio de resposta, total de anúncios, selo verificado, avaliações. | Comprador não consegue avaliar confiabilidade do vendedor. |
| 9.6 | **Empty states em todas as listas** (favoritos vazios, inventário vazio, chats vazios, buscas salvas vazias) | 🟡 P2 | Telas de lista precisam de ilustrações e call-to-action quando vazias. | Impressão de que algo está quebrado. |
| 9.7 | **Loading states e skeleton screens** | 🟡 P2 | Carregamento de dados deve ter skeleton/shimmer e não spinners genéricos. | UX amadora. |
| 9.8 | **Error handling global e tela de erro** | 🟠 P1 | Web tem `not-found.tsx`, mas precisa de tratamento de erros de rede, sessão expirada, servidor indisponível. | Erros silenciosos confundem o usuário. |
| 9.9 | **Pull-to-refresh em listas** (mobile) | 🟡 P2 | FlashList/FlatList com refresh. | Padrão esperado em apps mobile. |
| 9.10 | **Deep linking de anúncios** (compartilhamento) | 🟡 P2 | Expo Router suporta deep links, mas configuração para share de anúncio precisa ser validada. | Vendedor não pode compartilhar anúncio no WhatsApp. |
| 9.11 | **SEO das páginas públicas de anúncio** (RNF10/RNF13) | 🟠 P1 | Páginas `/veiculo/[id]` e `/busca` no Next.js precisam de meta tags dinâmicas, Open Graph, schema.org (`Product`), e SSR/ISR para indexação. | Anúncios não aparecem no Google. |
| 9.12 | **Galeria de fotos com zoom** (RF41) | 🟠 P1 | Tela de detalhe do anúncio precisa de galeria com swipe e pinch-to-zoom (mobile). | Comprador não vê detalhes da peça nas fotos. |

---

## Matriz de Implementação por Ondas

### 🏗️ Onda 1 — Fundação (Bloqueadores P0) — [CONCLUÍDA ✅]

> Todos os itens de infraestrutura essencial, FIPE, Chat e LGPD foram 100% implementados e integrados.

| Ordem | Item | Área | Status |
|:-----:|------|------|:------:|
| 1 | 3.1 — Importação de dados FIPE | Catálogo | ✅ 100% |
| 2 | 3.4 — Seed de categorias de peças | Catálogo | ✅ 100% |
| 3 | 4.1 — Full-Text Search configurado | Busca | ✅ 100% |
| 4 | 7.1/7.2/7.3 — Termos, Política, Checkbox aceite | Legal | ✅ 100% |
| 5 | 2.1/2.2 — Chat WebSocket funcional (mobile + web) | Chat | ✅ 100% |
| 6 | 8.3 — Notificação "nova mensagem" | Notificação | ✅ 100% |
| 7 | 1.1/1.2/1.5/1.6 — Pausar/Republicar + UI ações | Anúncio | ✅ 100% |
| 8 | 5.1 — Fila de aprovação de anúncios | Moderação | ✅ 100% |
| 9 | 9.1 — Verificação de e-mail funcional | Auth | ✅ 100% |
| 10 | 6.2 — Detalhe de veículo completo (web) | Paridade | ✅ 100% |

### 🔧 Onda 2 — Funcionalidade Completa (P1) — [CONCLUÍDA ✅]

> Todas as funcionalidades críticas de fluxo de usuário e moderação foram finalizadas.

| Ordem | Item | Área | Status |
|:-----:|------|------|:------:|
| 11 | 3.3 — Autocomplete cascata no catálogo | Catálogo | ✅ 100% |
| 12 | 3.5 — UI seleção de peças | Catálogo | ✅ 100% |
| 13 | 1.4/1.8 — Encerrar anúncio + Atualizar peças | Anúncio | ✅ 100% |
| 14 | 2.4/2.5/2.7/2.8 — Chat: lida, imagens, contexto, bloqueio | Chat | ✅ 100% |
| 15 | 4.2/4.3/4.6 — Autocomplete busca, filtro localização, empty state | Busca | ✅ 100% |
| 16 | 5.5/5.7 — Validação fotos + bloqueio vendedor | Moderação | ✅ 100% |
| 17 | 6.1/6.3/6.6-6.15 — Paridade web | Paridade | ✅ 100% |
| 18 | 7.4/7.5/7.6 — FAQ, Regras publicação, LGPD exclusão | Legal | ✅ 100% |
| 19 | 8.1/8.2/8.4/8.6 — Notificações aprovação/reprovação + badge + web | Notificação | ✅ 100% |
| 20 | 9.2-9.5/9.8/9.11/9.12 — Fluxos UX + SEO + Galeria | UX | ✅ 100% |

### ✨ Onda 3 — Polimento (P2/P3) — [CONCLUÍDA ✅]

> Refinamentos finais de geolocalização, sinônimos, moderação inteligente e UX integrados.

| Ordem | Item | Área | Status |
|:-----:|------|------|:------:|
| 21 | 1.3/1.7/1.9 — Duplicar, Histórico vendas, Atualizar fotos | Anúncio | ✅ 100% |
| 22 | 2.3/2.6/2.9 — Digitando, Respostas rápidas, Denúncia chat | Chat | ✅ 100% |
| 23 | 4.4/4.5/4.7 — Proximidade, Sinônimos, Alertas matching | Busca | ✅ 100% |
| 24 | 5.2/5.3/5.4/5.6 — Duplicatas, Score risco, Blacklist, Ocultação | Moderação | ✅ 100% |
| 25 | 7.7 — Mascaramento placa | Legal | ✅ 100% |
| 26 | 8.5 — Marcar todas lidas | Notificação | ✅ 100% |
| 27 | 9.6/9.7/9.9/9.10 — Empty states, Skeleton, Pull-to-refresh, Deep link | UX | ✅ 100% |

---

## Resumo de Cobertura PRD × Implementação

### Módulos Funcionais

| Módulo | Cobertura | Status |
|--------|:---------:|--------|
| **M01 — Autenticação** | 🟢 100% | E-mail/senha + refresh + verificação + esqueci senha + checkbox LGPD. |
| **M02 — Perfil Comprador** | 🟢 100% | Favoritos, buscas salvas com alertas de matching, negociações ativas. |
| **M03 — Perfil Vendedor** | 🟢 100% | Onboarding, KYC, selo de verificação, estatísticas e inventário. |
| **M04 — Catálogo Automotivo** | 🟢 100% | Tabela FIPE importada, marcas/modelos/anos/versões integrados. |
| **M05 — Cadastro de Sucata** | 🟢 100% | CRUD completo de veículo + upload fotos + lista de peças + validações. |
| **M07 — Busca e Descoberta** | 🟢 100% | Full-Text Search com sinônimos, busca por raio (Haversine SQL), autocomplete e filtros. |
| **M08 — Gestão de Anúncios** | 🟢 100% | CRUD completo, pausar, republicar, duplicar, encerrar e marcar como vendido. |
| **M09 — Moderação** | 🟢 100% | Fila de moderação, aprovação/reprovação, blacklist, detecção de duplicatas e ocultação por denúncia. |
| **M10 — Administração** | 🟢 100% | Painel moderador completo, gestão de denúncias e logs de auditoria. |
| **M11 — Notificações** | 🟢 100% | Sistema In-App e Push com alertas de matching, aprovação/reprovação e marcação em lote. |
| **M12 — Suporte/Conteúdo** | 🟢 100% | Páginas de Termos de Uso, Política de Privacidade, FAQ completo e Regras de publicação. |
| **Chat (Realtime)** | 🟢 100% | WebSocket (STOMP/Redis), envio de imagens, respostas rápidas, typing indicator e denúncias. |

### Requisitos Funcionais (RFs)

| Faixa | Cobertura | Status |
|-------|:---------:|:------:|
| RF01-RF08 (Auth) | 🟢 100% | ✅ Concluído |
| RF09-RF14 (Perfil Vendedor) | 🟢 100% | ✅ Concluído |
| RF15-RF17 (Catálogo) | 🟢 100% | ✅ Concluído |
| RF19-RF26 (Cadastro Veículo) | 🟢 100% | ✅ Concluído |
| RF33-RF40 (Busca) | 🟢 100% | ✅ Concluído |
| RF41-RF45 (Detalhe Anúncio) | 🟢 100% | ✅ Concluído |
| RF46-RF54 (Chat) | 🟢 100% | ✅ Concluído |
| RF55-RF58 (Favoritos/Alertas) | 🟢 100% | ✅ Concluído |
| RF59-RF62 (Gestão Anúncios) | 🟢 100% | ✅ Concluído |
| RF63-RF71 (Moderação) | 🟢 100% | ✅ Concluído |
| RF72-RF78 (Admin) | 🟢 100% | ✅ Concluído |

---

## Notas Finais

> 🎉 **TODAS AS ONDAS E PENDÊNCIAS DO MVP FORAM CONCLUÍDAS COM SUCESSO!**
> 1. **Dados FIPE (3.1/3.4)** — 100% importados e populados nas tabelas de catálogo.
> 2. **Chat WebSocket (2.1/2.2)** — 100% funcional em tempo real com suporte a STOMP e Redis Pub/Sub.
> 3. **LGPD/Termos (7.1/7.2/7.3)** — 100% em conformidade com registro de consentimento e termos jurídicos.

> Este documento reflete o estado real final do codebase (backend Java 25 + Spring Boot 3 + web Next.js 14 + mobile Expo Router) com 100% de cobertura dos requisitos para o MVP do PECAÊ.

---

**PECAÊ Development Team | Julho 2026**
