# Technology Stack

**Analysis Date:** 2026-05-24

## Languages

**Primary:**
- **TypeScript** `^5.4.5` (API/Monorepo) e `~5.3.3` (Mobile) - Utilizado em todo o ecossistema para tipagem estática e segurança de código.
- **JavaScript** - Utilizado em arquivos de configuração do ecossistema como `index.js`, `metro.config.js` e `babel.config.js`.

**Secondary:**
- **HTML/CSS** - Utilizado na camada Web do Expo Router e para representações visuais em e-mails e documentações.

## Runtime

**Environment:**
- **Node.js** `>=20.0.0` - Ambiente de execução para a API NestJS e ferramentas de desenvolvimento do monorepo.
- **Docker** - Utilizado para containerização do ambiente local (PostgreSQL, Redis e API).

**Package Manager:**
- **npm** `^10.8.2` - Gerenciador de pacotes padrão do monorepo.
- Lockfile: `package-lock.json` presente.

## Frameworks

**Core:**
- **NestJS** `^11.1.19` - Framework modular para o desenvolvimento do backend/API robusto.
- **React Native** `0.74.5` + **Expo SDK** `^51.0.28` - Framework para desenvolvimento do aplicativo mobile.
- **Expo Router** `~3.5.14` - Roteamento baseado em arquivos para o aplicativo mobile React Native.

**Testing:**
- **Jest** `^29.7.0` - Framework principal de testes (unitários e de integração) tanto no backend quanto no frontend mobile.
- **Jest Expo** `~51.0.1` - Configurações pré-definidas de testes para o ambiente Expo.
- **Supertest** `^7.0.0` - Biblioteca de asserções HTTP para testes End-to-End (E2E) no NestJS.
- **React Testing Library Native** `^12.5.0` - Testagem de componentes nativos do React Native.

**Build/Dev:**
- **Turborepo** `^2.0.0` - Ferramenta de build inteligente de alto desempenho para monorepos JavaScript/TypeScript.
- **Babel** `^7.24.6` - Transcompilador JavaScript/TypeScript para o ecossistema mobile.

## Key Dependencies

**Critical:**
- **Prisma ORM** `^5.14.0` - Interface de comunicação flexível e fortemente tipada com o banco de dados PostgreSQL.
- **Zustand** `^4.5.2` - Gerenciador de estado global leve e performático no React Native (ex: `auth-store`).
- **CASL** (`@casl/ability` `^6.7.1`) - Biblioteca para autorização robusta baseada em Roles e Atributos no NestJS.
- **Supabase Client** (`@supabase/supabase-js`) - SDK para interações com serviços Supabase (Auth, Realtime e Storage).

**Infrastructure:**
- **BullMQ** `^5.74.1` - Gerenciador de filas assíncronas baseado em Redis de alto desempenho.
- **Socket.io** `^4.8.3` - Biblioteca de comunicação em tempo real via WebSockets.
- **Resend SDK** `^3.2.0` - Integração com serviço de envio de e-mails transacionais.
- **React Hook Form** `^7.73.1` + **Zod** `^3.23.8` - Validação rigorosa e gerenciamento leve de formulários no mobile.

## Configuration

**Environment:**
- Configurado via arquivos `.env` nas pastas da API (`apps/api/.env`) e do Mobile (`apps/mobile/.env`).
- Requer chaves essenciais como `DATABASE_URL`, `DIRECT_URL`, `REDIS_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `RESEND_API_KEY`, etc.

**Build:**
- Centralizado pelo arquivo `turbo.json` na raiz do monorepo, definindo pipelines de build, lint e test com cache agressivo.
- Configuração do Metro Bundler customizado em `apps/mobile/metro.config.js` para suportar workspaces do monorepo.

## Platform Requirements

**Development:**
- Node.js >= 20, npm >= 10.
- Docker e Docker Compose instalados para subir as dependências locais.
- Expo CLI e emuladores (iOS Simulator / Android Emulator) ou dispositivo físico com aplicativo Expo Go para rodar o Mobile.

**Production:**
- **Backend:** Hospedado em plataformas como Vercel ou instâncias gerenciadas compatíveis com containers.
- **Mobile:** Builds gerados e distribuídos via Expo EAS para a Google Play Store (Android) e Apple App Store (iOS).

---

*Stack analysis: 2026-05-24*
