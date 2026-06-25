# PECAÊ Backend (Core API)

Este é o repositório da API Principal do PECAÊ. O sistema foi projetado para alta escalabilidade, tolerância a falhas e total segurança, gerenciando operações cruciais do ecossistema C2C de autopeças. Originalmente desenvolvido em Node.js, foi 100% migrado para **Java 25** e **Spring Boot 3.5+** na Milestone 9.

---

## 1. Visão Geral

O Backend atua como a única fonte da verdade para o Mobile (Frontend). Ele gerencia desde a entrada segura de usuários, moderação complexa, e leilão/pacing financeiro de anúncios, até a comunicação em tempo real e notificações push.

---

## 2. Infraestrutura e Stack Tecnológica

A base arquitetural é focada no ecossistema Spring com design patterns avançados:

- **Linguagem:** Java 25 (com Virtual Threads e Pattern Matching).
- **Framework Core:** Spring Boot 3.5+.
- **Persistência de Dados:** Spring Data JPA + Hibernate 7.
- **Banco de Dados:** PostgreSQL 16 (Via Supabase) estruturado com CTEs e Full-Text Search.
- **Migrações e Evolução de Schema:** Flyway.
- **Cache, Mensageria e Rate Limiting:** Redis (Upstash) integrado via Spring Data Redis.
- **Mapeamento DTO:** MapStruct (para performance sem overhead de reflection).
- **Segurança:** Spring Security com controle granular (Role-Based Access Control) + JWT Custom.
- **Documentação de API:** SpringDoc OpenAPI 3 (Swagger).

---

## 3. Estrutura de Diretórios (Package-by-Feature)

A arquitetura do código abandona o clássico MVC monolítico (separar por controllers/services/models globais) em favor do **Package-by-Feature** (Domínios Verticais), garantindo que cada funcionalidade seja independente. Todo o código base reside no pacote principal `com.pecae.api`:

```text
backend/src/main/java/com/pecae/api/
├── ad/              # Publicidade direta e campanhas patrocinadas.
├── analytics/       # Contabilização de views, clicks e relatórios.
├── anuncio/         # Gerenciamento de Anúncios (Listings) públicos.
├── autenticacao/    # Lógica de Login, Tokens JWT, OAuth e Segurança.
├── avaliacao/       # Avaliações (Reviews) e notas de lojistas (1 a 5 estrelas).
├── catalogo/        # API pública da tabela FIPE (Marcas, Modelos, Versões).
├── chat/            # Negociação Realtime usando Server-Sent Events (SSE).
├── compartilhado/   # Exceções, Enums, DTOs utilitários e infra base.
├── comprador/       # Hub do cliente, gerenciamento de perfil.
├── configuracao/    # Setup do Spring Security, OpenAPI, Cors, Redis, etc.
├── denuncia/        # Sistema de reports contra anúncios e lojistas.
├── favorito/        # Wishlist de sucatas e alertas de buscas salvas.
├── mail/            # Serviço integrador de disparo de e-mails transacionais.
├── moderacao/       # Motor de aprovação/rejeição (exclusivo Admin/Mod).
├── notificacao/     # Push Notifications via Expo API e notificações in-app.
├── usuario/         # Gestão da Entidade Raiz e Roles do sistema.
├── veiculo/         # Transações de Sucatas, Inventário e Upload de Fotos.
└── vendedor/        # Perfil de Lojas, KYC (Alvará), Estatísticas Pessoais.
```

---

## 4. Como Executar (Setup Local)

**Pré-requisitos:**
- JDK 25 instalado.
- O projeto usa o **Gradle Wrapper**, portanto não é necessário instalar o Gradle manualmente.
- Containers Docker para o BD rodando (ver `docker-compose.yml` na raiz do monorepo).

**Passos:**
1. **Configuração (.env / application.properties):**  
   Configure o acesso ao banco e Redis injetando as variáveis adequadas no seu arquivo `.env` ou em `src/main/resources/application.properties` (ou profile `-dev`):
   - `SPRING_DATASOURCE_URL`
   - `SPRING_DATA_REDIS_URL`
   - `JWT_SECRET`

2. **Compilar e Iniciar a API:**
   ```bash
   # Compila as dependências e roda o projeto
   ./gradlew bootRun
   ```

O servidor inicializará na porta **`8080`**.

---

## 5. Referência da API (Swagger)

A API possui contratos abertos totalmente interativos baseados no OpenAPI. 
Para explorar os DTOs, Schemas e disparar requisições de teste diretamente no painel, acesse:

👉 **[Acessar Swagger UI: http://localhost:8080/swagger-ui/index.html](http://localhost:8080/swagger-ui/index.html)**

### Principais Contextos de Endpoints (`/api/v1`)
- `/auth/login`: Autenticação e Refresh Tokens.
- `/buyers/me` & `/sellers/me`: Gestão do perfil e KYC.
- `/vehicles`: CRUD de inventário e emissão de _Signed URLs_ para Storage.
- `/search`: O motor de navegação principal (Cacheado).

---

## 6. Rotinas Assíncronas e Mensageria

Para evitar _thread blocking_ e manter os endpoints de leitura abaixo de 50ms, utilizamos recursos paralelos:

- **Atualizações de Analytics:** As rotas de `track-impression` não gravam no banco. Elas delegam a contagem a um pool assíncrono (Spring `@Async`) que acumula os eventos num _hash_ do Redis para um "Flush" posterior, otimizando o I/O do Postgres.
- **Deduplicação via LUA:** A contabilização de Views e Cliques utiliza Scripts LUA atômicos contra o Redis para evitar fraudes ou loops nocivos nos anúncios dos lojistas.

---
**PECAÊ Development Team**
