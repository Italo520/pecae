---
phase: 4
slug: 4-busca-aprimorada
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-06-18
---

# Phase 4 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Playwright (E2E) + Jest (Unitário Backend) |
| **Config file** | `playwright.config.ts` |
| **Quick run command** | `npx playwright test e2e/flow6-guest-access.spec.ts` |
| **Full suite command** | `npx playwright test && npm run test --prefix apps/api` |
| **Estimated runtime** | ~15 seconds |

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
| 4-01-01 | 01 | 1 | Filtros em cascata (UI) | T-4-03 | Componentes de Bottom Sheet exibem marcas/modelos e atualizam em cascata | E2E | `npx playwright test e2e/flow6-guest-access.spec.ts` | ✅ | ✅ green |
| 4-02-01 | 02 | 2 | DTO de busca (Backend) | T-4-02 | Validação e mapeamento do DTO de busca na API | Unitário | `npm run test -- apps/api/src/search/search.service.spec.ts` | ✅ | ✅ green |
| 4-03-01 | 03 | 3 | Filtros no Banco | T-4-01 / T-4-02 | Queries do Prisma filtram por mileageMax e fuelType corretamente | Unitário | `npm run test -- apps/api/src/search/search.service.spec.ts` | ✅ | ✅ green |
| 4-04-01 | 04 | 4 | Redirecionamento da Home | T-4-01 | Redirecionar usuário da Home para Search com termo pesquisado na query | E2E | `npx playwright test e2e/flow6-guest-access.spec.ts` | ✅ | ✅ green |

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
