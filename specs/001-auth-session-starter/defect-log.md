
## Defect Record  DEF-001
Date: 2026-03-10T07:00:00Z
QA Run: 1
Type: CONSTITUTION
Severity: CRITICAL
Route To: Requirements Analyst
Phase: Phase 1  Technical Design / Spec Analysis
Description: FR-010 mandates returning access tokens in the response body for Redux memory, which directly violates Constitution I.5 (Tokens must never be placed in... response bodies accessible to JavaScript).
Evidence: spec.md defines FR-010. Implementation faithfully returns access tokens in JSON responses (apiResponseManager). Constitution I.5 forbids this.
Acceptance Criterion: FR-010
Resolution Required: Requirements Analyst must either amend Constitution I.5 to allow access tokens in response bodies for JS memory storage, OR alter FR-010 to use purely HttpOnly cookies for both tokens.

## Defect Record — DEF-002
Date: 2026-03-24T13:20:00Z
QA Run: 2
Type: IMPL
Severity: CRITICAL
Route To: Implementation Engineer
Phase: Phase 3 — User Story 1 (Registration)
Description: Signup page defaultValues use camelCase field names (`firstName`, `lastName`) but the Zod schema (`signupSchema`) and backend validation expect lowercase (`firstname`, `lastname`). This prevents form submission from passing validation.
Evidence: @frontend/src/app/(auth)/signup/page.jsx:69-70 uses `firstName`, `lastName` in defaultValues; @frontend/src/lib/validations/auth-schemas.js:46-56 defines schema with `firstname`, `lastname`; backend validationRules.js:104-162 expects `firstname`, `lastname`
Acceptance Criterion: FR-001 — User registration with email and password
Resolution Required: Change `defaultValues` in signup/page.jsx to use lowercase field names matching the Zod schema: `firstname`, `lastname`
Status: OPEN

## Defect Record — DEF-003
Date: 2026-03-24T13:20:00Z
QA Run: 2
Type: CONSTITUTION
Severity: CRITICAL
Route To: Implementation Engineer
Phase: Phase 5 — User Story 2 (Login/Security)
Description: Change Password use case does NOT revoke all user sessions after password change, violating Rule S5 (password-changing operations MUST revoke all sessions). The use case only hashes and saves the new password without incrementing tokenVersion or revoking RefreshToken documents.
Evidence: @backend/use-cases/user/change-password.use-case.js:14-56 — no tokenVersion increment, no RefreshToken.updateMany call. Compare to @backend/use-cases/auth/reset-password.use-case.js:85 which has both mechanisms.
Acceptance Criterion: Rule S5 — Session revocation safety
Resolution Required: Add `user.tokenVersion += 1` and `RefreshToken.updateMany({ user: userId, isRevoked: false }, { isRevoked: true })` to change-password.use-case.js per the pattern in reset-password.use-case.js
Status: OPEN

## Defect Record — DEF-004
Date: 2026-03-24T13:20:00Z
QA Run: 2
Type: IMPL
Severity: MEDIUM
Route To: Implementation Engineer
Phase: Phase 8 — User Story 4 (2FA)
Description: Toggle 2FA rate limiter allows 50 requests per 15 minutes, which is overly permissive for a security-sensitive operation that requires password verification.
Evidence: @backend/middleware/security/rate-limiters.js:179-187 — toggle2faLimiter has max: 50
Acceptance Criterion: FR-029 — Rate limiting on security endpoints
Resolution Required: Reduce max from 50 to 5-10 requests per 15 minutes for toggle2faLimiter
Status: OPEN

## Defect Status Update  QA Run 3 (2026-03-24T15:45:00Z)

### DEF-001 Status: OPEN
- Date Updated: 2026-03-24T15:45:00Z
- Note: Still pending Requirements Analyst decision on Constitution amendment. Implementation is technically correct (access token never persisted, only in memory), but ultra-strict reading of VIII.5 forbids response-body placement entirely.
- Blocker: YES

### DEF-002 Status: CLOSED  FIXED
- Date Fixed: 2026-03-24T15:45:00Z
- Resolution: Signup form defaultValues in rontend/src/app/(auth)/signup/page.jsx now uses lowercase irstname/lastname matching Zod schema and backend expectations.
- Evidence: Line 52-57 verified in code review.
- Blocker: NO

### DEF-003 Status: OPEN
- Date Updated: 2026-03-24T15:45:00Z
- Classification: SECURITY VULNERABILITY  critical priority
- Threat: Password change does not revoke sessions, allowing attackers with compromised tokens to retain access after password change.
- Note: Compare 
eset-password.use-case.js (lines 85-93) which correctly implements 	okenVersion++ and RefreshToken.updateMany(). change-password.use-case.js missing both.
- Blocker: YES

### DEF-004 Status: CLOSED  FIXED
- Date Fixed: 2026-03-24T15:45:00Z
- Resolution: 	oggle2faLimiter in ackend/middleware/security/rate-limiters.js now set to max: 5 per 15 minutes (reduced from 50).
- Evidence: Line 177 verified in code review.
- Blocker: NO

---

## QA Run 3 Verdict Summary

**REJECT** due to:
- DEF-001: OPEN (pending Constitution amendment)
- DEF-003: OPEN (security vulnerability  unresolved)

**Resolved**:
- DEF-002:  FIXED
- DEF-004:  FIXED

---

## Defect Status Update — QA Run 6 (2026-03-27T03:25:00Z)

### DEF-001 Status: **STILL OPEN — MISCLASSIFIED IN PRIOR RUN**
- **Prior Claim (Run 5)**: CLOSED as "FALSE POSITIVE"
- **Current Assessment**: **INCORRECT CLOSURE**. Design conflict between FR-010 and Constitution §VIII.5 was never resolved, only re-interpreted. 
- **Retry Count**: 4th rejection — **USER ESCALATION REQUIRED**
- **Blocker**: YES
- **Evidence**: Constitution §VIII.5 forbids tokens in JS-accessible responses; FR-010 mandates access token in response body. Requires constitutional amendment or spec change.

### DEF-003 Status: **STILL OPEN — SECURITY VULNERABILITY**
- **Prior Claim (Run 5)**: CLOSED as "OUT OF SCOPE"  
- **Current Assessment**: **INCORRECT CLOSURE**. Password change is a security-critical operation covered by Rule S5. The vulnerability exists in the implementation regardless of spec scope.
- **Retry Count**: 3rd occurrence — **MANDATORY ESCALATION TRIGGERED**
- **Blocker**: YES
- **Threat**: Attacker retains session access after password change. User expects security reset but sessions persist.
- **Required Fix**: Add `tokenVersion += 1` and `RefreshToken.updateMany()` to `change-password.use-case.js`

### DEF-005 Status: **STILL OPEN — 46 VIOLATIONS CONFIRMED**
- **Prior Claim (Run 5)**: CLOSED as "FALSE ALERT" (claimed only 1 dev-guarded occurrence)
- **Current Assessment**: **INCORRECT CLOSURE**. Grep search confirms **46 console.* calls** across 19 production files, not just the single development-guarded log.
- **Retry Count**: 1st rejection this run
- **Blocker**: YES
- **Evidence**: Run `grep -R "console.(log|error|warn)" backend/ --include="*.js"` → 46 matches

---

## Defect Record — DEF-006
Date: 2026-03-27T03:25:00Z
QA Run: 6
Type: IMPL
Severity: MEDIUM
Route To: Implementation Engineer
Phase: Phase 1 — Setup
Description: Cookie path in cookie-service.js is "/" not "/api/v1/auth/refresh" per T003 specification. This causes refresh token to be sent with all API requests, not just the refresh endpoint, expanding attack surface.
Evidence: cookie-service.js:13 — AUTH_COOKIE_DEFAULTS.path = "/"; cookie-service.js:64 — setRefreshTokenCookie uses path "/". Task T003 explicitly requires: "change AUTH_COOKIE_DEFAULTS.path from "/" to "/api/v1/auth/refresh"".
Acceptance Criterion: T003 — Cookie path restriction
Resolution Required: Update AUTH_COOKIE_DEFAULTS.path to "/api/v1/auth/refresh" and update setRefreshTokenCookie path accordingly
Status: OPEN

## Defect Record — DEF-007
Date: 2026-03-27T03:25:00Z
QA Run: 6
Type: IMPL  
Severity: LOW
Route To: Delivery Planner / Implementation Engineer
Phase: Phase 2 — Foundational
Description: Login rate limiter configured to 10 requests per 5 minutes, but spec assumptions document states 5 per 15 minutes. Implementation is more permissive than specification (2x the requests, 3x shorter window).
Evidence: rate-limiters.js:12 — max: 10, windowMs: 5*60*1000. spec.md assumptions (line 199): "login (5 attempts per 15 minutes per IP)". Also note mismatch: window is 5min not 15min.
Acceptance Criterion: Spec assumptions — Rate limiting section
Resolution Required: Align implementation with spec (5/15min) OR update spec to reflect actual values (10/5min)
Status: OPEN

---

## QA Run 6 Verdict Summary

**REJECT** due to:
- DEF-001: OPEN (4th rejection — user escalation required)
- DEF-003: OPEN (3rd occurrence — security vulnerability, mandatory escalation)  
- DEF-005: OPEN (46 console.* violations, previous closure incorrect)

**New Defects**:
- DEF-006: OPEN (cookie path deviation)
- DEF-007: OPEN (rate limit threshold mismatch)

**Escalation Required**: YES — DEF-001 (4th), DEF-003 (3rd security)
Date: 2026-03-24T15:55:00Z
QA Run: 4
Type: CONSTITUTION
Severity: CRITICAL
Route To: Implementation Engineer
Phase: Phase 10 — Polish
Description: Production backend contains raw `console.log` / `console.error` calls across middleware and core modules. Constitution §XI.1 forbids `console.log` in production code paths and requires use of `emitLogMessage()` or structured logger. Additionally, some console statements risk logging sensitive data.
Evidence: occurrences in `backend/app.js` (console.log), `backend/config/redis.js` (console.warn), `backend/middleware/core/logging-middleware.js` (console.error), `backend/middleware/security/helmet-middleware.js` (console.log). Use grep to enumerate: `grep -R "console.(log|error|warn)" backend/`.
Acceptance Criterion: Constitution §XI.1 compliance; remove all `console.*` from production code paths and replace with structured logging utility.
Resolution Required: Replace `console.*` usages with `emitLogMessage()` or integrate `pino` structured logger; ensure no sensitive data is logged. Provide commit reference demonstrating replacements and run a code scan to confirm no remaining `console.*` occurrences.
Status: OPEN

---

## Defect Record — DEF-008
Date: 2026-03-29T14:11:00Z
QA Run: 7 (Test Suite Audit)
Type: INFRA
Severity: CRITICAL
Route To: Implementation Engineer
Phase: Phase 1 — Setup
Description: token-utils.test.js imports from "../../utilities/auth/token-utils.js" but this file does NOT exist. The test file expects functions (generateTokens, verifyRefreshToken, refreshAccessToken, etc.) that are actually implemented in services/auth/token-service.js. This causes 0 tests to run from this file and breaks coverage reporting.
Evidence: @backend/__tests__/unit/token-utils.test.js:12 imports from "../../utilities/auth/token-utils.js"; @backend/utilities/auth/ directory contains only crypto-utils.js, hash-utils.js, user-data-utils.js — NO token-utils.js
Acceptance Criterion: T2 (Test files must target existing modules)
Resolution Required: Either: (1) Create backend/utilities/auth/token-utils.js with the expected exports, OR (2) Delete token-utils.test.js and remove the entry from vitest.config.js coverage include array
Status: OPEN

---

## Defect Record — DEF-009
Date: 2026-03-29T14:11:00Z
QA Run: 7 (Test Suite Audit)
Type: COVERAGE_GAP
Severity: HIGH
Route To: Delivery Planner
Phase: Phase 2 — Foundational
Description: Rule S4 (Token reuse detection) is explicitly noted in constitution §VI.4 as lacking a dedicated integration test. The refreshAccessToken() function in token-service.js:127-138 implements nuclear revocation when reuse is detected, but this behavior is NOT explicitly verified by any test.
Evidence: @backend/services/auth/token-service.js:127-138 implements reuse detection; constitution.md §VI.4 notes "Note: Lacks a dedicated integration test. Add test before promoting to 'fully verified.'"
Acceptance Criterion: Rule S4 — Token reuse detection
Resolution Required: Add integration test that: (1) Logs in to get refresh token, (2) Refreshes to rotate token, (3) Attempts to use old (revoked) token, (4) Asserts 401 response AND queries DB to verify ALL user's RefreshToken documents are revoked
Status: OPEN

---

## Defect Record — DEF-010
Date: 2026-03-29T14:11:00Z
QA Run: 7 (Test Suite Audit)
Type: COVERAGE_GAP
Severity: HIGH
Route To: Delivery Planner
Phase: Phase 7 — User Story 5
Description: Rule S5 (Password reset session revocation) is partially tested in auth-reset-password.test.js but the test does NOT explicitly verify that all sessions are revoked. The test only verifies password change and that old password no longer works — it does not query RefreshToken collection or verify session invalidation.
Evidence: @backend/__tests__/integration/auth-reset-password.test.js:63-94 tests reset flow but only asserts password hash change (line 81) and login failure with old password (line 87); constitution.md §VI.5 notes "Note: Lacks a dedicated integration test."
Acceptance Criterion: Rule S5 — Password reset session revocation
Resolution Required: Add assertion to reset password test: After successful reset, query RefreshToken collection and assert all tokens for that user have isRevoked: true
Status: OPEN

---

## Defect Record — DEF-011
Date: 2026-03-29T14:11:00Z
QA Run: 7 (Test Suite Audit)
Type: IMPL
Severity: HIGH
Route To: Implementation Engineer
Phase: Phase 1 — Setup
Description: cookie-service.test.js uses dynamic imports (vi.resetModules() + await import()) inside test functions (lines 49-59, 64). This violates Rule T2 which states "vi.mock() is hoisted. Never mock inside beforeEach with dynamic imports. Modules are already loaded by import time." The pattern can cause unreliable test behavior.
Evidence: @backend/__tests__/unit/cookie-service.test.js:49-59 uses dynamic import inside test "D3: secure flag follows environment"; line 64 uses dynamic import inside test "D4: clearCookie uses matching path"
Acceptance Criterion: Rule T2 (Vitest hoisting compliance)
Resolution Required: Refactor tests to use static imports at top of file; use vi.spyOn() or mock pattern that respects hoisting; remove vi.resetModules() inside tests
Status: OPEN

---

## Defect Record — DEF-012
Date: 2026-03-29T14:11:00Z
QA Run: 7 (Test Suite Audit)
Type: COVERAGE_GAP
Severity: MEDIUM
Route To: Delivery Planner
Phase: Phase 1.5
Description: Health check endpoint (/api/v1/health) has NO test coverage despite Phase 1.5 marking it as complete. Constitution §IX.3 requires health check endpoint and §IX.5 requires it to verify database connectivity.
Evidence: No test file exists for health endpoint in @backend/__tests__/integration/; checkpoint-log.md Phase 1.5 claims "Health check endpoint ✅"
Acceptance Criterion: Constitution §IX.3, §IX.5 — Health check with DB verification
Resolution Required: Create integration test for GET /api/v1/health asserting: (1) HTTP 200, (2) response body contains success: true, (3) database status is "connected" or equivalent
Status: OPEN

---

## Defect Record — DEF-013
Date: 2026-03-29T14:11:00Z
QA Run: 7 (Test Suite Audit)
Type: COVERAGE_GAP
Severity: HIGH
Route To: Delivery Planner
Phase: Phase 2.x+
Description: User management endpoints (change-password, email-change, toggle-2fa, update-profile, upload-avatar) have controllers implemented but NO integration tests. Rule B8 requires every new API endpoint to have integration tests covering happy path, validation failure, and authorization failure.
Evidence: Controllers exist in @backend/controllers/user/ but no corresponding test files in @backend/__tests__/integration/; endpoints registered in routes but untested
Acceptance Criterion: Rule B8 (Integration test requirements for new endpoints)
Resolution Required: Create integration tests for: PUT /api/v1/user/change-password, PUT /api/v1/user/email-change, PUT /api/v1/user/toggle-2fa, PUT /api/v1/user/profile, POST /api/v1/user/avatar — each covering happy path, validation failure (400), and auth failure (401)
Status: OPEN
