# Plano de Implementação: Dashboard do Vendedor (M03-T04-ST01)

Este documento detalha a implementação da tela principal do vendedor no aplicativo mobile PECAÊ.

## 🎯 Objetivos
- Criar a tela `app/(seller)/(tabs)/perfil.tsx`.
- Exibir estatísticas de performance (anúncios, vendas, tempo de resposta).
- Implementar ações rápidas (Editar Perfil, Solicitar Verificação).
- Garantir consistência visual com o Forge Design System.

## 🏗️ Arquitetura e Componentes

### 1. Mobile (Frontend)
- **Tela**: `app/(seller)/(tabs)/perfil.tsx`
- **Componentes Forge**:
    - `ForgeBackground`: Container principal.
    - `ForgeGlassCard`: Para os widgets de estatísticas.
    - `StatWidget`: (Novo) Componente para exibir ícone, valor e label.
    - `VerifiedBadge`: Badge visual de status de verificação.
- **Hooks**:
    - `useQuery`: Buscar dados de `/sellers/me`.
    - `useForgeTheme`: Cores e tipografia.

### 2. API (Backend)
- **Endpoint**: `GET /sellers/me` (Já implementado, mas verificar se inclui `stats`).
- **Data Shape**:
    ```json
    {
      "storeName": "...",
      "isVerified": true,
      "stats": {
        "activeListings": 12,
        "totalSold": 45,
        "avgResponseTime": 15
      }
    }
    ```

## 🚀 Roteiro de Execução

### Passo 1: Preparação da Estrutura (mobile-developer)
- Criar o diretório `app/(seller)/(tabs)`.
- Implementar o `_layout.tsx` para as tabs do vendedor.

### Passo 2: UI do Perfil (mobile-developer + frontend-specialist)
- Desenvolver o Header com Logo/Initials.
- Implementar a grade de estatísticas com `ForgeGlassCard`.
- Adicionar o banner condicional "Solicitar Verificação".

### Passo 3: Integração de Dados (backend-specialist)
- Garantir que o endpoint `GET /sellers/me` retorne as estatísticas reais ou calculadas.

### Passo 4: Testes e Validação (test-engineer)
- Rodar `lint_runner.py`.
- Verificar fluxos de navegação.

## ⚠️ Riscos e Mitigações
- **Performance**: O cálculo de estatísticas no backend pode ser pesado. *Mitigação*: Usar cache ou campo calculado no `SellerStats`.
- **Navegação**: Garantir que o Buyer não acesse as rotas do Seller. *Mitigação*: `RolesGuard` e redirecionamento no Login (já implementado).

---
**Aprovação do Plano:** Aguardando confirmação do usuário para iniciar a Fase 2.
