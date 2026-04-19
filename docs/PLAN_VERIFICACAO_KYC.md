# Plano de Implementação: Verificação / KYC do Vendedor (ST04)

Este plano descreve a implementação do fluxo de solicitação de verificação (Selo Verificado) para o módulo **M03 — Perfil do Vendedor**. O objetivo é permitir que vendedores enviem documentação para validação pela moderação.

## 🛠️ Arquitetura Técnica

### 1. Modelo de Dados (Prisma)
- **Enum `VerificationStatus`**: `PENDING`, `APPROVED`, `REJECTED`.
- **Model `SellerVerification`**:
    - `id`, `sellerProfileId` (FK), `status`.
    - `documentUrls` (Json array de paths no storage).
    - `notes` (motivo de rejeição).
    - `moderatorId` (quem processou).
    - `createdAt`, `resolvedAt`.

### 2. Fluxo de Armazenamento (Supabase Storage)
- **Bucket**: `verification-docs` (Privado).
- **Segurança**: Documentos não acessíveis publicamente. Acesso via URLs assinadas geradas na API para moderadores.

---

## 📋 Cronograma de Tarefas

### Fase 1: Fundação & Banco de Dados (`database-architect`)
- [ ] Adicionar `VerificationStatus` enum ao `schema.prisma`.
- [ ] Adicionar model `SellerVerification`.
- [ ] Relacionar `SellerVerification` com `SellerProfile` e `User` (moderador).
- [ ] Executar `npx prisma migrate dev`.

### Fase 2: Backend & API (`backend-specialist` + `security-auditor`)
- [ ] Criar `VerificationService` no NestJS.
- [ ] Implementar `POST /sellers/request-verification`:
    - Verifica se já existe solicitação `PENDING`.
    - Gera URLs assinadas para upload de até 5 arquivos.
- [ ] Implementar `POST /sellers/request-verification/confirm`:
    - Registra a solicitação como `PENDING`.
- [ ] (Mock) Endpoint de moderação para testes rápidos: `PATCH /sellers/verification/:id/process`.

### Fase 3: Interface Mobile (`mobile-developer`)
- [ ] Criar `app/(seller)/solicitar-verificacao.tsx`.
- [ ] Implementar seletor de arquivos (PDF/Imagens).
- [ ] Fluxo de upload paralelo para o Supabase Storage.
- [ ] Exibição de status dinâmico (Em análise, Aprovado, Rejeitado).

---

## 🛡️ Segurança & Regras de Negócio
- **RN13**: Selo concedido apenas por moderadores.
- **RN-M03-01**: Apenas 1 perfil por usuário.
- **Privacidade**: Documentos armazenados em bucket privado com RLS (Row Level Security).
- **Limites**: Máximo 5 arquivos, 5MB cada.

## 🧪 Verificação (Testes)
- [ ] Testar upload de múltiplos arquivos.
- [ ] Validar que usuário com status `PENDING` não pode enviar nova solicitação.
- [ ] Verificar se `isVerified` muda para `true` apenas após aprovação.
