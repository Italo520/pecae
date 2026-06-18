---
phase: 2
slug: 2-navegacao-deslogada
status: verified
threats_open: 0
asvs_level: 1
created: 2026-06-18
---

# Phase 2 — Security

> Per-phase security contract: threat register, accepted risks, and audit trail.

---

## Trust Boundaries

| Boundary | Description | Data Crossing |
|----------|-------------|---------------|
| Dispositivo Mobile / API Backend | A comunicação entre o app deslogado e o backend cruza a borda de confiança através do protocolo HTTPS. | Credenciais de usuário (durante login/cadastro) e tokens JWT (após autenticação) atravessam esta borda. |
| Armazenamento Local (AsyncStorage) | Armazena o token JWT de acesso e refresh de forma persistente. | Tokens de autenticação com privilégios de acesso do usuário. |

---

## Threat Register

| Threat ID | Category | Component | Disposition | Mitigation | Status |
|-----------|----------|-----------|-------------|------------|--------|
| T-2-01 | Information Disclosure | `useFavorites.ts` | mitigate | `enabled: !!token` no React Query impede chamadas automáticas à API sem autenticação. | closed |
| T-2-02 | Elevation of Privilege | `favoritos.tsx` | mitigate | O helper `requireAuth` intercepta ações de mutação de favoritos e força autenticação prévia. | closed |
| T-2-03 | Spoofing | `login.tsx` / `register.tsx` | accept | O Expo Router restringe o roteamento por arquivos locais. Parâmetros como `returnUrl` só processam caminhos locais internos relativos ao app. | closed |

*Status: open · closed*
*Disposition: mitigate (implementation required) · accept (documented risk) · transfer (third-party)*

---

## Accepted Risks Log

| Risk ID | Threat Ref | Rationale | Accepted By | Date |
|---------|------------|-----------|-------------|------|
| R-2-01 | T-2-03 | O comportamento de redirecionamento interno do Expo Router resolve caminhos relativos ao projeto, mitigando o risco de redirecionamentos externos maliciosos (Open Redirect). | security-auditor | 2026-06-18 |

---

## Security Audit Trail

| Audit Date | Threats Total | Closed | Open | Run By |
|------------|---------------|--------|------|--------|
| 2026-06-18 | 3 | 3 | 0 | security-auditor |

---

## Sign-Off

- [x] All threats have a disposition (mitigate / accept / transfer)
- [x] Accepted risks documented in Accepted Risks Log
- [x] `threats_open: 0` confirmed
- [x] `status: verified` set in frontmatter

**Approval:** verified 2026-06-18
