# PLAN: Perfil Público do Vendedor (ST03)

Este plano descreve a implementação da tela pública do vendedor no App e os endpoints necessários no Backend, garantindo segurança de dados e consistência com o sistema de design Forge.

## 🛠️ Escopo Técnico

### 1. Backend (API)
- **Endpoint**: `GET /sellers/:id/public`
- **Lógica**: Retornar dados da loja (nome, logo, cidade, estado, isVerified, stats) e flags de contato (showWhatsapp).
- **Segurança**: Filtrar campos sensíveis (CPF/CNPJ completo, e-mail privado, endereço detalhado).
- **Anúncios**: Endpoint `GET /sellers/:id/listings` para retornar anúncios `PUBLISHED`, priorizando `featured`.

### 2. Mobile (App)
- **Rota**: `app/vendedor/[id].tsx` (Pública).
- **Componentes**:
    - `StoreHeader`: Industrial Glassmorphism com logo, nome e selo verificado.
    - `StoreStats`: Cards compactos com anúncios ativos e tempo de resposta.
    - `ContactActions`: Botão "Iniciar Chat" (primário) e "WhatsApp" (condicional).
    - `ListingsGrid`: Lista de anúncios do vendedor.

---

## 📅 Cronograma de Execução

### Fase 1: Fundação & Backend (`backend-specialist` + `security-auditor`)
- [ ] Criar `PublicSellerDto` para filtrar saída de dados.
- [ ] Implementar `SellersService.getPublicProfile(id)`.
- [ ] Adicionar campo `showWhatsapp` ao `SellerProfile` no Prisma.
- [ ] Validar que `GET /sellers/:id/public` não exige autenticação.

### Fase 2: Interface & Integração (`mobile-developer`)
- [ ] Criar a tela `app/vendedor/[id].tsx`.
- [ ] Implementar o layout com `StoreHeader` e animações de scroll.
- [ ] Integrar com TanStack Query para buscar o perfil e os anúncios.
- [ ] Configurar navegação do card de anúncio para o perfil.

### Fase 3: Polimento & Verificação (`test-engineer` + `security-auditor`)
- [ ] Testar navegação entre anúncio -> vendedor -> outro anúncio.
- [ ] Rodar `security_scan.py` para garantir que o endpoint público não expõe PII.
- [ ] Validar responsividade em diferentes tamanhos de tela.

---

## 🛑 Checkpoint de Aprovação
- Os dados exibidos são: Nome da Loja, Cidade/UF, Selo Verificado, Stats, Anúncios Ativos.
- O botão de WhatsApp só aparece se o vendedor habilitou no perfil.
- O endereço completo **não** é exibido.
