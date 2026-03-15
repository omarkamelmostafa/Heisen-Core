# Tasks: Authentication and Session Management Starter Kit

**Input**: Design documents from `specs/001-auth-session-starter/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: New model, environment configuration, rate limiting setup

- [X] T001 Create `RefreshToken` model in `backend/model/RefreshToken.js` per `data-model.md` — fields: `token` (hashed, unique), `user` (ObjectId ref), `isRevoked` (Boolean), `replacedBy` (ObjectId ref), `expiresAt` (Date, TTL index), `issuedAt`, `userAgent`, `ipAddress`, `tokenVersion`. Add indexes: `{ token: 1 }` unique sparse, `{ user: 1, isRevoked: 1 }` compound, `{ expiresAt: 1 }` TTL (expireAfterSeconds: 0)
- [X] T002 Modify `backend/model/User.js` — remove `refreshToken`, `loginAttempts`, `isLocked`, `lockUntil` fields. Remove `incrementLoginAttempts()`, `resetLoginAttempts()`, `isAccountLocked()` methods. Remove auto-unlock pre-save hook. Update `findByEmailWithSecurity()` to remove `+refreshToken +loginAttempts +isLocked +lockUntil` from select. Keep `tokenVersion`, `verificationToken`, `resetPasswordToken`, `isVerified`, `uuid`, all other fields
- [X] T003 [P] Update `backend/services/auth/cookie-service.js` — change `AUTH_COOKIE_DEFAULTS.path` from `"/"` to `"/api/v1/auth/refresh"`, change `maxAge` from `24 * 60 * 60 * 1000` to `7 * 24 * 60 * 60 * 1000` (7 days), add `domain` option reading from `process.env.COOKIE_DOMAIN`. Update `clearCookie()` to also use `path: "/api/v1/auth/refresh"`
- [X] T004 [P] Add `.env` / `.env.example` entries: `REFRESH_TOKEN_EXPIRY=7d`, `COOKIE_DOMAIN=`, `RATE_LIMIT_LOGIN_MAX=5`, `RATE_LIMIT_LOGIN_WINDOW_MS=900000`, `RATE_LIMIT_REGISTER_MAX=3`, `RATE_LIMIT_REGISTER_WINDOW_MS=3600000`, `RATE_LIMIT_FORGOT_MAX=3`, `RATE_LIMIT_FORGOT_WINDOW_MS=3600000`, `RATE_LIMIT_REFRESH_MAX=30`, `RATE_LIMIT_REFRESH_WINDOW_MS=60000`
- [X] T005 [P] Create rate limiters in `backend/middleware/security/rate-limiters.js` — export four Redis-backed `express-rate-limit` instances: `loginLimiter` (5/15min), `registerLimiter` (3/hr), `forgotPasswordLimiter` (3/hr), `refreshLimiter` (30/min). Use `ioredis` store, read thresholds from env vars (T004). Return standardized 429 error using centralized error handler

**Checkpoint**: RefreshToken model created, User model cleaned, cookie path restricted, rate limiters ready

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Rewrite token service to use the new RefreshToken model. This MUST complete before any user story implementation.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T006 Rewrite `backend/services/auth/token-service.js` `generateTokens()` — create a `RefreshToken` document in the database (hashed via `crypto.createHash('sha256')`) instead of returning a raw JWT. Accept `user`, `userAgent`, `ipAddress` params. Return `{ accessToken, refreshTokenValue, accessTokenExpiresIn }` where `refreshTokenValue` is the unhashed value (set in cookie). The hashed version is stored in the RefreshToken document
- [X] T007 Rewrite `backend/services/auth/token-service.js` `refreshAccessToken()` — lookup `RefreshToken` by hashed token value, check `isRevoked`, check `tokenVersion` matches user's current `tokenVersion`. If token is revoked AND has `replacedBy` (reuse detected): revoke ALL tokens for user (`RefreshToken.updateMany({ user }, { isRevoked: true })`), throw "Token reuse detected". If valid: create new RefreshToken, set old token `isRevoked: true` + `replacedBy: newToken._id`, return new tokens
- [X] T008 [P] Update `backend/validators/validationRules.js` — add/update `registerValidationRules` to enforce: email format, password min 8 / max 128 chars, at least 1 uppercase, 1 lowercase, 1 digit, 1 special character. Add `express-validator` rules with descriptive error messages per FR-002
- [X] T009 Apply rate limiters from T005 to `backend/routes/auth/auth-routes.js` — import all four limiters, apply `loginLimiter` to `/login`, `registerLimiter` to `/register`, `forgotPasswordLimiter` to `/forgot-password`, `refreshLimiter` to `/refresh`. Add `POST /logout-all` route with auth middleware per contract `auth-api.md`

**Checkpoint**: Token service rewritten for multi-device rotation. Rate limiting active on all endpoints. Foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 — Core Registration and Email Verification (Priority: P1) 🎯 MVP

**Goal**: A new user can register, receive a verification email, click the link, and become verified.

**Independent Test**: Register → receive email → click link → confirm verified status. No other features needed.

- [X] T010 [US1] Rewrite `backend/controllers/auth/register.controller.js` — hash password with `bcrypt.hash(password, 12)` before save, generate verification token via `crypto.randomBytes(32).toString('hex')`, set `verificationToken` (hashed) and `verificationTokenExpiresAt` (24 hours) on user, call email service to send verification email with unhashed token in URL, return 201 per `contracts/auth-api.md` POST /register. Use `emitLogMessage()` not `console.log`
- [X] T011 [US1] Rewrite `backend/controllers/auth/verify-email.controller.js` — hash incoming token, find user by hashed `verificationToken`, check `verificationTokenExpiresAt` not expired, check token not already used (`isVerified === false`). If expired: return 410 with "resend" guidance. If already consumed: return 409. On success: set `isVerified: true`, clear `verificationToken` and `verificationTokenExpiresAt`, return 200 per contract
- [X] T012 [P] [US1] Create or update verification email template in `backend/services/email/` — template must include the verification URL with token as query parameter, styled per existing email templates. Subject: "Verify your email address". Ensure `emitLogMessage()` for send success/failure
- [X] T013 [US1] Add "resend verification email" logic — if user exists and `isVerified === false`, generate new token, update user, send email. Add POST `/resend-verification` to `auth-routes.js` with `registerLimiter` rate limit per FR-008

**Checkpoint**: Registration → verification email → email click → user verified. User Story 1 fully functional and testable independently.

---

## Phase 4: User Story 2 — Login and Authenticated Session (Priority: P1)

**Goal**: A verified user can log in, receive an access token in the response body and a refresh token as an HttpOnly cookie, and access protected resources.

**Independent Test**: Seed a verified user, log in, confirm access token in body + refresh cookie set + protected API accessible.

- [X] T014 [US2] Rewrite `backend/controllers/auth/login.controller.js` — find user by email (case-insensitive, `lowercase: true` already on model), verify `isVerified` (if false: return 403 per contract), compare password via `bcrypt.compare()`, call `generateTokens(user, req.headers['user-agent'], req.ip)` from T006, set refresh token cookie via `cookie-service.setCookie()` (path `/api/v1/auth/refresh`, maxAge 7d, domain from env), return `{ accessToken, user }` in body per contract. Use generic "Invalid credentials" for wrong password or non-existent email (FR-028). Use `emitLogMessage()` for auth events
- [X] T015 [US2] Verify `backend/middleware/auth/authTokenMiddleware.js` — confirm it extracts access token from `Authorization: Bearer <token>` header, verifies with `ACCESS_TOKEN_SECRET`, checks JTI blacklist via `isTokenRevoked()`, attaches decoded user info to `req.user`. Update if needed to NOT rely on cookie-based access tokens. Ensure `emitLogMessage()` replaces any `console.log`
- [X] T016 [P] [US2] Update frontend `src/store/slices/auth/auth-slice.js` — ensure `accessToken` is stored in Redux state only (NOT persisted to cookies or localStorage). Add `setAccessToken` action. Ensure `logout` action clears `accessToken`, `user`, and sets `isAuthenticated: false`. Verify no `redux-persist` configuration touches auth state

**Checkpoint**: Login works end-to-end. Access token in Redux memory, refresh token in HttpOnly cookie with path restriction. Protected API calls succeed. User Story 2 fully functional.

---

## Phase 5: User Story 3 — Silent Token Refresh and Session Continuity (Priority: P1)

**Goal**: When access token expires, the interceptor silently refreshes, retries the failed request, and the user sees no interruption. Page refresh and new tab restore authenticated state via bootstrap.

**Independent Test**: Set access token expiry to 10 seconds, make API calls, observe transparent refresh and retry.

- [X] T017 [US3] Rewrite `backend/controllers/auth/refresh.controller.js` — extract refresh token from `req.cookies.refresh_token`, call `refreshAccessToken()` from T007 (which handles rotation + reuse detection), set new refresh token cookie via `setCookie()`, return `{ accessToken }` in body per contract. On reuse detection: revoke ALL tokens for user, clear cookie, return 401. Use `emitLogMessage()` for refresh events (success, failure, reuse detected)
- [X] T018 [US3] Update frontend `src/services/api/refresh-queue.js` — replace ALL `console.log`, `console.error`, `console.warn` calls with a frontend structured logging utility (or silent no-ops in production). Verify the queue-then-retry flow: on 401, queue pending requests, call `/api/v1/auth/refresh` (cookie sent automatically due to `withCredentials: true`), update Redux auth state with new `accessToken` via `store.dispatch(setAccessToken(newToken))`, retry all queued requests. Verify `__isRetry` flag prevents infinite loops
- [X] T019 [US3] Update frontend `src/services/auth/token-manager.js` — replace `console.error` with structured logging. Update `hasValidSession()` to check Redux state for `accessToken` instead of checking cookie. Verify `clearSession()` dispatches `logout()` and does NOT attempt to clear cookies (refresh token cookie is HttpOnly, only backend can clear it)
- [X] T020 [US3] Implement bootstrap flow in frontend app initialization (e.g., `src/app/layout.jsx` or `src/providers/auth-provider.jsx`) — on app mount, call `POST /api/v1/auth/refresh` (browser sends cookie automatically). If successful: dispatch `setAccessToken(response.data.accessToken)` + `setUser(response.data.user)` to Redux. If fails (401): user is not authenticated, set Redux state accordingly. This replaces any existing localStorage/sessionStorage bootstrap

**Checkpoint**: Silent refresh works transparently. Page refresh restores session. No user-visible interruption. User Story 3 fully functional.

---

## Phase 6: User Story 4 — Logout and Session Termination (Priority: P2)

**Goal**: User can log out (single device) or log out of all devices. Server invalidates refresh tokens and clears cookies.

**Independent Test**: Log in on two simulated sessions, log out on one, verify the other still works. Then "logout all" and verify both fail.

- [X] T021 [US4] Rewrite `backend/controllers/auth/logout.controller.js` — extract refresh token from cookie, find `RefreshToken` document by hashed value, set `isRevoked: true`, clear cookie via `clearCookie()`, return 200 per contract. If no cookie present: return 204 (idempotent). Revoke the access token's JTI via `revokeByJti()` in Redis. Use `emitLogMessage()`
- [X] T022 [US4] Create `backend/controllers/auth/logout-all.controller.js` — require authenticated user (access token in header, verified by auth middleware). Increment `user.tokenVersion`, call `RefreshToken.updateMany({ user: user._id, isRevoked: false }, { isRevoked: true })` to revoke all sessions. Clear current device cookie. Return 200 per contract. Use `emitLogMessage()`
- [X] T023 [P] [US4] Update frontend logout flow — on logout button click: call `GET /api/v1/auth/logout`, then dispatch `logout()` to clear Redux state. On "logout all devices": call `POST /api/v1/auth/logout-all` (requires access token in header), then dispatch `logout()`

**Checkpoint**: Single-device and all-device logout both work. Cookie cleared, tokens revoked. User Story 4 fully functional.

---

## Phase 7: User Story 5 — Forgot Password and Password Reset (Priority: P2)

**Goal**: User can request a password reset email and reset their password via the emailed link. All sessions are invalidated after reset.

**Independent Test**: Request reset email, click link, set new password, verify old sessions are invalidated.

- [X] T024 [US5] Rewrite `backend/controllers/auth/password-reset.controller.js` `handleForgotPassword` — find user by email. Whether found or not, return same 200 response (FR-020, no account enumeration). If found: generate token via `crypto.randomBytes(32)`, hash and store on user as `resetPasswordToken` + `resetPasswordExpiresAt` (1 hour), send email. Use `emitLogMessage()`
- [X] T025 [US5] Rewrite `backend/controllers/auth/password-reset.controller.js` `handleResetPassword` — hash incoming token, find user by hashed `resetPasswordToken`, check `resetPasswordExpiresAt` not expired, check not already used. Validate new password meets strength rules. Hash new password with `bcrypt.hash(password, 12)`, update user, clear reset token fields, increment `tokenVersion`, revoke ALL `RefreshToken` documents for user (FR-022). Return 200 per contract. Use `emitLogMessage()`
- [X] T026 [P] [US5] Create or update password reset email template in `backend/services/email/` — template must include reset URL with token as query parameter. Subject: "Reset your password". Include expiry notice (1 hour). Use `emitLogMessage()`

**Checkpoint**: Forgot password → email → reset → new password works. All sessions invalidated. User Story 5 fully functional.

---

## Phase 8: User Story 6 — Route Protection and Access Control (Priority: P2)

**Goal**: Route arrays enforce access control automatically. Adding a path to the correct array is the only step needed.

**Independent Test**: Add a test route to PROTECTED_ROUTES, verify unauthenticated access redirects to login.

- [X] T027 [US6] Review and verify `frontend/src/lib/config/route-config.js` — confirm `AUTH_ROUTES`, `PROTECTED_ROUTES`, `PUBLIC_ROUTES` arrays match the contract in `contracts/route-config.md`. Verify helper functions `isAuthRoute()`, `isProtectedRoute()`, `isPublicRoute()` use prefix matching. No structural changes expected — validate existing implementation satisfies FR-023 through FR-026
- [X] T028 [US6] Review and update `frontend/src/middleware.js` — verify the silent refresh flow in Next.js middleware works with the new cookie path (`/api/v1/auth/refresh`). Ensure the middleware reads the refresh token cookie correctly. Verify protected route → login redirect includes `returnUrl` query param. Verify auth route → dashboard redirect for authenticated users. Replace `console.error` with structured logging. Confirm the middleware matcher excludes static assets

**Checkpoint**: Route protection works end-to-end. Adding a new path to PROTECTED_ROUTES auto-enforces the guard. User Story 6 verified.

---

## Phase 9: User Story 7 — Multi-Device Session Management (Priority: P3)

**Goal**: Multiple devices can be logged in simultaneously with independent sessions. Token reuse (theft) detection invalidates all sessions.

**Independent Test**: Login from two different user-agents, log out on one, verify the other still works. Replay a rotated token and verify all sessions are killed.

- [X] T029 [US7] Verify multi-device support end-to-end — the `RefreshToken` model (T001), `generateTokens()` (T006), and `refreshAccessToken()` (T007) already create per-device tokens. Verify that two logins from different user-agents produce two independent `RefreshToken` documents. Verify logout on device A does not affect device B's session. Verify "logout all" (T022) revokes both
- [X] T030 [US7] Verify reuse detection end-to-end — simulate token rotation (use refresh endpoint with valid token → old token gets `isRevoked: true, replacedBy: newId`). Then replay the old token. Verify `refreshAccessToken()` detects the reuse, revokes ALL tokens for the user, and returns 401. Confirm all devices are forced to re-authenticate

**Checkpoint**: Multi-device sessions and theft detection both work. User Story 7 verified.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T031 [P] Audit ALL backend auth files for `console.log`, `console.error`, `console.warn` — replace with `emitLogMessage()` from `backend/utilities/general/emit-log.js`. Files to check: `token-service.js`, `cookie-service.js`, all controllers in `controllers/auth/`, `auth-routes.js`, `middleware/auth/`
- [X] T032 [P] Audit ALL frontend auth files for `console.log`, `console.error`, `console.warn` — replace with a structured logging utility or remove. Files to check: `refresh-queue.js`, `token-manager.js`, `middleware.js`, `auth-slice.js`
- [X] T033 [P] Audit all auth controllers for raw `res.status().json()` error responses — ensure they use the centralized error handler (`next(error)` with custom error classes from `backend/errors/`). Verify consistency with `contracts/auth-api.md` response shapes
- [X] T034 [P] Verify CORS configuration in `backend/config/` — confirm `Access-Control-Allow-Origin` is set to explicit origin (not `*`), `Access-Control-Allow-Credentials: true` is set. Verify `withCredentials: true` on frontend Axios instances. Confirm `COOKIE_DOMAIN` env var is used in cookie options
- [X] T035 Validate all integration scenarios in `quickstart.md` — walk through each of the 6 scenarios manually, confirm the end-to-end flow works as documented. Document any deviations

**Checkpoint**: All constitution violations resolved. Logging standardized. Error handling centralized. CORS verified. Quickstart validated.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on T001, T002 from Phase 1 — BLOCKS all user stories
- **Phases 3–5 (P1 stories)**: All depend on Phase 2 completion. US1, US2, US3 are strongly coupled (registration → login → refresh) — execute sequentially
- **Phases 6–7 (P2 stories)**: Depend on Phase 2. US4 (logout) and US5 (password reset) can run in parallel with each other. US6 (route protection) can start after US2 (needs login)
- **Phase 9 (P3 story)**: US7 is a verification phase — depends on all prior token logic being complete
- **Phase 10 (Polish)**: Depends on all user story phases being complete

### User Story Dependencies

```
Phase 1 (Setup) ─┬─ T001, T002 (sequential — model changes)
                  └─ T003, T004, T005 (parallel — independent files)
                       │
                       ▼
Phase 2 (Foundation) ── T006 → T007 (sequential — token service rewrite)
                        T008, T009 (parallel with T006/T007)
                       │
                       ▼
Phase 3 (US1: Register+Verify) ── T010 → T011 → T013 (sequential)
                                   T012 (parallel with T010)
                       │
                       ▼
Phase 4 (US2: Login+Session) ── T014 → T015 (sequential)
                                T016 (parallel with T014)
                       │
                       ▼
Phase 5 (US3: Silent Refresh) ── T017 → T018 → T019 → T020 (mostly sequential)
                       │
                       ▼
        ┌──────────────┼──────────────┐
        ▼              ▼              ▼
Phase 6 (US4)    Phase 7 (US5)  Phase 8 (US6)
  Logout           Password        Route
  T021→T022→T023   T024→T025       T027→T028
                   T026 (parallel)
        └──────────────┼──────────────┘
                       ▼
Phase 9 (US7: Multi-Device) ── T029 → T030 (verification only)
                       │
                       ▼
Phase 10 (Polish) ── T031, T032, T033, T034 (all parallel)
                     T035 (after all above)
```

### Parallel Opportunities

**Phase 1**: T003, T004, T005 can all run in parallel (different files)
**Phase 2**: T008, T009 can run in parallel with each other and with T006/T007
**Phase 4**: T016 (frontend) can run in parallel with T014 (backend)
**Phase 6+7**: Phases 6, 7, 8 can run in parallel with each other
**Phase 10**: T031, T032, T033, T034 all touch different files — fully parallel

---

## Implementation Strategy

### MVP First (User Stories 1–3)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundation (T006–T009)
3. Complete Phase 3: Registration + Verification (T010–T013)
4. Complete Phase 4: Login + Authenticated Session (T014–T016)
5. Complete Phase 5: Silent Refresh + Bootstrap (T017–T020)
6. **STOP and VALIDATE**: The core auth loop (register → verify → login → use API → refresh → page reload) is now fully functional

### Incremental Delivery

1. Setup + Foundation → Token model and service ready
2. US1 (Register+Verify) → Users can create accounts (**first testable increment**)
3. US2 (Login+Session) → Users can log in (**second testable increment**)
4. US3 (Silent Refresh) → Sessions survive token expiry and page refresh (**MVP complete**)
5. US4 (Logout) + US5 (Password Reset) → Session control + recovery (**full auth**)
6. US6 (Route Protection) → Frontend guards enforced (**frontend complete**)
7. US7 (Multi-Device) → Verification of advanced token scenarios (**polish**)
8. Phase 10 → Logging, error handling, CORS audit (**production ready**)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No test files generated — no automated test framework per constitution §III.6
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Total tasks: 35 (T001–T035)
