# 🔍 Discovery D3/D5/D7: Contract Alignment Report

> **Generated**: 2026-02-25
> **Covers**: D3 (API cross-reference), D5 (CORS audit), D7 (Error format audit)

---

## D3 — API Contract Cross-Reference

### Endpoint Alignment Matrix

| # | Endpoint | Frontend Method | Backend Method | Status |
|---|---|---|---|---|
| 1 | `/auth/login` | POST | POST | ✅ Match |
| 2 | `/auth/register` | POST | POST | ⚠️ Field names need verification |
| 3 | `/auth/logout` | GET | GET | ✅ Match |
| 4 | `/auth/refresh` | **POST** | **GET** | 🔴 **MISMATCH** |
| 5 | `/auth/verify-email` | POST | POST | ⚠️ Field name `code` vs `token` |
| 6 | `/auth/forgot-password` | POST | POST | ✅ Match |
| 7 | `/auth/reset-password` | POST (body) | POST (param) | 🔴 **MISMATCH** |
| 8 | `/health` | GET | GET | ✅ Match |

### Detailed Mismatches

#### 🔴 Endpoint 4: Token Refresh — HTTP Method Mismatch
| Side | Frontend | Backend |
|---|---|---|
| **Method** | `publicClient.post("/auth/refresh", {})` | `router.route("/refresh").get(handleRefreshToken)` |
| **Impact** | 405 Method Not Allowed | Token refresh completely broken |
| **Fix Owner** | Backend (change to POST) or Frontend (change to GET) | Backend preferred: POST is semantically correct for refresh |

#### 🔴 Endpoint 7: Reset Password — Token Delivery Mismatch
| Side | Frontend | Backend |
|---|---|---|
| **Token** | Sent in `resetData` body: `{ token, password }` | Read from `req.params.token` |
| **Route** | `POST /auth/reset-password` | `POST /reset-password` (no `:token` in route) |
| **Impact** | `req.params.token` is always `undefined` | Password reset broken |
| **Fix Owner** | Both: Backend add `:token` to route, AND frontend send token as URL path or backend change to read from body |

#### ⚠️ Endpoint 2: Register — Field Name Verification
| Frontend sends | Backend expects | Validation |
|---|---|---|
| `userData` (unknown shape) | `{ firstname, lastname, email, password, confirmPassword }` | `check("firstname")`, `check("lastname")`, `check("confirmPassword")` |
| **Risk**: Frontend may use `firstName`/`lastName` (camelCase) vs backend's `firstname`/`lastname` (lowercase) | | |

#### ⚠️ Endpoint 5: Verify Email — Field Name
| Frontend sends | Backend expects |
|---|---|
| `verificationData` (unknown shape) | `{ code }` validated with `check("code")` |
| **Risk**: Frontend might send `{ token }` instead of `{ code }` | |

### Request Body Shape Alignment

| Endpoint | Frontend Body | Backend Expects | Aligned? |
|---|---|---|---|
| Login | `{ email, password }` | `{ email, password }` | ✅ |
| Register | `userData` | `{ firstname, lastname, email, password, confirmPassword }` | ⚠️ Verify |
| Logout | None | None (reads cookies + headers) | ✅ |
| Refresh | `{}` (empty) | None (reads cookie) | ✅ (but method mismatch) |
| Verify Email | `verificationData` | `{ code }` | ⚠️ Verify |
| Forgot Password | `{ email }` | `{ email }` | ✅ |
| Reset Password | `{ token, password }` in body | `token` in URL param, `password` in body | 🔴 Mismatch |

### Response Shape Alignment

**Backend response** (via `apiResponseManager`):
```json
{
  "success": true,
  "message": "string",
  "timestamp": "ISO-8601",
  "requestId": "string|null",
  "data": { ... }
}
```

**Frontend `normalizeError` expects** from error responses:
```
response.data.message → primary error message ✅
response.data.details → validation details    ⚠️ (backend uses "details" only for errorDetails)
response.status       → HTTP status           ✅
```

**Frontend `normalizeResponse` extracts**:
```
response.data → entire response body ✅
response.status → HTTP status        ✅
response.headers → headers           ✅
```

> ⚠️ Frontend thunks do `return response.data` which means they receive the `normalizeResponse` object `{ data, status, headers, timestamp }`. The actual backend data is at `response.data.data`.

---

## D5 — CORS Audit

### Configuration

| Setting | Backend Value | Status |
|---|---|---|
| **Origin Check** | `allowedOrigins` list includes `http://localhost:3000` | ✅ |
| **Credentials** | `credentialsMiddleware` sets `Access-Control-Allow-Credentials: true` | ✅ |
| **Methods** | `GET, POST, PUT, DELETE, OPTIONS, PATCH` | ✅ |
| **Headers** | `Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key` | ✅ |
| **Exposed Headers** | `X-Total-Count, X-API-Version` | ✅ |
| **Preflight** | Handled in `credentialsMiddleware` — returns 200 for OPTIONS | ✅ |

### ⚠️ CORS Issues

1. **Potential double-CORS**: `credentialsMiddleware` sets CORS headers AND `cors(corsOptions)` also runs. For allowed origins, headers may be set twice. Not a blocker but could cause unexpected behavior on some proxies.

2. **Proxy mode bypasses CORS**: If frontend uses the Next.js rewrite proxy (`/api/:path*` → backend), requests go through the Next.js server as same-origin. CORS headers wouldn't be needed. BUT the proxy is currently not utilized because `api-config.js` baseURL points directly to backend port.

---

## D7 — Error Response Format Audit

### Backend Error Shapes

**Validation Error** (handleValidationErrors middleware):
```json
{
  "success": false,
  "message": "Validation error message",
  "errorCode": "VALIDATION_ERROR",
  "timestamp": "ISO-8601"
}
```

**AppError (Operational)**:
```json
{
  "success": false,
  "message": "Error description",
  "errorCode": "AUTH_INVALID_CREDENTIALS",
  "timestamp": "ISO-8601"
}
```

**RateLimit Error**:
```json
{
  "success": false,
  "message": "Rate limit exceeded",
  "errorCode": "RATE_LIMIT_EXCEEDED",
  "data": { "retryAfter": 900, "reason": "..." },
  "timestamp": "ISO-8601"
}
```

**Unexpected Error**:
```json
{
  "success": false,
  "message": "An internal server error occurred.",
  "errorCode": "INTERNAL_ERROR",
  "timestamp": "ISO-8601"
}
```

### Frontend Error Extraction

`normalizeError` (error-utils.js) reads:
- `error.response.data.message` → ✅ works (backend sends `message`)
- `error.response.data.details` → ⚠️ Backend sends `details` only when `errorDetails` is provided. Most errors DON'T include `details`.
- `error.response.status` → ✅ works

`BaseClient.normalizeError` (base-client.js) reads:
- `error.response.data` → full backend response object ✅
- `error.response.status` → ✅

> **Overall Error Alignment**: Mostly compatible. The `message` field flows through correctly. `errorCode` is available but frontend doesn't currently use it. `details` is rarely populated by backend.
