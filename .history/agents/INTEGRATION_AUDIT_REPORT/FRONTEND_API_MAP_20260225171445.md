# 🔍 Discovery D1: Frontend API Map

> **Generated**: 2026-02-25
> **Methodology**: Traced every API call from UI → Redux thunk → domain service → API client → endpoint class → axios instance

---

## 1. API Client Architecture

### Call Chain
```
UI Component → Event Handler → Redux Thunk (auth-thunks.js)
  → Domain Service (auth-service.js)
    → API Client (publicClient / privateClient)
      → Endpoint URL (auth-endpoints.js)
        → Axios Instance (base-client.js)
```

### Client Configuration (base-client.js)

| Setting | Value | Source |
|---|---|---|
| **baseURL** | `http://localhost:3001/api/v1` | `api-config.js` L12–19 (default, no `.env.local` found) |
| **timeout** | `30000` | `api-config.js` L29 |
| **withCredentials** | `true` | `base-client.js` L16 |
| **Content-Type** | `application/json` | `api-config.js` L24 |
| **Accept** | `application/json` | `api-config.js` L25 |

### Base URL Construction (api-config.js L18-19)
```javascript
FULL_BASE_URL = `${BASE_URL}/api/v${API_VERSION}`
// Default: http://localhost:3001/api/v1
```

> ⚠️ **CRITICAL FINDING**: `api-config.js` defaults `BASE_URL` to `http://localhost:3001` but `next.config.mjs` defaults `NEXT_PUBLIC_API_URL` to `http://localhost:4000` in CSP and rewrites. **No `.env.local` file exists**, so the hardcoded default `http://localhost:3001` is the active value. This is almost certainly wrong — backend runs on port 4000.

### Next.js API Proxy (next.config.mjs L55-62)
```javascript
rewrites: [{ source: '/api/:path*', destination: '${apiUrl}/api/:path*' }]
// apiUrl defaults to http://localhost:4000
```
> This proxy exists but is **NOT USED** because the axios baseURL points directly to `http://localhost:3001`, not to the Next.js dev server at `http://localhost:3000`. For the proxy to work, baseURL should be set to `http://localhost:3000` (or empty/relative).

---

## 2. Implemented Auth API Calls

### 2.1 Login

| Property | Value |
|---|---|
| **Thunk** | `loginUser` |
| **Service Method** | `authService.login(credentials)` |
| **Client** | `publicClient.post()` |
| **Endpoint** | `authEndpoints.LOGIN` → `/auth/login` |
| **HTTP Method** | POST |
| **Request Body** | `credentials` (expected: `{ email, password }`) |
| **Expected Response** | `response.data` (expects `{ success, user, tokens }`) |
| **Token Handling** | Comment: "tokens are set via Set-Cookie header automatically" |
| **File** | `auth-thunks.js` L11–19 |

### 2.2 Register

| Property | Value |
|---|---|
| **Thunk** | `registerUser` |
| **Service Method** | `authService.register(userData)` |
| **Client** | `publicClient.post()` |
| **Endpoint** | `authEndpoints.REGISTER` → `/auth/register` |
| **HTTP Method** | POST |
| **Request Body** | `userData` (expected: `{ firstName, lastName, email, password }`) |
| **Expected Response** | `response.data` (expects `{ success, message, user }`) |
| **Token Handling** | Comment: "tokens are set via Set-Cookie header automatically" |
| **File** | `auth-thunks.js` L22–30 |

### 2.3 Logout

| Property | Value |
|---|---|
| **Thunk** | `logoutUser` |
| **Service Method** | `authService.logout()` |
| **Client** | `privateClient.get()` ⚠️ (uses authenticated client) |
| **Endpoint** | `authEndpoints.LOGOUT` → `/auth/logout` |
| **HTTP Method** | GET |
| **Request Body** | None |
| **Expected Response** | `response.data` (expects `{ success, message }`) |
| **Side Effects** | `refreshQueue.clearQueue()` + `tokenManager.clearSession(dispatch)` — clears Redux + cookies |
| **Fallback** | Even on API failure, local state is always cleared |
| **File** | `auth-thunks.js` L33–51 |

### 2.4 Verify Email

| Property | Value |
|---|---|
| **Thunk** | `verifyEmail` |
| **Service Method** | `authService.verifyEmail(verificationData)` |
| **Client** | `publicClient.post()` |
| **Endpoint** | `authEndpoints.VERIFY_EMAIL` → `/auth/verify-email` |
| **HTTP Method** | POST |
| **Request Body** | `verificationData` (expected: `{ token }`) |
| **Expected Response** | `response.data` (expects `{ success, message }`) |
| **Token Handling** | Comment: "tokens are set via Set-Cookie header automatically" |
| **File** | `auth-thunks.js` L55–63 |

### 2.5 Forgot Password

| Property | Value |
|---|---|
| **Thunk** | `forgotPassword` |
| **Service Method** | `authService.forgotPassword(email)` |
| **Client** | `publicClient.post()` |
| **Endpoint** | `authEndpoints.FORGOT_PASSWORD` → `/auth/forgot-password` |
| **HTTP Method** | POST |
| **Request Body** | `{ email }` (wrapped in service method) |
| **Expected Response** | `response.data` (expects `{ success, message }`) |
| **File** | `auth-thunks.js` L66–73 |

### 2.6 Reset Password

| Property | Value |
|---|---|
| **Thunk** | `resetPassword` |
| **Service Method** | `authService.resetPassword(resetData)` |
| **Client** | `publicClient.post()` |
| **Endpoint** | `authEndpoints.RESET_PASSWORD` → `/auth/reset-password` |
| **HTTP Method** | POST |
| **Request Body** | `resetData` (expected: `{ token, password }`) |
| **Expected Response** | `response.data` (expects `{ success, message }`) |
| **File** | `auth-thunks.js` L76–83 |

### 2.7 Token Refresh (Internal — triggered by interceptor)

| Property | Value |
|---|---|
| **Caller** | `refreshQueue.handleTokenRefresh()` → `authService.refreshToken()` |
| **Client** | `publicClient.post()` |
| **Endpoint** | `authEndpoints.REFRESH_TOKEN` → `/auth/refresh` |
| **HTTP Method** | POST |
| **Request Body** | `{}` (empty object) |
| **Expected Response** | Expects backend to set new cookies via `Set-Cookie` header |
| **Trigger** | 401 response on any `privateClient` request → `handleAuthError()` |
| **Queue** | Concurrent 401s are queued; only one refresh at a time |
| **Max Retries** | 3 |
| **File** | `refresh-queue.js` L98–143, `auth-service.js` L46–53 |

### 2.8 Health Check

| Property | Value |
|---|---|
| **Method** | `publicClient.healthCheck()` |
| **Client** | `publicClient.get()` |
| **Endpoint** | `/health` (hardcoded in public-client.js L28) |
| **HTTP Method** | GET |
| **Expected Response** | `{ status: 'healthy', services: {...} }` |
| **File** | `public-client.js` L27–29 |

> ⚠️ **FINDING**: Health endpoint is `/health` but backend registers at `/api/v1/health`. Since baseURL already includes `/api/v1`, the actual request goes to `/api/v1/health` which is correct.

---

## 3. Token & Session Management

### Cookie Names (storage-constants.js)
| Key | Cookie Name | Purpose |
|---|---|---|
| `STORAGE_KEYS.ACCESS_TOKEN` | `access_token` | Session indicator, read by middleware + tokenManager |
| `STORAGE_KEYS.REFRESH_TOKEN` | `refresh_token` | Reference only — described as httpOnly (not readable by JS) |
| `STORAGE_KEYS.TOKEN_EXPIRY` | `token_expiry` | Cleared on logout |
| `STORAGE_KEYS.USER_DATA` | `user_data` | Cleared on logout |

### Cookie Configuration (storage-constants.js)
| Setting | Value |
|---|---|
| `PATH` | `/` |
| `SECURE` | `true` in production, `false` in development |
| `SAME_SITE` | `strict` |

### Session Detection
- `tokenManager.hasValidSession()` → checks `cookieService.get("access_token")` exists
- `middleware.js` checks `cookies.has("access_token") || cookies.has("user_data")`

> ⚠️ **FINDING**: Frontend expects a cookie named `access_token` to be readable by JavaScript (not HttpOnly) for session detection. The `refresh_token` cookie is expected to be HttpOnly.

---

## 4. Error Handling

### normalizeError (error-utils.js L7–18)
Extracts from error:
```javascript
{
  message: error?.response?.data?.message || error?.message || defaultMessage,
  code: error?.code,
  status: error?.response?.status,
  details: error?.response?.data?.details,
  isNormalized: true,
  isCancelled: error?.name === "CanceledError",
  originalError: error
}
```

**Frontend expects from backend error responses:**
- `response.data.message` → string (primary error message)
- `response.data.details` → object (optional, validation details)
- `response.status` → HTTP status code

### BaseClient.normalizeError (base-client.js L97–116)
Creates a different normalized shape:
```javascript
{
  message: this.getErrorMessage(error),  // uses status-based lookup
  status: error.response?.status,
  code: error.code,
  data: error.response?.data,
  originalError: error,
  isNetworkError: !error.response,
  isTimeout: error.code === "ECONNABORTED"
}
```

> ⚠️ **FINDING**: Two different error normalization paths exist. `BaseClient.normalizeError()` runs in interceptors, then `normalizeError()` from `error-utils.js` runs in the service layer. The final error shape reaching thunks depends on which normalizer wins.

---

## 5. Route Protection (middleware.js)

| Route Type | Routes | Behavior |
|---|---|---|
| **Public Auth** | `/login`, `/signup`, `/verify-email`, `/forgot-password`, `/reset-password` | Authenticated users → redirect to `/dashboard` |
| **Protected** | `/dashboard/*`, `/app/*` | Unauthenticated users → redirect to `/login?returnUrl=...` |
| **Root** | `/` | Authenticated → `/dashboard`, Unauthenticated → `/login` |

### Auth Check
```javascript
const isAuthenticated = cookies.has("access_token") || cookies.has("user_data");
```

---

## 6. Observations & Potential Issues

1. **🔴 BASE_URL Mismatch**: `api-config.js` defaults to `http://localhost:3001` but backend is on port `4000`. No `.env.local` file exists to override this.

2. **🟠 Proxy Not Utilized**: `next.config.mjs` configures API rewrites to proxy `/api/*` to `http://localhost:4000`, but axios baseURL bypasses the proxy by pointing directly to a different origin.

3. **🟠 Health Check Path**: `publicClient.healthCheck()` calls `/health` which with baseURL becomes `/api/v1/health` — matches backend. OK.

4. **🟡 Refresh Token Body**: Frontend sends empty `{}` to `/auth/refresh`. It relies entirely on cookies for refresh token delivery. Backend must read refresh token from cookie, not body.

5. **🟡 Access Token Cookie**: Frontend REQUIRES a non-HttpOnly `access_token` cookie for session detection in both middleware (edge) and `tokenManager.hasValidSession()`. If backend sets this as HttpOnly, session detection breaks.

6. **🟡 Dual Error Normalization**: `BaseClient` normalizes in interceptors, then `auth-service` normalizes again via `error-utils.js`. Potentially double-wrapping errors.

7. **🟢 Endpoint Prefix**: `AuthEndpoints.PREFIX` is `/auth` (no leading `/api/v1`). Since baseURL includes `/api/v1`, final URLs are correctly `/api/v1/auth/login`, etc.

---

**Discovery D1 complete. Proceeding to D2.**
