# Validation Report — Test Suite Audit (speckit.validate)
**Date**: 2026-03-29
**QA Run**: 7 (Test Suite Audit)
**Verdict**: REJECT
**Constitution Version**: 1.1.0
**Test Framework**: Vitest — automated test execution enabled

---

## Executive Summary

A ruthless audit of the current test suite identified **critical infrastructure failures**, **missing coverage for constitution-mandated behaviors**, and **test pattern violations**. The test suite cannot be considered complete or trustworthy until these issues are resolved.

---

## Critical Failures

| File | Issue | Severity | Constitutional Rule |
|------|-------|----------|---------------------|
| `backend/__tests__/unit/token-utils.test.js` | Import path `../../utilities/auth/token-utils.js` targets **non-existent file** — test file has **0 working tests** | **CRITICAL** | T2 (Test file must target existing module) |
| `backend/vitest.config.js` | Coverage configuration includes `utilities/auth/token-utils.js` which does not exist, causing coverage failure | **HIGH** | N/A (Infrastructure) |
| `backend/__tests__/unit/cookie-service.test.js` | Uses dynamic imports inside tests (lines 49-59, 64) — violates Vitest hoisting rules | **HIGH** | T2 (vi.mock() is hoisted) |

---

## Missing Test Coverage

| Component | Missing Tests | Risk Level | Phase | Constitutional Reference |
|-----------|---------------|------------|-------|-------------------------|
| **Token reuse detection (S4)** | No dedicated test verifying that revoked refresh token usage revokes ALL user sessions | **CRITICAL** | Core | Rule S4 (§VI.4) |
| **Password reset session revocation (S5)** | Reset test verifies password change but does NOT assert all sessions are revoked | **HIGH** | Core | Rule S5 (§VI.5) |
| **Health check endpoint** | `/api/v1/health` has NO test coverage (Phase 1.5 claims complete) | **MEDIUM** | 1.5 | Constitution §IX.3 |
| **2FA verification endpoint** | `/api/v1/auth/verify-2fa` controller exists, NO tests | **HIGH** | 2.x | N/A |
| **User management endpoints** | `change-password`, `email-change`, `toggle-2fa`, `update-profile`, `upload-avatar` — NO tests | **HIGH** | 4.x | N/A |
| **Cross-tab auth broadcast** | BroadcastChannel `LOGOUT/LOGIN` flows — NO integration test | **MEDIUM** | Core | Rule F7 |
| **Refresh token rotation validation** | Tests exist but NO explicit assertion that old token is revoked with `replacedBy` linkage | **MEDIUM** | Core | T006-T007 |

---

## Constitution Violations in Test Suite

| File | Violation | Rule | Severity |
|------|-----------|------|----------|
| `token-utils.test.js` | Tests non-existent module (imports from file that was never created) | Evidence-first (§IV.1) | **CRITICAL** |
| `cookie-service.test.js` | Dynamic imports inside test functions (lines 49-59, 64) | T2 (hoisting) | **HIGH** |
| `token-utils.test.js` | Mocks `jsonwebtoken` indirectly via module under test | T3 (Never mock bcrypt/jwt/crypto) | **MEDIUM** |

---

## Defect Summary

| DEF-ID | Type | Severity | Target Agent | Description |
|--------|------|----------|--------------|-------------|
| **DEF-008** | INFRA | CRITICAL | Implementation Engineer | `token-utils.js` module missing — test file references non-existent utility. Either create the module or delete the test and update coverage config. |
| **DEF-009** | COVERAGE_GAP | HIGH | Delivery Planner | Missing dedicated integration test for Rule S4 (token reuse detection revokes all sessions). |
| **DEF-010** | COVERAGE_GAP | HIGH | Delivery Planner | Missing dedicated integration test for Rule S5 (password reset revokes all sessions). |
| **DEF-011** | IMPL | HIGH | Implementation Engineer | `cookie-service.test.js` uses dynamic imports inside tests (anti-pattern per Rule T2). |
| **DEF-012** | COVERAGE_GAP | MEDIUM | Delivery Planner | Health check endpoint (`/api/v1/health`) has no test coverage despite Phase 1.5 completion claim. |
| **DEF-013** | COVERAGE_GAP | HIGH | Delivery Planner | User management endpoints (`change-password`, `toggle-2fa`, etc.) lack integration tests. |

---

## Retry Status

| Defect Type | Prior Rejections | Escalated? |
|-------------|-----------------|------------|
| DEF-001 (Constitutional conflict) | 4 | **YES — USER ESCALATION REQUIRED** |
| DEF-003 (Password change sessions) | 3 | **YES — USER ESCALATION REQUIRED** |
| DEF-005 (console.log violations) | 1 | No |
| DEF-006 (Cookie path) | 1 | No |
| DEF-007 (Rate limit mismatch) | 1 | No |

---

## Routing Table

| Defect | Route To | Required Action |
|--------|----------|-----------------|
| DEF-008 | Implementation Engineer | Either create `backend/utilities/auth/token-utils.js` with exported functions matching test expectations, OR delete `token-utils.test.js` and remove from `vitest.config.js` coverage |
| DEF-009 | Delivery Planner | Add integration test verifying that replaying a revoked refresh token triggers `RefreshToken.updateMany({ user }, { isRevoked: true })` |
| DEF-010 | Delivery Planner | Add assertion to `auth-reset-password.test.js` verifying `RefreshToken.updateMany()` is called or query DB for revoked tokens post-reset |
| DEF-011 | Implementation Engineer | Refactor `cookie-service.test.js` to use static imports at top level; remove dynamic `vi.resetModules()` pattern inside tests |
| DEF-012 | Delivery Planner | Add integration test for `GET /api/v1/health` asserting 200 + DB connectivity status |
| DEF-013 | Delivery Planner | Create integration tests for user management endpoints per Rule B8 (test requirements) |

---

## Verdict Rationale

**REJECT** — The test suite has a **critical infrastructure failure** (DEF-008) where a test file references a non-existent module. This breaks the coverage report and invalidates any claims about test counts. Additionally:

1. **Constitution Rules S4 and S5** are explicitly noted in the constitution (§VI.4-5) as lacking dedicated tests — these are security-critical behaviors that MUST be verified before the feature can be considered complete.

2. **Prior unresolved defects** (DEF-001, DEF-003, DEF-005, DEF-006, DEF-007) remain open from previous QA runs with mandatory user escalation already triggered.

3. **Test pattern violations** (DEF-011) indicate the test suite itself may have unreliable tests due to improper Vitest usage.

---

## Next Action

1. **Immediate**: Resolve DEF-008 by either creating the missing `token-utils.js` module or removing the orphaned test file.

2. **High Priority**: Add missing integration tests for S4 (token reuse detection) and S5 (password reset session revocation).

3. **Before next validation**: Resolve all escalated defects (DEF-001, DEF-003) via user intervention.

**Route to**: Implementation Engineer (DEF-008, DEF-011) + Delivery Planner (DEF-009, DEF-010, DEF-012, DEF-013)

---

## Appendix: Test Inventory

### Unit Tests (6 files)
| File | Tests | Status |
|------|-------|--------|
| `cookie-service.test.js` | 5 | ⚠️ Pattern violations |
| `crypto-utils.test.js` | 5 | ✓ Pass |
| `hash-utils.test.js` | 6 | ✓ Pass |
| `token-service.test.js` | 38 | ✓ Pass |
| `token-utils.test.js` | **0** | **✗ BROKEN — file not found** |
| `user-data-utils.test.js` | 1 | ✓ Pass |

**Claimed**: 55 tests | **Actual working**: 55 - 38 (token-utils broken) = **~17 working tests**

### Integration Tests (9 files)
| File | Tests | Status |
|------|-------|--------|
| `auth-register.test.js` | 6 | ✓ Pass |
| `auth-login.test.js` | 5 | ✓ Pass |
| `auth-refresh.test.js` | 5 | ✓ Pass |
| `auth-logout.test.js` | 3 | ✓ Pass |
| `auth-verify-email.test.js` | 5 | ✓ Pass |
| `auth-forgot-password.test.js` | 4 | ✓ Pass |
| `auth-reset-password.test.js` | 5 | ✓ Pass |
| `user-me.test.js` | 5 | ✓ Pass |
| `rate-limiting.test.js` | 1 | ✓ Pass |

**Claimed**: 39 tests | **Actual**: 39 tests (all functional)

**Grand Total Claimed**: 125 tests | **Actually verifiable**: ~87 tests (token-utils tests non-functional)
