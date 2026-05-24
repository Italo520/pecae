# Codebase Structure

**Analysis Date:** 2026-05-24

Este documento apresenta o mapeamento completo e a árvore de diretórios do monorepo **PECAÊ**, detalhando a responsabilidade de cada pasta e arquivo estrutural chave.

---

## 📂 1. Estrutura Global do Monorepo

O repositório adota npm Workspaces e Turborepo para coordenar os múltiplos subprojetos.

```text
pecaelegado/
├── .planning/                  # Inteligência de planejamento ativo (GSD)
│   ├── codebase/               # Mapeamentos e inteligência da base de código (.md)
│   └── milestones/             # Logs, auditorias e roadmaps históricos de versões
├── apps/                       # Aplicações ativas do ecossistema
│   ├── api/                    # Backend NestJS + Prisma ORM
│   └── mobile/                 # Aplicativo Mobile Expo + React Native
├── packages/                   # Módulos e bibliotecas compartilhadas
│   └── shared/                 # Tipos e validações comuns (@pecae/shared)
├── scripts/                    # Utilitários de infraestrutura e correções
│   └── patch-metro.js          # Patch do empacotador Metro para monorepo
├── package.json                # Configurações de dependências globais e workspaces
├── turbo.json                  # Pipeline de orquestração do Turborepo
└── tsconfig.json               # Configuração base de tipos TypeScript do monorepo
```

---

## 🎛️ 2. Estrutura da API (`apps/api`)

A API central em NestJS é dividida em módulos autocontidos dentro de `src/`, seguindo os padrões do framework.

```text
apps/api/
├── prisma/                     # Camada de Persistência de Dados
│   ├── schema.prisma           # Modelagem de dados PostgreSQL (Prisma Schema)
│   ├── seed.ts                 # Script de população inicial do banco
│   └── migrations/             # Histórico de alterações estruturais do banco
├── src/                        # Código Fonte da API
│   ├── app.module.ts           # Módulo raiz de importação global
│   ├── main.ts                 # Ponto de entrada (Bootstrap da API NestJS)
│   ├── ads/                    # Módulo de Anúncios Patrocinados (Ads)
│   ├── analytics/              # Métricas, visualizações únicas e contadores
│   ├── auth/                   # Autenticação (Passport, JWT, OAuth, OTP e Guards)
│   ├── billing/                # Integração de Faturamento e Assinaturas (Stripe SDK)
│   ├── buyers/                 # Gestão de perfis e garagens de Compradores
│   ├── catalog/                # Catálogo global de compatibilidade de Peças e Veículos
│   ├── chat/                   # Mapeamentos e WebSockets de Chat (Socket.io Gateway)
│   ├── common/                 # Interceptors, Filters, Decorators e Utilitários comuns
│   ├── listings/               # Cadastro, buscas e controle de anúncios de peças
│   ├── mail/                   # Serviço de disparo de e-mails transacionais (Resend SDK)
│   ├── moderation/             # Painel administrativo de auditoria de lojas e anúncios
│   ├── notifications/          # Fila e disparo de notificações móveis (Expo Pushes)
│   ├── reports/                # Denúncias de anúncios e fraudes por usuários
│   ├── reviews/                # Sistema de avaliações de lojas e reputação de vendedores
│   ├── saved-searches/         # Buscas salvas e alertas automáticos de novas peças
│   ├── search/                 # Módulo centralizador de buscas com filtros complexos
│   ├── sellers/                # Gestão de perfis de Lojistas e Inventários
│   ├── users/                  # Gestão de contas e dados cadastrais básicos de usuários
│   ├── vehicles/               # Modelagem de sucatas, peças desmanchadas e marcas
│   └── verifications/          # Processos de aprovação de KYC para lojistas
├── test/                       # Testes de Integração e End-to-End (E2E)
│   ├── app.e2e-spec.ts         # Testes de rotas HTTP do ciclo completo
│   └── jest-e2e.json           # Configurações de execução Jest E2E
├── package.json                # Dependências específicas da API NestJS
└── tsconfig.json               # Configurações do compilador TypeScript
```

---

## 📱 3. Estrutura do Aplicativo Mobile (`apps/mobile`)

O app móvel em React Native utiliza Expo SDK 51 e Expo Router para roteamento moderno baseado em arquivos.

```text
apps/mobile/
├── app/                        # Expo Router (Roteamento Baseado em Arquivos)
│   ├── (auth)/                 # Telas públicas de Autenticação (Login, Cadastro, OTP)
│   ├── (buyer)/                # Área exclusiva do Comprador (Home, Garagem, Filtros)
│   ├── (seller)/               # Área exclusiva do Vendedor/Lojista (Estoque, Assinaturas)
│   ├── chat/                   # Telas de conversação e negociações de peças
│   ├── _layout.tsx             # Arquivo de layout raiz e contextos de provedores
│   └── index.tsx               # Ponto de entrada do roteador
├── src/                        # Camada de Componentes e Lógica do App
│   ├── components/             # Componentes visuais reusáveis (Botões, Inputs, Cards)
│   ├── hooks/                  # Custom Hooks do React (ex: queries, mutações, ciclo de vida)
│   ├── services/               # Clientes e conexões HTTP (Axios API Client, Supabase Client)
│   ├── stores/                 # Gerenciamento de estado global (Zustand: auth-store)
│   └── utils/                  # Formatadores de texto, validadores e auxiliares comuns
├── assets/                     # Recursos visuais estáticos (Ícones, Logos, Imagens)
├── app.json                    # Arquivo de metadados e configurações do Expo/EAS Builds
├── metro.config.js             # Configuração do Metro Bundler ajustado para Monorepo
├── babel.config.js             # Transpilação de código Babel e aliases do React Native
├── package.json                # Dependências específicas do app Mobile React Native
└── tsconfig.json               # Configuração TypeScript para o aplicativo móvel
```

---

## 📦 4. Biblioteca Compartilhada (`packages/shared`)

Centraliza os artefatos de código comum para evitar duplicação entre API e Mobile.

```text
packages/shared/
├── src/                        # Código Fonte Compartilhado
│   ├── types/                  # Definições de interfaces TypeScript comuns
│   ├── validation/             # Schemas Zod de validação comum (ex: dados de KYC)
│   └── index.ts                # Ponto de exportação principal do pacote
├── package.json                # Definições de exportação `@pecae/shared`
└── tsconfig.json               # Configuração TypeScript do pacote de tipos
```

---

*Codebase structure mapped: 2026-05-24*
