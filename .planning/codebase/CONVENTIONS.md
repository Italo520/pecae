# Coding Standards & Conventions

**Analysis Date:** 2026-05-24

Este documento estabelece as convenções de código, diretrizes arquiteturais, regras de nomenclatura e padrões de desenvolvimento que devem ser estritamente seguidos por todos os desenvolvedores no projeto **PECAÊ**.

---

## 🔤 1. Nomenclatura e Organização de Arquivos

A consistência de nomenclatura facilita a legibilidade e a automação de buscas/ferramentas.

* **Diretórios e Arquivos:** Utilizar **kebab-case** para pastas e arquivos (ex: `auth-store.ts`, `seller-verification.service.ts`, `chat-room.controller.ts`).
* **Classes, Decorators e Componentes:** Utilizar **PascalCase** (ex: `AuthService`, `SellerProfileController`, `CustomButton`, `@IsVerifiedSeller()`).
* **Funções, Variáveis e Instâncias:** Utilizar **camelCase** (ex: `getUserByEmail()`, `activeListingsCount`, `prismaService`).
* **Interfaces e Tipos TypeScript:** Utilizar **PascalCase** (ex: `IUserSession`, `VehicleStatusType`). Não utilizar o prefixo `I` em nomes de tipos, preferindo nomes descritivos diretos.
* **Constantes e Variáveis de Ambiente:** Utilizar **UPPER_SNAKE_CASE** (ex: `MAX_UPLOAD_SIZE_MB`, `DATABASE_URL`).

---

## 🌐 2. Padrões de Código Geral (TypeScript & Clean Code)

* **Tipagem Estrita:** Tipagem explícita é obrigatória em assinaturas de funções, retornos de métodos de serviços, controladores e stores.
* **Proibição do `any`:** O uso do tipo `any` é terminantemente proibido. Utilize tipos genéricos (`unknown`), uniões de tipos ou crie interfaces específicas.
* **Funções Pequenas e Focadas:** Métodos e funções devem ser curtos, idealmente realizando apenas uma única tarefa (Single Responsibility Principle).
* **Tratamento Seguro de Erros:** Sempre utilize blocos `try-catch` para capturar exceções em operações de I/O (consultas ao banco de dados, requisições HTTP, leitura de arquivos) e propague erros através de exceções estruturadas.

---

## 🎛️ 3. Convenções do Backend (NestJS & Prisma)

### 3.1 DTOs (Data Transfer Objects) e Validação
* Toda requisição `POST`, `PUT` ou `PATCH` deve ter uma DTO correspondente.
* As DTOs devem utilizar os validadores da biblioteca `class-validator` (ex: `@IsString()`, `@IsEmail()`, `@IsOptional()`) para validação rigorosa de payloads antes do processamento.
* O `ValidationPipe` do NestJS está configurado para rejeitar propriedades não declaradas na DTO (`whitelist: true`, `forbidNonWhitelisted: true`).

### 3.2 Segurança e Autorização
* Endpoints privados devem ser protegidos por Guards específicos (`JwtAuthGuard`).
* Controles finos de privilégios de acesso devem ser declarados com o Guard `@UseGuards(PoliciesGuard)` e definidos via regras CASL (`CheckPolicies`).
* **Segurança de Mutação:** Sempre validar se o `userId` contido no token JWT é o mesmo proprietário do recurso que está sendo alterado no banco de dados.

### 3.3 Persistência de Dados (Prisma)
* Evitar consultas cruas em SQL (Raw Queries). Utilize o Prisma Client fortemente tipado.
* Atualizações e criações consecutivas dependentes devem ser encapsuladas em transações (`prisma.$transaction`).
* Garanta que chaves estrangeiras estejam indexadas no banco para otimização de joins e filtros rápidos.

---

## 📱 4. Convenções do Frontend Mobile (React Native & Expo)

### 4.1 Componentes e Interface de Usuário
* **Princípio UI/UX Premium:** Estilos visuais baseados estritamente na identidade **The Digital Forge** (Glassmorphism, cores escuras harmoniosas com HSL, cantos arredondados pronunciados, sombras suaves e micro-animações).
* **Separação de Lógica e Renderização:** Manter componentes puros focados apenas na renderização de tela. Lógicas complexas de busca de dados, mutações e manipulação de estado devem ser extraídas para hooks customizados (`useListingCreate`, `useAuthSession`).
* **Formulários Responsivos:** Utilizar `react-hook-form` acoplado ao `zod` para validação em tempo real. Isso previne renderizações excessivas e lag de digitação no teclado móvel.

### 4.2 Gerenciamento de Estado
* Usar **Zustand** para gerenciamento de estados que afetam múltiplos fluxos ou componentes distantes (como sessão de usuário e cache do chat).
* Dados confidenciais (tokens, senhas) devem ser persistidos no **Expo Secure Store**, nunca no AsyncStorage padrão.

---

## 📝 5. Convenções de Git e Mensagens de Commit

Mensagens claras e formatadas agilizam auditorias de código e a geração automática de changelogs.

* **Idioma Obrigatório:** As mensagens de commit devem ser escritas exclusivamente em **Português do Brasil (PT-BR)**.
* **Formato Conventional Commits:**
  - `feat(modulo):` para novos recursos.
  - `fix(modulo):` para correções de bugs.
  - `docs(modulo):` para alterações na documentação.
  - `refactor(modulo):` para reestruturação de código que não altera funcionalidade.
  - `test(modulo):` para adição ou correção de testes.
  - `chore(modulo):` para ajustes de build, dependências ou configurações de CI.
* **Exemplos de commits corretos:**
  - `feat(chat): adiciona suporte a WebSockets nativo e fallback de polling`
  - `fix(auth): corrige loop infinito no interceptor de refresh token do axios`
  - `docs(readme): atualiza instruções de setup do Docker no ambiente local`

---

*Conventions and quality rules active: 2026-05-24*
