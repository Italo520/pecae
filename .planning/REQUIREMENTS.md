# REQUIREMENTS.md — Requisitos Ingeridos do Fluxo do Vendedor Refinado (v2.0)

> [!NOTE]
> Este documento foi ingerido a partir de [pecae-fluxo-refinado-v2.html](file:///c:/Users/italo/Desktop/Projects/pecae/pecae-fluxo-refinado-v2.html) via `/gsd-ingest-docs`.

---

## 1. State Machine do Vendedor (5 Estados)

Toda a experiência do vendedor é baseada em uma maquina de estados bem definida:

1. **`UNAUTHENTICATED`**: Usuário não logado ou sem token válido.
2. **`REGISTERED`**: Conta criada como comprador (`COMPRADOR`). Sem perfil comercial.
3. **`ONBOARDED`**: Loja criada (`PerfilVendedor` salvo via `/vendedor/onboarding`). Sem KYC enviado.
4. **`KYC_PENDING` / `KYC_REJECTED`**: Documentos de verificação enviados via `/vendedor/solicitar-verificacao`. Aguarda aprovação do moderador ou requer reenvio se rejeitado.
5. **`VERIFIED`**: Perfil aprovado pelo moderador (`AMBOS`). Acesso total a anúncios e dashboard comercial.

---

## 2. Matriz de Proteção de Rotas por Estado

| Rota | REGISTERED | ONBOARDED | KYC_PENDING | KYC_REJECTED | VERIFIED |
|---|---|---|---|---|---|
| `/vendedor/onboarding` | ✅ Ativo | → Dashboard | → Dashboard | → Dashboard | → Dashboard |
| `/vendedor/solicitar-verificacao` | → Onboarding | ✅ Ativo | → Dashboard | ✅ Reenviar | → Dashboard |
| `/vendedor/dashboard` | → Onboarding | ✅ Pré-KYC | ✅ Restrito | ✅ Restrito | ✅ Completo |
| `/vendedor/anunciar` | → Onboarding | → KYC | ⨯ Bloqueado | → KYC | ✅ Ativo |
| `/vendedor/meus-anuncios` | → Onboarding | → KYC | ✅ Lista Vazia | ✅ Lista Vazia | ✅ Ativo |
| `/vendedor/perfil` | → Onboarding | ✅ Ativo | ✅ Ativo | ✅ Ativo | ✅ Ativo |

---

## 3. Princípios de UX Integrados

- **Progressive Disclosure:** Preenchimento da loja primeiro (Etapa 1), envio de documentos depois (Etapa 2), publicação de anúncios por último.
- **Contextual Priming KYC:** Explicação clara do motivo, documentos necessários e tempo de análise antes de solicitar o upload dos arquivos.
- **Transições de Interface & Feedback Visual:** Spinners e telas de carregamento durante trocas de estado para evitar sensação de travamento.
- **Ocultação Inteligente do Botão "Anunciar":** Botão "Anunciar" oculto para usuários em análise (`KYC_PENDING`) para impedir solicitações duplicadas.
