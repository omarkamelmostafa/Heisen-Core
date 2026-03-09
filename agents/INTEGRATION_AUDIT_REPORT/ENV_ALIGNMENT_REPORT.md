# 🔍 Discovery D4: Environment Variable Alignment Report

> **Generated**: 2026-02-25

---

## Frontend Environment Variables

**File**: No `.env.local` file exists. All values use hardcoded defaults in source code.

| Variable | Default Value | Used By | Status |
|---|---|---|---|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` (api-config.js) | BaseClient baseURL | 🔴 **WRONG PORT** |
| `NEXT_PUBLIC_API_VERSION` | `1` | BaseClient baseURL, AuthEndpoints | ✅ |
| `NEXT_PUBLIC_API_TIMEOUT` | `30000` | BaseClient timeout | ✅ |
| `NEXT_PUBLIC_API_RETRIES` | `3` | API_CONFIG.RETRY_ATTEMPTS | ✅ |
| `NEXT_PUBLIC_API_RETRY_DELAY` | `1000` | API_CONFIG.RETRY_DELAY | ✅ |
| `NODE_ENV` | `development` | Cookie secure flag, CSP, logging | ✅ |

### Missing Variable

| Variable | Default | Context |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Not set | `api-config.js` defaults to `http://localhost:3001`, but `next.config.mjs` defaults to `http://localhost:4000` in two separate places (CSP and rewrites) |

---

## Backend Environment Variables (.env)

| Variable | Value | Status |
|---|---|---|
| `PORT` | `4000` | ✅ |
| `API_URL` | `http://localhost:4000/api/v1/` | ✅ |
| `BASE_URL` | `http://localhost:4000/` | ✅ |
| `NODE_ENV` | `development` | ✅ |
| `ACCESS_TOKEN_SECRET` | Set (exposed in .env!) | ⚠️ Needs rotation |
| `REFRESH_TOKEN_SECRET` | Set (exposed in .env!) | ⚠️ Needs rotation |
| `ACCESS_TOKEN_EXPIRY` | `60m` | ✅ |
| `REFRESH_TOKEN_EXPIRY` | `1d` | ✅ |
| `REFRESH_TOKEN_COOKIE_MAX_AGE` | `86400000` (24h) | ✅ |
| `ACCESS_TOKEN_COOKIE_NAME` | `accessToken` | 🟠 Different from frontend |
| `REFRESH_TOKEN_COOKIE_NAME` | `refreshToken` | 🟠 Different from frontend |
| `REDIS_URL` | `redis://localhost:6379` | ✅ |
| `ALLOWED_ORIGINS` | includes `http://localhost:3000` | ✅ |

---

## Cross-Reference: Port & URL Alignment

| Component | Port | URL |
|---|---|---|
| **Frontend Dev Server** | `3000` | `http://localhost:3000` |
| **Backend Server** | `4000` | `http://localhost:4000` |
| **Frontend api-config.js default** | `3001` ❌ | `http://localhost:3001/api/v1` |
| **Frontend next.config.mjs default** | `4000` ✅ | `http://localhost:4000` |

> 🔴 **CRITICAL**: `api-config.js` L12-13 defaults `BASE_URL` to `http://localhost:3001`. Backend runs on port `4000`. **No `.env.local` exists to fix this.** Every API call will fail with `ECONNREFUSED`.

---

## Cross-Reference: Cookie Name Alignment

| Cookie | Frontend Name | Backend Name | Aligned? |
|---|---|---|---|
| Access Token | `access_token` (STORAGE_KEYS) | `accessToken` (.env) | 🔴 **NO** |
| Refresh Token | `refresh_token` (STORAGE_KEYS) | `refreshToken` (.env) | 🔴 **NO** |
| Token Expiry | `token_expiry` (STORAGE_KEYS) | Not set by backend | ⚠️ N/A |
| User Data | `user_data` (STORAGE_KEYS) | Not set by backend | ⚠️ N/A |

> 🔴 **BLOCKER**: Frontend middleware checks for `cookies.has("access_token")` but backend's cookie name from .env is `accessToken`. Even if backend set this cookie, the names don't match.

---

## Action Items

1. **Create `frontend/.env.local`** with `NEXT_PUBLIC_API_URL=http://localhost:4000`
2. **Align cookie names** — either update frontend to use `accessToken`/`refreshToken` or update backend to use `access_token`/`refresh_token`
3. **Rotate exposed secrets** in backend `.env`
