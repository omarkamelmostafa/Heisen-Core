
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
- Note: Compare eset-password.use-case.js (lines 85-93) which correctly implements 	okenVersion++ and RefreshToken.updateMany(). change-password.use-case.js missing both.
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

Escalation required: Both DEF-001 and DEF-003 exceed normal retry threshold.
