# 🎯 Integration Task List

> **Generated**: 2026-02-25 | **Discovery Phase Complete**
> **Derived From**: D1–D7 audit reports in `agents/INTEGRATION_AUDIT_REPORT/`

---

## Priority Legend

| Level | Meaning | Criteria |
|---|---|---|
| 🔴 **CRITICAL** | Integration completely fails without this fix | Auth flows broken, app unusable |
| 🟠 **HIGH** | Major functionality broken or security risk | Features partially work but unreliable |
| 🟡 **MEDIUM** | Integration works but with known issues | Edge cases, inconsistencies, hardening |
| 🟢 **LOW** | Polish and best practices | Cleanup, logging, DX improvements |

---

## 🔴 CRITICAL — Must Fix for Integration to Work

### INT-C1: Create `frontend/.env.local` with correct API URL
- **Source**: D4 (ENV_ALIGNMENT_REPORT)
- **Problem**: `api-config.js` defaults `BASE_URL` to `http://localhost:3001`. Backend runs on port `4000`. No `.env.local` exists to override this. **Every API call will `ECONNREFUSED`.**
- **Fix**: Create `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:4000`
- **Side**: Frontend
- **Files**: `frontend/.env.local` [NEW]
- **Risk**: None
- **Validation**: Start frontend, attempt login, verify network request goes to `:4000`

---

### INT-C2: Fix token refresh HTTP method mismatch (GET vs POST)
- **Source**: D3 (CONTRACT_ALIGNMENT_REPORT)
- **Problem**: Frontend sends `POST /auth/refresh` but backend route is `GET /auth/refresh`. Results in `405 Method Not Allowed`.
- **Fix**: Change backend route to `POST` (semantically correct — causes state change via token rotation)
- **Side**: Backend
- **Files**: `backend/routes/auth/auth-routes.js` L31
- **Change**: `.get(handleRefreshToken)` → `.post(handleRefreshToken)`
- **Risk**: Low — no other consumers of this endpoint
- **Validation**: Trigger token refresh, verify 200 response instead of 405

---

### INT-C3: Backend must set `access_token` as non-HttpOnly cookie
- **Source**: D6 (COOKIE_FLOW_REPORT)
- **Problem**: Backend sends `accessToken` in JSON response body only. Frontend requires a cookie named `access_token` for session detection in both `middleware.js` (edge runtime) and `tokenManager.hasValidSession()`. Without this cookie, all users appear unauthenticated.
- **Fix**: In login + refresh controllers, set `access_token` as a non-httpOnly cookie
- **Side**: Backend
- **Files**: 
  - `backend/controllers/auth/login.controller.js`
  - `backend/controllers/auth/refresh.controller.js`
- **Change**: Add `setCookie(res, "access_token", accessToken, { httpOnly: false, ... })`
- **Risk**: Medium — access_token in non-httpOnly cookie is XSS-accessible, but required for edge middleware detection
- **Validation**: Login, check browser DevTools → Application → Cookies, verify `access_token` cookie exists

---

### INT-C4: Align cookie names between frontend and backend
- **Source**: D4 (ENV_ALIGNMENT_REPORT), D6 (COOKIE_FLOW_REPORT)
- **Problem**: Frontend uses `access_token`/`refresh_token` (snake_case). Backend .env uses `accessToken`/`refreshToken` (camelCase). Cookie names **must** match exactly.
- **Fix**: Update backend `.env` cookie names to `access_token` and `refresh_token`, OR update frontend `STORAGE_KEYS` to match backend. **Recommend aligning to snake_case** (`access_token`/`refresh_token`) since frontend middleware already hardcodes `access_token`.
- **Side**: Backend
- **Files**: `backend/.env` L30-31
- **Change**: `ACCESS_TOKEN_COOKIE_NAME="access_token"`, `REFRESH_TOKEN_COOKIE_NAME="refresh_token"`
- **Risk**: Low
- **Validation**: Login, verify cookie names in DevTools match frontend expectations

---

### INT-C5: Fix refresh cookie `path` scoping bug
- **Source**: D6 (COOKIE_FLOW_REPORT)
- **Problem**: After successful refresh, the new `refreshToken` cookie is set with `path: "/api/auth/refresh"`. But the actual route is `/api/v1/auth/refresh` (with `v1`). The cookie is NEVER delivered to subsequent refresh requests. Second refresh always fails.
- **Fix**: Change cookie path to `"/"` to match login cookie behavior
- **Side**: Backend
- **Files**: `backend/controllers/auth/refresh.controller.js` L30
- **Change**: `path: "/api/auth/refresh"` → `path: "/"`
- **Risk**: None
- **Validation**: Login → wait for access token expiry → trigger first refresh → trigger second refresh → verify cookie delivered

---

### INT-C6: Fix `secure: true` on cookies in development
- **Source**: D6 (COOKIE_FLOW_REPORT)
- **Problem**: `AUTH_COOKIE_DEFAULTS` has `secure: true` unconditionally. On `http://localhost`, browsers reject Secure cookies. Login will appear to succeed but refresh token cookie won't persist.
- **Fix**: Make `secure` flag environment-dependent
- **Side**: Backend
- **Files**: `backend/services/auth/cookie-service.js` L9
- **Change**: `secure: true` → `secure: process.env.NODE_ENV === "production"`
- **Risk**: None
- **Validation**: Login on localhost, verify cookie appears in DevTools

---

## 🟠 HIGH — Required for Full Functionality

### INT-H1: Fix reset-password route token delivery
- **Source**: D3 (CONTRACT_ALIGNMENT_REPORT)
- **Problem**: Backend controller reads `req.params.token` but route has no `:token` param. Validator uses `param("token")`. Frontend sends token in body. Multiple simultaneous failures.
- **Fix Option A**: Backend changes route to `/reset-password/:token` and keeps `req.params.token`
- **Fix Option B**: Backend changes controller to read `req.body.token` and validator to `body("token")`
- **Recommendation**: Option A (URL params are standard for reset tokens because email links use URL paths)
- **Side**: Backend (route + validator alignment) + Frontend (send token as URL path segment)
- **Files**: 
  - `backend/routes/auth/auth-routes.js` L50: add `/:token` to route
  - `frontend/src/services/domain/auth-service.js` L68-79: build URL with token
  - `frontend/src/services/api/endpoints/auth-endpoints.js`: add parameterized getter
- **Risk**: Medium — reset-password flow is user-facing
- **Validation**: Trigger forgot-password → click email link → submit new password → verify success

---

### INT-H2: Verify register request body field names
- **Source**: D3 (CONTRACT_ALIGNMENT_REPORT)
- **Problem**: Backend expects `{ firstname, lastname, confirmPassword }` (lowercase, with confirm). Frontend's `registerUser` thunk passes opaque `userData`. Need to verify frontend signup form sends matching field names.
- **Fix**: Audit frontend signup form, ensure field names match backend validators exactly
- **Side**: Frontend (verify) and/or Backend (adjust)
- **Files**: Frontend signup page/form component
- **Risk**: Medium — registration will fail silently with validation errors
- **Validation**: Attempt registration, verify no validation errors

---

### INT-H3: Verify email verification field name (`code` vs `token`)
- **Source**: D3 (CONTRACT_ALIGNMENT_REPORT)
- **Problem**: Backend expects `{ code }` field. Frontend passes `verificationData` opaquely. Must verify frontend sends `{ code }` not `{ token }` or other names.
- **Fix**: Audit frontend verify-email page, ensure it sends `{ code }`
- **Side**: Frontend (verify)
- **Files**: Frontend verify-email page/form component
- **Risk**: Medium — email verification will fail
- **Validation**: Register → receive verification email → submit code → verify success

---

### INT-H4: Decide API request routing strategy (proxy vs direct)
- **Source**: D1 (FRONTEND_API_MAP), D4 (ENV_ALIGNMENT_REPORT)
- **Problem**: Two paths exist: (a) Next.js rewrite proxy at `/api/:path*` (same-origin, no CORS needed) or (b) direct cross-origin to backend port 4000. Currently the proxy is NOT used because baseURL points directly to backend port.
- **Recommendation**: Use the proxy. Change `api-config.js` baseURL to empty string (relative) so requests go through Next.js server. This eliminates all CORS/cookie cross-origin issues.
- **Alternative**: Keep direct cross-origin and rely on CORS + credentials + `sameSite: Lax`.
- **Files**: `frontend/src/lib/config/api-config.js` L12-13, `frontend/.env.local`
- **Risk**: Low — proxy is already configured in next.config.mjs
- **Validation**: Start both servers, attempt login, verify requests route through `:3000` proxy

---

## 🟡 MEDIUM — Hardening & Consistency

### INT-M1: Fix double error normalization
- **Source**: D1 (FRONTEND_API_MAP)
- **Problem**: `BaseClient` normalizes errors in interceptors, then `auth-service.js` normalizes again via `normalizeError()`. This double-wraps errors, potentially losing the original `response.data.message`.
- **Side**: Frontend
- **Files**: `base-client.js` L93, `auth-service.js` L24
- **Recommendation**: Either remove `BaseClient.normalizeError()` and let raw Axios errors flow to service layer, OR remove `normalizeError()` from service layer.

### INT-M2: Align SameSite cookie policy
- **Source**: D6 (COOKIE_FLOW_REPORT)
- **Problem**: Login cookie: `sameSite: "Lax"`, Refresh cookie: `sameSite: "strict"`, Frontend config: `sameSite: "strict"`. Should be consistent.
- **Recommendation**: Use `"Lax"` everywhere (or `"strict"` if using proxy)
- **Files**: `backend/services/auth/cookie-service.js`, `backend/controllers/auth/refresh.controller.js`

### INT-M3: Add `user_data` cookie or remove middleware check
- **Source**: D1 (FRONTEND_API_MAP)
- **Problem**: `middleware.js` L24 checks `cookies.has("user_data")` as fallback auth indicator. Backend never sets a `user_data` cookie. Either add it or remove the check.
- **Files**: `frontend/src/middleware.js` L24

### INT-M4: Frontend LoginThunk should store user data from response
- **Source**: D2 (BACKEND_API_MAP), D3 (CONTRACT_ALIGNMENT_REPORT)
- **Problem**: Backend login returns `{ data: { accessToken, user } }`. Frontend thunks do `return response.data` but the auth-slice needs to extract and store user data properly. The thunk chain `authService.login()` → `normalizeResponse()` → thunk `return response.data` produces `{ data: { success, data: { accessToken, user }, ... }, status, headers }`. The nested `.data.data` path may not match slice expectations.
- **Files**: `frontend/src/store/slices/auth/auth-thunks.js`, `frontend/src/store/slices/auth/auth-slice.js`

---

## 🟢 LOW — Polish

### INT-L1: Remove duplicate CORS headers (credentialsMiddleware + cors package)
- **Source**: D5 in CONTRACT_ALIGNMENT_REPORT
- **Problem**: `credentialsMiddleware` and `cors(corsOptions)` both set CORS headers. Consolidate into one.
- **Files**: `backend/index.js` L72-73

### INT-L2: Clean up AuthEndpoints PLANNED section
- **Source**: D1 (FRONTEND_API_MAP)
- **Problem**: `auth-endpoints.js` has ~100 lines of PLANNED endpoints. These add confusion during integration.
- **Recommendation**: Either move to a separate file or clearly mark with runtime warnings.

### INT-L3: Add `.env.example` for frontend
- **Source**: D4 (ENV_ALIGNMENT_REPORT)
- **Problem**: No `.env.example` in frontend. Developers won't know which variables are needed.
- **Files**: `frontend/.env.example` [NEW]

---

## Execution Order

```
Phase 1 — CONNECTION (get requests flowing)
  INT-C1 → INT-C4 → INT-C6 → INT-H4

Phase 2 — AUTH COOKIES (get login working end-to-end)
  INT-C3 → INT-C5 → INT-C2

Phase 3 — FULL AUTH (all flows working)
  INT-H2 → INT-H3 → INT-H1

Phase 4 — HARDENING
  INT-M1 → INT-M2 → INT-M3 → INT-M4

Phase 5 — POLISH
  INT-L1 → INT-L2 → INT-L3
```

---

**Total: 6 Critical · 4 High · 4 Medium · 3 Low = 17 integration tasks**
