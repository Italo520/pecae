# PLAN.md - Redesenho do Fluxo e UI do Comprador (Padrão OLX)

## 📌 Visão Geral
Reestruturação completa da experiência móvel do comprador baseada em benchmarking de grandes marketplaces (OLX). O redesenho foca em uma arquitetura de navegação limpa no rodapé (Footer) combinada com um Menu Hambúrguer lateral completo para gerenciamento da conta.

---

## 🛠️ Escopo de Alterações

### 1. Novo Footer (Abas Inferiores)
Localização: `apps/mobile/app/(tabs)/_layout.tsx`
Configuração de 4 abas principais:
- **Início (Home):** Feed de recomendações, anúncios em destaque e perfis de vendedores verificados.
- **Explorar (Lupa):** Central de buscas avançadas, filtros dinâmicos e opções de ordenação.
- **Chat (Diálogo):** Caixa de entrada unificada com a lista de chats de negociações ativos.
- **Menu (Hambúrguer):** Gatilho para o painel lateral completo do usuário.

### 2. Menu Hambúrguer Lateral (Drawer/Gaveta)
Implementação inspirada no padrão OLX, incluindo:
- **Cabeçalho:** Ícone/Avatar do Perfil do usuário.
- **Visualização:** Chave seletora para alternar Modo Claro / Modo Escuro.
- **Gerenciamento de Busca:** Anúncios Salvos (Alertas de busca).
- **Interesse:** Anúncios Favoritos.
- **Histórico:** Aba de "Minhas Compras" com a listagem de transações e histórico.
- **Minha Conta:** Página para edição de dados pessoais e preferências do usuário.
- **Central de Segurança:**
  - Nível de segurança da conta.
  - Configuração do selo de verificação.
  - Métodos de autenticação (2FA, biometria).
  - Histórico de conexões (Dispositivo, IP, data/hora, localização).
- **Suporte:** Menu de Ajuda / FAQ.
- **Sessão:** Botão Sair (Logout).

---

## 📅 Cronograma de Execução (Fases)

### Fase 1: Atualização da Estrutura de Navegação (Footer)
- [x] Ajustar as abas ativas em `apps/mobile/app/(tabs)/_layout.tsx`.
- [x] Adicionar os ícones e rótulos das novas 4 seções (Início, Explorar, Chat, Menu).

### Fase 2: Geração de Telas via StitchMCP
- [x] Utilizar o MCP do Stitch para gerar/editar as telas essenciais:
  - Menu Hambúrguer (com opções expandidas).
  - Central de Segurança.
  - Minhas Compras.
  - Telas de Filtros em Explorar.

### Fase 3: Integração e Lógica de Negócio
- [x] Vincular o seletor de Modo Escuro ao estado global do tema.
- [x] Conectar as listagens de favoritos e compras com a API back-end.

---

## 🧪 Critérios de Aceitação
- [x] Todas as 4 abas do rodapé funcionam independentemente e sem bugs de travamento.
- [x] O modo claro/escuro atualiza instantaneamente a paleta de cores Glassmorphism.
- [x] A central de segurança reflete as permissões e dados reais do login ativo.
