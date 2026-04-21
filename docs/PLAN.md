# PLAN.md - Restauração da Identidade Visual PEÇAÊ (Verde)

Este plano detalha a reversão das cores para a paleta Verde original conforme o Design System, mantendo a marca **PEÇAÊ** e eliminando referências legadas à "Forja".

## 🏁 Estado Atual
- [x] Nome e Marca "PEÇAÊ" integrados.
- [x] Responsividade Web (Container) implementada.
- [!] Cores atuais: Âmbar (ERRADO - deve ser Verde).

---

## 🎯 Objetivos (Orquestração de Reversão)

### 1. Atualização do Design System (`frontend-specialist`)
- [ ] Atualizar `pecae-tokens.ts` com as cores oficiais:
  - Principal: `#2D8C4E`
  - Vibrante: `#4ADE80`
  - Escuro: `#14532D`
- [ ] Atualizar `PecaeBackground.tsx` com o gradiente Dark: `#022C22` para `#064E3B`.
- [ ] Revisar `PecaeGlassCard` para garantir bordas translúcidas nítidas.

### 2. Refatoração de Telas e Navegação (`mobile-developer`)
- [ ] Auditar `login.tsx` e `register.tsx` para garantir uso exclusivo dos tokens verdes.
- [ ] Atualizar `onboarding.tsx` e fluxos de vendedor.
- [ ] Ajustar as Tab Bars (Main e Seller) para usar o Verde PEÇAÊ como `activeTintColor`.

### 3. Verificação e Qualidade (`test-engineer`)
- [ ] Executar `ux_audit.py` para validar conformidade visual.
- [ ] Executar `security_scan.py` para garantir integridade.
- [ ] Validar renderização Web em diferentes resoluções.

---

## 🛠️ Agentes Envolvidos

| Agente | Foco |
| :--- | :--- |
| `project-planner` | Gestão do Plano e Orquestração |
| `frontend-specialist` | Implementação de Tokens e Componentes |
| `mobile-developer` | Aplicação em Telas e Navegação |
| `test-engineer` | Verificação Final e Auditoria |

---

## ⏸️ CHECKPOINT DE APROVAÇÃO
**✅ Plano de Reversão de Cores criado. Você aprova? (Y/N)**
