# Research: Authentication and Session Management Starter Kit

**Branch**: `001-auth-session-starter` | **Date**: 2026-03-10

## R-001: Multi-Device Refresh Token Storage

**Decision**: Extract refresh tokens from the `User` model into a dedicated `RefreshToken` Mongoose model.

**Rationale**: The current `User.js` has a single `refreshToken` field — each new login overwrites the previous token, killing sessions on other devices. Multi-device support requires one document per active session. A separate collection also enables rotation chain tracking (FR-015) and reuse detection (FR-016) via a `replacedBy` reference.

**Alternatives considered**:
- **Array on User model**: Embedding an array of refresh tokens inside `User` would cause document bloat and make atomic rotation harder. Rejected.
- **Redis-only storage**: Storing refresh tokens exclusively in Redis would lose persistence across Redis restarts and make rotation chain traversal more complex. Rejected — Redis is used for blacklisting (short-lived TTL), not long-lived token storage.

---

## R-002: Refresh Token Rotation and Reuse Detection

**Decision**: Implement rotation chains via a `replacedBy` reference on each `RefreshToken` document. On successful refresh, the old token document is marked `isRevoked: true` and its `replacedBy` points to the new token's ID. If a revoked token is presented, traverse the chain forward and revoke all descendants + all tokens for that user.

**Rationale**: This is the approach recommended by Auth0 and OWASP for detecting token theft. If an attacker uses a stolen refresh token after the legitimate user has already rotated it, the system detects the reuse and invalidates the entire token family.

**Alternatives considered**:
- **Token versioning only** (`tokenVersion` on User): Already partially implemented. Effective for "logout all" but cannot detect individual token reuse — it's a global kill switch, not per-session detection. Retained as a complementary mechanism for "logout all devices."
- **Redis-based token families**: More complex to implement chain traversal. Rejected for the same reasons as R-001.

---

## R-003: Cookie Path Restriction

**Decision**: Set the refresh token cookie `path` to `/api/v1/auth/refresh` instead of `/`.

**Rationale**: FR-011 requires the refresh token cookie to only be sent with refresh requests. The current `cookie-service.js` uses `path: "/"`, which sends the cookie with every API call. Path restriction ensures the browser only includes the cookie when calling the refresh endpoint — reducing attack surface and preventing accidental token exposure.

**Alternatives considered**:
- **Keep `path: "/"` and accept the security risk**: Violates FR-011 ("path restricted to the refresh endpoint"). Rejected.
- **Use a separate cookie name with a distinct path for each endpoint**: Over-engineered for a single refresh endpoint. Rejected.

---

## R-004: Frontend Access Token Storage — Redux Memory Only

**Decision**: Store the access token in Redux state only (not persisted via `redux-persist`, not in cookies, not in `localStorage`). The existing `TokenManager.hasValidSession()` checks for an `access_token` cookie — this needs modification. The access token should be returned in the response body and stored in the Redux auth slice's in-memory state.

**Rationale**: FR-010 mandates access tokens be held in application memory only. The current implementation appears to set the access token as a cookie (since `TokenManager` checks `cookieService.get(STORAGE_KEYS.ACCESS_TOKEN)`) — this must change to pure Redux state. On page refresh, the access token is lost (by design), and the bootstrap flow calls the refresh endpoint to get a new one.

**Alternatives considered**:
- **Keep access token in cookie**: Violates FR-010 and the spec's explicit boundary "no redux-persist or localStorage for token storage." Also, cookie-based access tokens are vulnerable to CSRF. Rejected.
- **`sessionStorage`**: Doesn't survive page refresh as desired, but also doesn't share across tabs. Rejected — the bootstrap flow via refresh endpoint achieves cross-tab restoration without client-side storage.

---

## R-005: Password Hashing Location

**Decision**: Hash passwords with bcrypt in the `register.controller.js` (and `password-reset.controller.js`) before saving to the database. Do NOT use a Mongoose `pre('save')` hook for hashing.

**Rationale**: The existing `User.js` model has a `pre('save')` hook that increments `tokenVersion` on password change but does not hash. Adding hashing to the controller keeps the model clean and avoids double-hashing bugs. The controller explicitly calls `bcrypt.hash()` before `user.save()`.

**Alternatives considered**:
- **Mongoose `pre('save')` hook for hashing**: Common pattern but fragile — requires `isModified('password')` guard and can cause confusion when setting hashed passwords directly. Rejected for clarity.

---

## R-006: Email Service Integration

**Decision**: Use the existing email service infrastructure at `backend/services/email/` with the project's constitutional email providers (Mailtrap primary, Resend secondary).

**Rationale**: Constitution §I.7 declares email services as first-class infrastructure. The service directory already exists. Verification and password reset emails use the same transactional email pattern — only the template content and token URL differ.

**Alternatives considered**:
- **New email provider**: Would violate constitution §III.1 (no stack substitution). Rejected.

---

## R-007: Rate Limiting Strategy

**Decision**: Apply rate limiting per endpoint using the existing Redis-backed `express-rate-limit` middleware from `middleware/security/`. Define separate limiters for: login (5/15min/IP), register (3/hr/IP), forgot-password (3/hr/IP), refresh (30/min/IP).

**Rationale**: Rate limiting is IP-based per the spec assumptions. Redis backing ensures limits survive server restarts and are shared across instances. Separate limiters per endpoint allow different thresholds appropriate to each operation's risk profile.

**Alternatives considered**:
- **Single global rate limiter**: Too coarse — would block legitimate refresh calls because of login attempts. Rejected.
- **Account-based rate limiting**: Spec explicitly states "Rate limiting is IP-based, not account-based." Deferred.

---

## R-008: Frontend Logging Migration

**Decision**: Replace all `console.log`, `console.error`, and `console.warn` calls in auth-related frontend files with the frontend equivalent of structured logging. Since the constitution's `emitLogMessage()` is a backend utility, the frontend should use a lightweight logging utility that follows the same structured pattern (level, context, message) and can be silenced in production builds.

**Rationale**: Constitution §XI.1 forbids `console.log` in production code paths. The frontend `refresh-queue.js` has 14 console calls and `token-manager.js` has 1 — these all need migration.

**Alternatives considered**:
- **Leave console calls**: Violates constitution. Rejected.
- **Remove all logging**: Loses debugging information for auth issues. Rejected.
