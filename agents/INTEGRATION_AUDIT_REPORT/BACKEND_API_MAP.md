# 🔍 Discovery D2: Backend API Map

> **Generated**: 2026-02-25
> **Methodology**: Traced every registered route → controller → use-case → cookie → response format

---

## 1. Server Architecture

### Middleware Stack (index.js, order matters)
```
1. createApiVersionMiddleware     → X-API-Version header
2. helmetMiddleware               → Security headers
3. createRateLimiterMiddleware    → Redis-backed rate limiting
4. credentialsMiddleware          → Access-Control-Allow-Credentials: true
5. cors(corsOptions)              → Origin validation
6. createSanitizeMiddleware       → Input sanitization
7. createRequestIdMiddleware      → X-Request-ID
8. createLoggingMiddleware        → Structured Pino logging
9. createUserActivityLogger       → Activity tracking
10. bodyParserMiddleware          → JSON/URL body parsing
11. cookieParser()                → Cookie parsing
12. contentTypeNegotiationMiddleware → Content type check
```

### Route Registration (index.js L101-102)
```javascript
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/health", healthRoutes);
```

### CORS Configuration
- **Origin check**: `allowedOrigins` list (from `.env.ALLOWED_ORIGINS`)
- **Allowed origins**: `http://localhost:3000`, `http://localhost:4000`, `http://localhost:5000`, `http://localhost:5173`
- **Credentials**: `credentialsMiddleware` sets `Access-Control-Allow-Credentials: true` ✅
- **Methods**: `GET, POST, PUT, DELETE, OPTIONS, PATCH`
- **Headers**: `Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key`

### Server Config (.env)
| Key | Value |
|---|---|
| `PORT` | `4000` |
| `API_URL` | `http://localhost:4000/api/v1/` |
| `BASE_URL` | `http://localhost:4000/` |
| `NODE_ENV` | `development` |
| `ACCESS_TOKEN_COOKIE_NAME` | `accessToken` |
| `REFRESH_TOKEN_COOKIE_NAME` | `refreshToken` |
| `ACCESS_TOKEN_EXPIRY` | `60m` |
| `REFRESH_TOKEN_EXPIRY` | `1d` |
| `REFRESH_TOKEN_COOKIE_MAX_AGE` | `86400000` (24h) |

---

## 2. Backend Response Shape (response-manager.js)

All routes use `apiResponseManager` which produces:
```json
{
  "success": true|false,
  "message": "Human-readable message",
  "timestamp": "ISO-8601",
  "requestId": "req_xxx|null",
  "data": { ... },           // optional, only on success
  "details": "string",       // optional, only on error (from errorDetails param)
  "errorCode": "ERROR_CODE"  // optional, only on error
}
```

### Error Handler Response (error-handler-middleware.js)
- `AppError` instances → `{ success: false, message, errorCode }`
- RateLimitError → adds `data: { retryAfter, reason }`
- Unexpected errors → `{ success: false, message: "An internal server error occurred.", errorCode: "INTERNAL_ERROR" }`

---

## 3. Cookie Defaults (backend cookie-service.js)

```javascript
AUTH_COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
  path: "/",
  maxAge: 86400000  // 24 hours
}
```

---

## 4. Registered Auth Routes

### 4.1 POST `/api/v1/auth/login`

| Property | Value |
|---|---|
| **Route** | `router.route("/login").post(...)` |
| **Validation** | `loginValidationRules` → `email` (required, valid email), `password` (required, 8-20 chars, complexity rules) |
| **Controller** | `handleLogin` |
| **Request Body** | `{ email, password }` |
| **Response (success)** | `{ success: true, message, data: { accessToken, user } }` |
| **Cookies Set** | `refreshToken` (httpOnly, secure, sameSite:Lax, path:/, maxAge:24h) |
| **Notes** | `refreshToken` removed from response body, only in cookie |

> ⚠️ **FINDING**: Backend returns `accessToken` in response `data` field, NOT as a cookie. Frontend expects tokens via Set-Cookie only (comment in thunks). **Frontend must extract `data.accessToken` from JSON body and store it as a cookie client-side.**

### 4.2 POST `/api/v1/auth/register`

| Property | Value |
|---|---|
| **Route** | `router.route("/register").post(...)` |
| **Validation** | `registerValidationRules` → `firstname`, `lastname`, `email`, `password`, `confirmPassword` |
| **Controller** | `handleRegister` |
| **Request Body** | `{ firstname, lastname, email, password, confirmPassword }` |
| **Response (success)** | `{ success: true, message, data: { ... } }` |
| **Cookies Set** | None (no setCookie call in register controller) |

> ⚠️ **FINDING**: Backend expects `firstname`/`lastname` (lowercase, no camelCase). Frontend must match. Also backend requires `confirmPassword` field.

### 4.3 GET `/api/v1/auth/logout`

| Property | Value |
|---|---|
| **Route** | `router.route("/logout").get(...)` |
| **Validation** | None |
| **Controller** | `handleLogout` |
| **Request Body** | None |
| **Query Params** | `?all=true` for logout from all devices |
| **Input Sources** | `req.cookies[REFRESH_TOKEN_COOKIE_NAME]`, `req.headers.authorization` (Bearer token) |
| **Response** | `{ success: true, message }` |
| **Cookies Cleared** | `refreshToken` cookie cleared immediately |

> ✅ Frontend uses `privateClient.get()` for logout — matches GET method.

### 4.4 GET `/api/v1/auth/refresh` ⚠️

| Property | Value |
|---|---|
| **Route** | `router.route("/refresh").get(...)` ⚠️ |
| **Validation** | None |
| **Controller** | `handleRefreshToken` |
| **Request Body** | Not used (reads from cookie) |
| **Input Source** | `req.cookies[REFRESH_TOKEN_COOKIE_NAME]` |
| **Response (success)** | `{ success: true, data: { accessToken, user } }` |
| **Cookies Set** | New `refreshToken` cookie with `path: "/api/auth/refresh"` ⚠️ |
| **Cookies Cleared** | On failure, `refreshToken` cookie cleared |

> 🔴 **CRITICAL FINDING 1**: Backend route is **GET**, but frontend sends **POST** (`publicClient.post(authEndpoints.REFRESH_TOKEN, {})`). This will result in a **405 Method Not Allowed**.

> 🔴 **CRITICAL FINDING 2**: Refresh cookie `path` is set to `"/api/auth/refresh"` — this is a **scoped cookie**. The refreshToken cookie will ONLY be sent on requests to `/api/auth/refresh`, NOT to any other route including `/api/v1/auth/refresh`. The `v1` prefix mismatch makes this cookie **NEVER delivered**.

### 4.5 POST `/api/v1/auth/verify-email`

| Property | Value |
|---|---|
| **Route** | `router.route("/verify-email").post(...)` |
| **Validation** | `emailVerificationValidationRules` → `code` (string, 4-100 chars, alphanumeric + `-_`) |
| **Controller** | `handleVerifyEmail` |
| **Request Body** | `{ code }` |
| **Response** | `{ success: true, message }` |

> ⚠️ **FINDING**: Backend expects field name `code`, frontend may send different field name. Frontend thunk passes `verificationData` — need to verify frontend form sends `{ code }`.

### 4.6 POST `/api/v1/auth/forgot-password`

| Property | Value |
|---|---|
| **Route** | `router.route("/forgot-password").post(...)` |
| **Validation** | `forgotPasswordValidationRules` → `email` (required, valid email, max 100 chars) |
| **Controller** | `handleForgotPassword` |
| **Request Body** | `{ email }` |
| **Response** | `{ success: true, message }` |

> ✅ Frontend wraps email correctly: `authEndpoints.FORGOT_PASSWORD, { email }`.

### 4.7 POST `/api/v1/auth/reset-password`

| Property | Value |
|---|---|
| **Route** | `router.route("/reset-password").post(...)` |
| **Validation** | `resetPasswordValidationRules` → `param("token")` (URL param), `body("password")` |
| **Controller** | `handleResetPassword` |
| **Request Params** | `req.params.token` (from URL path) |
| **Request Body** | `{ password }` |
| **Response** | `{ success: true, message }` |

> 🔴 **CRITICAL FINDING**: Backend expects token as a URL parameter: `/reset-password/:token`. But the route is registered as `/reset-password` with no `:token` param in the route definition. The `param("token")` validator will ALWAYS FAIL because the route doesn't capture a token param. Additionally, frontend sends token in the request body, not as a URL param.

### 4.8 GET `/api/v1/health`

| Property | Value |
|---|---|
| **Route** | `app.use("/api/v1/health", healthRoutes)` |
| **Response** | Health status JSON |

---

## 5. Validation Error Response Shape

When validation fails (`handleValidationErrors` middleware), the response format needs verification but likely uses `apiResponseManager` with validation error details.

---

## 6. Critical Findings Summary

| # | Severity | Issue | Impact |
|---|---|---|---|
| 1 | 🔴 BLOCKER | `/auth/refresh` is GET on backend, POST on frontend | 405 error on every token refresh attempt |
| 2 | 🔴 BLOCKER | Refresh cookie `path: "/api/auth/refresh"` mismatches actual route `/api/v1/auth/refresh` | Cookie never delivered |
| 3 | 🔴 BLOCKER | Reset-password route has no `:token` param but controller reads `req.params.token` | Token always undefined |
| 4 | 🟠 HIGH | Backend returns `accessToken` in JSON body, NOT as cookie; frontend expects Set-Cookie only | No access_token cookie, session detection fails |
| 5 | 🟠 HIGH | Cookie name `refreshToken` (backend) vs `refresh_token` (frontend STORAGE_KEYS) | Frontend can't read/detect refresh cookie (it's httpOnly anyway) |
| 6 | 🟠 HIGH | Cookie name `accessToken` (.env) — but backend never sets an access_token cookie | Middleware session check fails |
| 7 | 🟡 MEDIUM | Backend cookie `sameSite: "Lax"` vs frontend `sameSite: "strict"` | Inconsistency if frontend sets its own cookies |
| 8 | 🟡 MEDIUM | Backend cookie `secure: true` even in development | Cookies rejected on `http://localhost` |
| 9 | 🟡 MEDIUM | Register requires `confirmPassword` field — frontend must send it | Potential validation failure |
| 10 | 🟡 MEDIUM | Verify-email backend expects `code`, frontend sends unknown field name | Potential field mismatch |

---

**Discovery D2 complete. Proceeding to D3.**
