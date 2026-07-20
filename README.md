# PECAÊ - Manual Técnico e Arquitetural (Developer Guide)

Este é o **Manual Técnico Definitivo** do monorepo PECAÊ. Este documento detalha a arquitetura, as escolhas tecnológicas e fornece guias operacionais para rodar e manter a plataforma.

> **Status do Projeto:** MVP 100% Concluído (Milestone 11 Finalizada). A arquitetura completa (Java 25 Spring Boot backend, Next.js 14 web frontend, React Native Expo mobile frontend) foi estabilizada, obteve 100% de paridade entre as plataformas e foi consolidada na branch `main`. Todas as pendências e integrações (FIPE, Chat WebSocket STOMP, Moderação e LGPD) estão em produção.

---

## Índice

1. [Visão Geral e Estrutura do Monorepo](#1-visão-geral-e-estrutura-do-monorepo)
2. [Infraestrutura e Tecnologias (A Nova Stack)](#2-infraestrutura-e-tecnologias-a-nova-stack)
3. [Mapeamento dos Módulos Funcionais](#3-mapeamento-dos-módulos-funcionais)
4. [Como Executar o Projeto (Guia de Setup)](#4-como-executar-o-projeto-guia-de-setup)
5. [Contratos de Configuração (.env)](#5-contratos-de-configuração-env)
6. [Referência da API (Swagger UI)](#6-referência-da-api-swagger-ui)

---

## 1. Visão Geral e Estrutura do Monorepo

O PECAÊ é uma plataforma focada na conexão entre vendedores de autopeças (sucatas) e compradores, utilizando uma interface moderna pautada pelo design system **The Digital Forge** (Glassmorphism e alta performance). 

A estrutura de diretórios foi rigorosamente desenhada em formato de **Monorepo** orquestrado pelo Turborepo:

```text
pecae/
├── backend/            # Aplicação Server-side (Java 25, Spring Boot 3.5+, Hibernate 7)
├── web-frontend/       # Plataforma Web Next.js 15 App Router
├── mobile-frontend/    # App iOS e Android (React Native + Expo Router)
├── packages/           # Pacotes compartilhados (TS Configs, ESLint, Shared Types)
├── e2e/                # Suíte de testes ponta-a-ponta (Playwright)
├── docs/               # Documentações, Guias de Setup (SETUP.md) e Regras de Negócio (PRD)
├── scripts/            # Scripts de automação
├── docker-compose.yml  # Orquestração local (PostgreSQL, Redis, API, Web)
├── package.json        # Gerenciador de Workspaces NPM
└── turbo.json          # Orquestrador de Tarefas e Pipelines (Build, Lint, Dev)
```

---

## 2. Infraestrutura e Tecnologias (A Nova Stack)

Após a migração e estabilização (Milestone 9), a stack técnica oficial do PECAÊ está estabelecida da seguinte forma:

### Backend (Core API)
- **Linguagem / Framework:** Java 25 + Spring Boot 3.5+
- **Acesso a Dados:** Spring Data JPA + Hibernate 7
- **Arquitetura:** Package-by-Feature (separação forte de domínios)
- **Assincronia:** Uso intensivo de mensageria via Redis e `@Async` do Spring para processamento em background (Analytics, Notificações, e Processamento Financeiro).

### Frontend (Mobile & Web)
- **Ecossistema:** React Native gerenciado pelo Expo (SDK 51) + Expo Router
- **Estado Local:** Zustand (ex: `auth-store`, `vehicle-wizard`) e Zustand Persist
- **Estilização:** NativeWind / TailwindCSS adaptados para regras do The Digital Forge

### Nuvem e Serviços Integrados
- **Banco de Dados Relacional:** PostgreSQL 16 hospedado via Supabase. Implementação de Full-Text Search e CTEs avançadas.
- **Cache de Alta Performance:** Redis (Upstash) utilizado para cache de Catálogo, rate-limiting e deduplicação LUA.
- **Storage:** Supabase Storage (Fotos de veículos, avatares, Alvarás).
- **Notificações:** Integração multi-canal (Expo Push Notifications e Resend API para e-mails).

---

## 3. Mapeamento dos Módulos Funcionais

A regra de negócio do PECAÊ é fatiada em 13 módulos operacionais. Abaixo a matriz de operação:

- **M01 & M03 (Identidade e KYC):** Cadastro de Compradores e processo de aprovação de Lojistas com checagem de CNPJ/Alvará.
- **M04, M05 & M07 (Inventário e Descoberta):** O coração transacional. Lojistas cadastram veículos (sucatas) baseados na Tabela FIPE (M04). Compradores navegam utilizando o M07 (Search Engine em Postgres) com filtros de estado, montadora e compatibilidade.
- **M08 (Comunicação):** Negociação ocorre no módulo de Chat em tempo real (Supabase Realtime / SSE).
- **M09 (Moderação):** Motor de segurança. Nenhum lojista e nenhum veículo entra na plataforma sem aprovação manual de um Admin no Backoffice.
- **M12 & M13 (Dados e AdTech):** Motor de Ads gerando relatórios de visualização (Views) e CTR em tempo real de forma assíncrona, além de integração de publicidade direta no App.

---

## 4. Como Executar o Projeto (Guia de Setup)

> **Nota:** Para um roteiro passo-a-passo e dicas aprofundadas de instalação, consulte o [SETUP.md](./docs/SETUP.md).

**Pré-requisitos:**
- Node.js ≥ 20 e npm ≥ 10
- Java 25 (para o backend)
- Docker (para banco de dados, Redis, API e Web locais)

### Setup Inicial
1. **Instalar dependências do Monorepo:**
   ```bash
   npm install
   ```
2. **Subir Serviços Locais via Docker Compose:**
   ```bash
   docker compose up -d
   ```
   *(Isto levantará o Postgres, Redis, a API Java e o Web Frontend Next.js na porta 3001)*

3. **Iniciar Ambiente de Desenvolvimento Paralelo (Turborepo):**
   ```bash
   npm run dev
   ```

### Rodando Individualmente
```bash
# Apenas o app mobile
npx expo start --prefix mobile-frontend

# Apenas o web-frontend (sem Docker)
npm run dev --workspace=web-frontend

# Apenas o backend Java
cd backend && ./mvnw spring-boot:run
```

### Builds de Produção
```bash
# Build web-frontend e shared
npm run build

# Build mobile (requer Expo EAS CLI)
cd mobile-frontend && npx eas build --platform all
```
---

## 5. Contratos de Configuração (.env)

O monorepo faz uso inteligente de variáveis locais de ambiente. Você deve criar `.env` nas respectivas subpastas.

### Backend (`/backend/src/main/resources/application.properties` ou `.env`)
| Chave | Descrição |
|-------|-----------|
| `SPRING_DATASOURCE_URL` | URI de conexão ao PostgreSQL (Ex: `jdbc:postgresql://localhost:5433/pecae`) |
| `SPRING_DATA_REDIS_URL` | URI do Redis (Ex: `redis://localhost:6379`) |
| `JWT_SECRET` / `EXPIRATION` | Segredo de 256bits para assinatura dos tokens das sessões. |
| `SUPABASE_URL` / `KEY` | Credenciais da Role segura do Storage na nuvem. |

### Frontend (`/frontend/.env`)
| Chave | Descrição |
|-------|-----------|
| `EXPO_PUBLIC_API_URL` | Rota apontando para a API local ou produção (Ex: `http://192.168.1.X:8080/api/v1`). |

---

## 6. Referência da API (Swagger UI)

Com a migração para o Spring Boot, a documentação viva e interativa da API RESTful fica encarregada ao `springdoc-openapi`.
Quando o servidor Java estiver rodando localmente, a documentação da API pode ser acessada visualmente através da UI:

👉 **[http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

### Mapeamento das Rotas Principais (Prefixo `/api/v1`)

- **`/auth`**: Endpoints de Registro, Login (Custom JWT e OAuth), Atualização de Sessões e Gestão de OTP.
- **`/buyers` e `/sellers`**: Perfis de usuário, favoritação de itens (Wishlist), buscas salvas, e o fluxo rigoroso de verificação de loja (Upload de CNH/Alvará).
- **`/catalog`**: Dados imutáveis e abertos. Consultas de marcas, modelos e anos derivadas da FIPE.
- **`/vehicles` e `/listings`**: CRUD de sucatas, delegação do inventário de peças integradas e endpoints exclusivos para links temporários de fotos (Signed URLs Supabase).
- **`/search`**: Rota hiper-otimizada de paginação e filtragem Full-Text Search de sucatas (integra camadas de Cache com Redis).
- **`/chat`**: Iniciação e histórico de mensagens das salas de negociação (as entregas em realtime ocorrem via SSE/Realtime listeners).
- **`/moderation`**: *(Admin Only)* Rotas exclusivas de painel para bater o martelo na aprovação/recusa de anúncios e perfis.
- **`/analytics`**: Injeção e consumo de contadores financeiros (Impressões e Cliques para Ads).

---
**PECAÊ Development Team | 2026**
