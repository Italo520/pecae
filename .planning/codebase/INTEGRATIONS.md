# Integrations

**Analysis Date:** 2026-05-24

Este documento mapeia todas as conexões com serviços externos, gateways de pagamento, provedores de identidade e APIs de terceiros que compõem o ecossistema do **PECAÊ**.

---

## 🔐 1. Autenticação e Identidade (Identity Providers)

O PECAÊ utiliza uma estratégia híbrida e segura para gestão de usuários, integrando soluções robustas para autenticação federada (OAuth) e login tradicional.

### 1.1 Supabase Auth (Core Authentication Engine)
* **Função:** Motor principal de autenticação de usuários da plataforma.
* **Componentes:**
  - Login por E-mail/Senha tradicional.
  - Autenticação sem senha via OTP (One-Time Password) por e-mail e tokens.
  - Gestão segura de sessões baseada em JSON Web Tokens (JWT) integrada ao `PassportJWTStrategy` no NestJS.

### 1.2 Google Auth (OAuth 2.0)
* **Função:** Permite login rápido e cadastro simplificado utilizando credenciais do Google.
* **Dependência:** `@supabase/supabase-js` no Mobile para iniciar a autenticação nativa, e validação de tokens na API.

### 1.3 Apple Sign-In (OAuth 2.0 / Native Mobile)
* **Função:** Requisito crucial para dispositivos iOS, permitindo login social seguro e direto usando a conta Apple do usuário.
* **Dependência:** Fluxo nativo no aplicativo Expo validado via tokens seguros de assinatura com a API do Supabase Auth.

---

## 💳 2. Faturamento e Assinaturas (Payment Gateways)

O módulo de cobrança (`apps/api/src/billing/`) é totalmente integrado ao **Stripe** para monetização dos perfis de vendedores profissionais e impulsão de anúncios.

### 2.1 Stripe Core Integration
* **Função:** Gateway de pagamento oficial para gestão de assinaturas recorrentes dos planos de lojistas (Free, Starter, Pro) e impulsão de anúncios patrocinados (Ads).
* **Componentes:**
  - **Stripe Provider** (`stripe.provider.ts`): Inicializa e gerencia a conexão SDK com o Stripe.
  - **Billing Service** (`billing.service.ts`): Sincroniza perfis de lojistas com clientes do Stripe (`stripeCustomerId`), gera sessões de Checkout, cria Portais de Faturamento do Cliente para autoatendimento e cancelamentos.
  - **Webhooks do Stripe**: Trata eventos assíncronos cruciais como `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded` e `invoice.payment_failed` para garantir sincronia em tempo real do estado da assinatura do lojista no banco PostgreSQL local.

---

## 📁 3. Armazenamento de Arquivos e Mídia (Cloud Storage)

O PECAÊ gerencia um grande fluxo de imagens de veículos e autopeças, além de documentações sensíveis para verificação de lojistas.

### 3.1 Supabase Storage
* **Função:** Armazenamento em nuvem otimizado e estruturado para arquivos estáticos e binários.
* **Buckets Utilizados:**
  - `vehicles-photos`: Armazena fotos de veículos desmanchados/sucatas e peças individuais de forma pública ou protegida.
  - `seller-verifications`: Bucket privado para arquivos sensíveis de KYC (CNPJ, CNH de proprietários, alvarás de funcionamento). A API gera links assinados temporários (Signed URLs) para acesso restrito dos moderadores.
* **Otimização:** A API/Mobile processa imagens gerando hashes compactos (Blurhash) para carregamento progressivo e responsivo.

---

## ✉️ 4. Notificações e Comunicações Transacionais

Garante o engajamento dos usuários por e-mail e alertas em tempo real no dispositivo móvel.

### 4.1 Resend Email SDK
* **Função:** Provedor oficial de envio de e-mails transacionais.
* **Casos de Uso:**
  - Envio de links de recuperação de senha e e-mails de validação de conta.
  - Notificações de aprovação/rejeição do processo de verificação de conta de lojista (KYC).
  - Alertas de novas mensagens recebidas no chat quando o usuário está offline.

### 4.2 Expo Push Notifications
* **Função:** Motor para envio de notificações push nativas em aparelhos iOS e Android.
* **Mecanismo:**
  - Coleta e validação de `pushTokens` únicos de dispositivos no banco PostgreSQL.
  - Envio assíncrono via Expo Push API para alertas de chat, novas ofertas, atualizações de status de veículos e anúncios patrocinados de interesse.

---

## ⚡ 5. Mensageria, Filas e Comunicação Realtime

A infraestrutura interna é suportada por WebSockets e sistemas de filas assíncronas de altíssima performance.

### 5.1 Redis & BullMQ
* **Função:** Gerenciamento de tarefas em segundo plano (background jobs) e cache crítico de alta performance.
* **Padrões de Integração:**
  - **Cache e Busca:** Redis armazena hashes `SHA256` para cache de consultas pesadas de catálogo de autopeças e marcas de veículos.
  - **Anti-Fraude e Ads:** Cache de controle de IP e cookies para deduplicação de visualizações de anúncios (visualizações únicas a cada 24 horas).
  - **Filas com BullMQ:** Processamento de tarefas assíncronas pesadas fora do ciclo de requisição HTTP (ex: geração de relatórios de anúncios, disparo em lote de pushes de notificações e e-mails transacionais).

### 5.2 Socket.io (WebSockets Gateway)
* **Função:** Comunicação bidirecional e instantânea para os módulos de chat (`apps/api/src/chat/`).
* **Casos de Uso:**
  - Atualização em tempo real de mensagens de chat entre compradores e vendedores.
  - Eventos de "Digitando...", status de leitura ("Visualizado") e presença online dos usuários ativos na plataforma.

---

*Integration mapping completed: 2026-05-24*
