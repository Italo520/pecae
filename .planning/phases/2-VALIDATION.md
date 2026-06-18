---
phase: 2
slug: 2-navegacao-deslogada
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-18
---

# Phase 2 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright E2E |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npx playwright test e2e/flow6-guest-access.spec.ts` |
| **Full suite command** | `npx playwright test` |
| **Estimated runtime** | ~10 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx playwright test e2e/flow6-guest-access.spec.ts`
- **After every plan wave:** Run `npx playwright test`
- **Before `/gsd-verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 2-01-01 | 01 | 1 | Interceptador de Rotas | T-2-01 / T-2-02 | Exibir prompt de login ao interagir com ações restritas deslogado | E2E | `npx playwright test e2e/flow6-guest-access.spec.ts` | ✅ | ✅ green |
| 2-02-01 | 02 | 2 | Redirecionamento no Login | T-2-03 | Redirecionar comprador logado de volta para a rota especificada em returnUrl | E2E | `npx playwright test e2e/flow6-guest-access.spec.ts` | ✅ | ✅ green |
| 2-03-01 | 03 | 3 | Redirecionamento no Registro | T-2-03 | Redirecionar comprador cadastrado de volta para a rota especificada em returnUrl | E2E | `npx playwright test e2e/flow6-guest-access.spec.ts` | ✅ | ✅ green |
| 2-04-01 | 04 | 4 | Bloqueio de aba Favoritos | T-2-01 | Exibir tela de ACESSO RESTRITO para favoritos deslogado | E2E | `npx playwright test e2e/flow6-guest-access.spec.ts` | ✅ | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Existing infrastructure covers all phase requirements.

---

## Manual-Only Verifications

All phase behaviors have automated verification.

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved 2026-06-18
