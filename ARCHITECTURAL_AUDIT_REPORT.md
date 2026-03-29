# Architectural Audit Report — NEW-STARTER Application

**Date:** 2026-01-18  
**Scope:** Full-stack architectural reconnaissance — read-only documentation  
**Purpose:** Generate comprehensive architecture documentation without modification recommendations

---

## SECTION 1: Backend Bootstrap Sequence

### File: `backend/index.js`

| Step | Order | Operation | Dependencies |
|------|-------|-----------|--------------|
| 1 | 1 | `dotenv.config()` | Load environment variables |
| 2 | 2 | `validateEnv()` | Validate required env vars (ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET, MAILTRAP_HOST, etc.) |
| 3 | 3 | `initCloudinary()` | Initialize Cloudinary configuration |
| 4 | 4 | `connectToMongo()` | Establish MongoDB connection |
| 5 | 5 | Verify connection status === 1 | Database ready check |
| 6 | 6 | `app.listen(PORT)` | Start HTTP server |
| 7 | 7 | Register shutdown handlers | SIGINT, SIGTERM, uncaughtException, unhandledRejection |

### File: `backend/app.js`

| Phase | Middleware Groups | Execution Order |
|-------|-------------------|-----------------|
| Security | API Version, Helmet, Rate Limiter, CORS Credentials, XSS Sanitize | 1-5 |
| Monitoring | Request ID, Logging, User Activity Logger | 6-8 |
| Processing | Body Parser, Cookie Parser, Content Negotiation | 9-11 |
| Static | Express static for `/assets` | 12 |
| Routes | Auth, Health (public); User (protected); Test (dev-only) | 13-16 |
| Error | 404 Not Found, Global Error Handler | 17-18 |

---

## SECTION 2: Express Middleware Chain

| Order | File | Middleware | Purpose | Applied To |
|-------|------|------------|---------|------------|
| 1 | `api-version-middleware.js` | `createApiVersionMiddleware` | Adds `X-API-Version` header, deprecation warnings | All routes |
| 2 | `helmet-middleware.js` | `helmetMiddleware` | Security headers (CSP, HSTS, XSS filter, etc.) | All routes |
| 3 | `rate-limiter-middleware.js` | `createRateLimiterMiddleware` | Generic Redis-backed rate limiting | All routes |
| 4 | `credentials-middleware.js` | `credentialsMiddleware` | CORS origin validation, `Access-Control` headers | All routes |
| 5 | `sanitize-middleware.js` | `createSanitizeMiddleware` | XSS sanitization (strict/relaxed/html modes) | All routes |
| 6 | `request-id-middleware.js` | `createRequestIdMiddleware` | Attach unique request ID | All routes |
| 7 | `logging-middleware.js` | `createLoggingMiddleware` | Request/response logging with pino | All routes |
| 8 | `logging-user-activity-middleware.js` | `createUserActivityLogger` | User action tracking (excludes `/test-error`, `/assets`) | All routes |
| 9 | `body-parser-middleware.js` | `bodyParserMiddleware` | JSON and URL-encoded parsing | All routes |
| 10 | (external) | `cookieParser()` | Cookie parsing | All routes |
| 11 | `content-type-negotiation-middleware.js` | `contentTypeNegotiationMiddleware` | Content-Type negotiation, analytics logging | All routes |

---

## SECTION 3: Complete Route Map

### Public Routes (No Auth Required)

| Method | Route | Middleware Chain | Controller | Use Case |
|--------|-------|-----------------|------------|----------|
| POST | `/api/v1/auth/login` | `sanitizeMiddleware`, `loginLimiter`, `loginValidationRules`, `handleValidationErrors` | `handleLogin` | `loginUseCase` |
| POST | `/api/v1/auth/register` | `sanitizeMiddleware`, `registerLimiter`, `registerValidationRules`, `handleValidationErrors` | `handleRegister` | `registerUseCase` |
| POST | `/api/v1/auth/verify-email` | `sanitizeMiddleware`, `standardLimiter`, `emailVerificationValidationRules` | `handleVerifyEmail` | `verifyEmailUseCase` |
| POST | `/api/v1/auth/resend-verification` | `sanitizeMiddleware`, `resendVerificationLimiter`, `resendVerificationValidationRules` | `handleResendVerification` | `resendVerificationUseCase` |
| POST | `/api/v1/auth/forgot-password` | `sanitizeMiddleware`, `forgotPasswordLimiter`, `forgotPasswordValidationRules` | `handleForgotPassword` | `forgotPasswordUseCase` |
| POST | `/api/v1/auth/reset-password` | `sanitizeMiddleware`, `standardLimiter`, `resetPasswordValidationRules` | `handleResetPassword` | `resetPasswordUseCase` |
| POST | `/api/v1/auth/refresh` | `sanitizeMiddleware`, `refreshLimiter` | `handleRefreshToken` | `refreshTokenUseCase` |
| POST | `/api/v1/auth/verify-2fa` | `sanitizeMiddleware`, `standardLimiter`, `verify2faValidationRules` | `handleVerify2fa` | `verify2faUseCase` |
| POST | `/api/v1/auth/resend-2fa` | `sanitizeMiddleware`, `resend2faLimiter` | `handleResend2fa` | `resend2faUseCase` |
| GET | `/api/v1/health` | `healthLimiter` | `healthCheck` | Direct DB/Redis check |

### Protected Routes (Auth Token Required)

| Method | Route | Middleware Chain | Controller | Use Case |
|--------|-------|-----------------|------------|----------|
| GET | `/api/v1/auth/logout` | `authTokenMiddleware` | `handleLogout` | `logoutUseCase` |
| POST | `/api/v1/auth/logout-all` | `authTokenMiddleware` | `handleLogoutAll` | `logoutAllUseCase` |
| GET | `/api/v1/user/me` | `authTokenMiddleware` | `getCurrentUser` | Direct User.findById |
| PATCH | `/api/v1/user/me` | `authTokenMiddleware`, `sanitizeMiddleware`, `updateProfileValidationRules` | `updateProfile` | `updateProfileUseCase` |
| POST | `/api/v1/user/change-password` | `authTokenMiddleware`, `sanitizeMiddleware`, `updatePasswordValidationRules` | `handleChangePassword` | `changePasswordUseCase` |
| POST | `/api/v1/user/email/request` | `authTokenMiddleware`, `sanitizeMiddleware`, `emailChangeValidationRules` | `handleRequestEmailChange` | `requestEmailChangeUseCase` |
| GET | `/api/v1/user/email/confirm/:token` | `sanitizeMiddleware` | `handleConfirmEmailChange` | `confirmEmailChangeUseCase` |
| PATCH | `/api/v1/user/toggle-2fa` | `authTokenMiddleware`, `sanitizeMiddleware`, `toggle2faValidationRules` | `handleToggle2fa` | `toggle2faUseCase` |
| POST | `/api/v1/user/avatar` | `authTokenMiddleware`, `multerMiddleware` | `handleUploadAvatar` | `uploadAvatarUseCase` |

### Development-Only Routes

| Method | Route | Condition | Purpose |
|--------|-------|-----------|---------|
| GET | `/test/health` | `NODE_ENV === "development"` | Health check with detailed diagnostics |
| GET | `/test/error` | `NODE_ENV === "development"` | Test error handling |
| GET | `/test/security/helmet` | `NODE_ENV === "development"` | View Helmet headers |
| GET | `/test/security/sanitize` | `NODE_ENV === "development"` | Test XSS sanitization |
| POST | `/test/security/dangerous` | `NODE_ENV === "development"` | Test dangerous input handling |
| GET | `/test/security/stats` | `NODE_ENV === "development"` | View security statistics |

---

## SECTION 4: Backend Layer Architecture

### Authentication Use Cases

#### `login.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ email, password, rememberMe?, userAgent?, ipAddress? }` |
| **Dependencies** | `User` model, `generateTokens`, `emailService`, `logger` |
| **Flow** | 1. Find user by email (case-insensitive)<br>2. Verify user exists and is active<br>3. Compare password with bcrypt<br>4. If 2FA enabled → return temp token for OTP flow<br>5. Generate tokens (access + refresh)<br>6. Update lastLogin<br>7. Return `{ user, accessToken, refreshTokenValue, requiresTwoFactor }` |
| **Error Codes** | `INVALID_CREDENTIALS`, `ACCOUNT_DEACTIVATED`, `INVALID_PASSWORD` |

#### `register.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ firstname, lastname, email, password, confirmPassword, terms }` |
| **Dependencies** | `User` model, `CloudinaryService`, `EmailService`, `logger` |
| **Flow** | 1. Check for existing user (email)<br>2. Hash password (bcrypt, salt rounds 12)<br>3. Generate verification token (6-digit numeric)<br>4. Create Cloudinary folder for user<br>5. Save user to DB<br>6. Send verification email (async via setImmediate)<br>7. Return `{ user: sanitizedUser }` |
| **Error Codes** | `USER_EXISTS`, `REGISTRATION_FAILED` |

#### `logout.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ userId, refreshToken, accessTokenJti, ipAddress }` |
| **Dependencies** | `RefreshToken` model, `revokeByJti`, `logger` |
| **Flow** | 1. Revoke refresh token in DB (if provided)<br>2. Blacklist access token JTI in Redis (if provided)<br>3. Log security event<br>4. Return success |

#### `logout-all.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ userId }` |
| **Dependencies** | `User` model, `RefreshToken` model |
| **Flow** | 1. Increment user.tokenVersion<br>2. Revoke ALL refresh tokens for user<br>3. Return success |

#### `refresh-token.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ rawRefreshToken, userAgent, ipAddress }` |
| **Dependencies** | `RefreshToken` model, `generateTokens`, `logger` |
| **Flow** | 1. Hash raw refresh token (SHA-256)<br>2. Lookup in DB<br>3. Reuse detection: if revoked + has replacement → nuke all tokens<br>4. Check expiry<br>5. Verify tokenVersion matches user's current version<br>6. Generate new token pair<br>7. Mark old token as revoked, link to new token<br>8. Return `{ accessToken, refreshTokenValue, user }` |
| **Error Codes** | `INVALID_REFRESH_TOKEN`, `REFRESH_TOKEN_EXPIRED`, `TOKEN_VERSION_MISMATCH`, `TOKEN_REUSE_DETECTED` |

#### `verify-email.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ token }` |
| **Dependencies** | `User` model |
| **Flow** | 1. Hash token<br>2. Find user by emailVerificationToken<br>3. Check expiry (24h)<br>4. Mark user as verified<br>5. Clear verification fields<br>6. Return success |

#### `forgot-password.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ email }` |
| **Dependencies** | `User` model, `EmailService` |
| **Flow** | 1. Find user (don't expose if not found)<br>2. Generate reset token (32 bytes hex)<br>3. Hash and save to user.passwordResetToken<br>4. Set expiry (1 hour)<br>5. Send email (async)<br>6. Return generic success (security: don't reveal if email exists) |

#### `reset-password.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ token, newPassword }` |
| **Dependencies** | `User` model, `RefreshToken` model, `EmailService` |
| **Flow** | 1. Hash token, find user<br>2. Check expiry<br>3. Hash new password<br>4. Increment tokenVersion<br>5. Revoke all refresh tokens<br>6. Send success email<br>7. Return success |

#### `resend-verification.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ email }` |
| **Dependencies** | `User` model, `EmailService` |
| **Flow** | 1. Find user (secure: don't expose if not found)<br>2. If already verified → return generic success<br>3. Generate new 6-digit code<br>4. Update expiry<br>5. Send email (async)<br>6. Return generic success |

#### `verify-2fa.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ tempToken, otpCode }` |
| **Dependencies** | `User` model, `generateTokens` |
| **Flow** | 1. Verify temp token (JWT)<br>2. Find user by ID from token<br>3. Verify 2FA code matches and not expired<br>4. Clear 2FA fields<br>5. Generate full tokens<br>6. Return `{ user, accessToken, refreshTokenValue }` |

#### `resend-2fa.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ tempToken }` |
| **Dependencies** | `User` model, `email.service` |
| **Flow** | 1. Verify temp token<br>2. Check 2FA still enabled<br>3. Generate new 6-digit code<br>4. Send via email<br>5. Return success |

### User Use Cases

#### `update-profile.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ userId, firstname?, lastname? }` |
| **Dependencies** | `User` model, `sanitizeUserForResponse`, `logger` |
| **Flow** | 1. Find user by ID<br>2. Update provided fields<br>3. Use `.save()` to trigger pre-save middleware<br>4. Return sanitized user |

#### `change-password.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ userId, oldPassword, newPassword, confirmPassword }` |
| **Dependencies** | `User` model, `hashPassword`, `comparePassword`, `logger` |
| **Flow** | 1. Find user with password field<br>2. Verify old password<br>3. Check new password ≠ old<br>4. Hash and save<br>5. Return success |
| **Error Codes** | `INVALID_PASSWORD`, `SAME_PASSWORD` |

#### `request-email-change.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ userId, newEmail, currentPassword, apiBaseUrl }` |
| **Dependencies** | `User` model, `bcrypt`, `crypto`, `generateResetToken`, `emailService` |
| **Flow** | 1. Verify current password<br>2. Check new email ≠ current<br>3. Check email not taken<br>4. Check no pending change for different email<br>5. Generate reset token<br>6. Hash and save to pendingEmailToken<br>7. Send verification email<br>8. Return success |
| **Error Codes** | `INVALID_PASSWORD`, `SAME_EMAIL`, `EMAIL_TAKEN`, `EMAIL_CHANGE_PENDING` |

#### `confirm-email-change.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ token }` |
| **Dependencies** | `User` model, `RefreshToken` model |
| **Flow** | 1. Hash token<br>2. Find user by pendingEmailToken<br>3. Check expiry<br>4. Check new email not taken<br>5. Update email, clear pending fields<br>6. Increment tokenVersion<br>7. Revoke all refresh tokens<br>8. Return `{ success, redirectUrl }` |

#### `toggle-2fa.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ userId, enable, currentPassword }` |
| **Dependencies** | `User` model, `comparePassword`, `logger` |
| **Flow** | 1. Verify current password<br>2. Check state change needed<br>3. Update twoFactorEnabled<br>4. If disabling → clear 2FA fields<br>5. Update lastSecurityEvent<br>6. Return success |
| **Error Code** | `TWO_FACTOR_NO_CHANGE` |

#### `upload-avatar.use-case.js`
| Aspect | Details |
|--------|---------|
| **Input** | `{ userId, fileBuffer, mimetype }` |
| **Dependencies** | `User` model, `CloudinaryService`, `logger` |
| **Flow** | 1. Find user<br>2. Delete existing avatar from Cloudinary if present<br>3. Upload new avatar (400x400, face gravity, auto quality)<br>4. Update user.avatar<br>5. Return sanitized user |
| **Error Codes** | `UPLOAD_FAILED`, `DATABASE_ERROR`, `AVATAR_UPDATE_FAILED` |

---

## SECTION 5: Data Models — Complete Schema

### `User.js`

| Field | Type | Required | Default | Validation/Notes |
|-------|------|----------|---------|------------------|
| `uuid` | String | Yes | `crypto.randomUUID()` | Unique index |
| `firstname` | String | Yes | — | Min 3, max 16 chars |
| `lastname` | String | Yes | — | Min 3, max 16 chars |
| `email` | String | Yes | — | Unique, lowercase, trimmed |
| `password` | String | Yes | — | Min 8, max 128, bcrypt hashed, `select: false` |
| `avatar` | Object | No | `null` | `{ url: String, publicId: String }` |
| `isVerified` | Boolean | Yes | `false` | Email verification status |
| `emailVerificationToken` | String | No | — | 6-digit code, `select: false` |
| `emailVerificationExpiresAt` | Date | No | — | 24h expiry, `select: false` |
| `twoFactorEnabled` | Boolean | Yes | `false` | 2FA toggle |
| `twoFactorCode` | String | No | — | 6-digit, `select: false` |
| `twoFactorExpiry` | Date | No | — | 10 min expiry, `select: false` |
| `tokenVersion` | Number | No | `1` | `select: false` — for token invalidation |
| `passwordResetToken` | String | No | — | Hashed, `select: false` |
| `passwordResetExpiresAt` | Date | No | — | 1h expiry, `select: false` |
| `pendingEmail` | String | No | — | `select: false` |
| `pendingEmailToken` | String | No | — | Hashed, `select: false` |
| `pendingEmailExpiresAt` | Date | No | — | 24h expiry, `select: false` |
| `lastLogin` | Date | No | — | Auto-updated on login |
| `lastSecurityEvent` | Date | No | — | Timestamp of security changes |
| `isActive` | Boolean | Yes | `true` | Soft delete flag |
| `createdAt` | Date | Auto | — | Mongoose timestamps |
| `updatedAt` | Date | Auto | — | Mongoose timestamps |

**Indexes:**
- `uuid`: Unique
- `email`: Unique, lowercase, trimmed
- `createdAt`: Descending (for queries)

**Virtuals:**
- `fullName`: Concatenation of firstname + lastname

**Pre-save Hooks:**
- Trim and lowercase `firstname`, `lastname`
- Lowercase `email`

**Methods:**
- `comparePassword(candidatePassword)`: Async bcrypt compare
- `updateLastLogin()`: Update timestamp
- `incrementTokenVersion()`: Increment for logout-all
- `generateEmailVerificationToken()`: Create 6-digit code
- `generatePasswordReset()`: Create 32-byte hex token
- `generateTwoFactorCode()`: Create 6-digit code

### `RefreshToken.js`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `token` | String | Yes | SHA-256 hashed refresh token, unique index |
| `user` | ObjectId (ref: User) | Yes | Indexed for user lookup |
| `expiresAt` | Date | Yes | TTL index (auto-delete after expiry) |
| `isRevoked` | Boolean | Yes | `false` — soft revoke flag |
| `replacedBy` | ObjectId (self-ref) | No | Points to replacement token |
| `rememberMe` | Boolean | Yes | `false` — extends expiry to 30d |
| `userAgent` | String | No | Client UA string |
| `ipAddress` | String | No | Client IP |
| `tokenVersion` | Number | No | Snapshot of user.tokenVersion |
| `createdAt` | Date | Auto | Mongoose timestamps |
| `updatedAt` | Date | Auto | Mongoose timestamps |

**Indexes:**
- `token`: Unique
- `user`: For user-scoped queries
- `expiresAt`: TTL index (MongoDB auto-cleanup)
- Compound: `{ user: 1, isRevoked: 1, expiresAt: -1 }`

---

## SECTION 6: Error System

### Base Error Class: `AppError.js`

| Class | Extends | Status Code | Default Error Code |
|-------|---------|-------------|-------------------|
| `AppError` | `Error` | 500 | `INTERNAL_ERROR` |
| `ValidationError` | `AppError` | 400 | `VALIDATION_ERROR` |
| `AuthError` | `AppError` | 401 | `AUTH_ERROR` |
| `ForbiddenError` | `AppError` | 403 | `FORBIDDEN` |
| `NotFoundError` | `AppError` | 404 | `NOT_FOUND` |
| `ConflictError` | `AppError` | 409 | `CONFLICT` |
| `RateLimitError` | `AppError` | 429 | `RATE_LIMITED` |
| `DatabaseError` | `AppError` | 503 | `DATABASE_ERROR` |

### Error Constants: `error-constants.js`

**AUTH:** `MISSING_CREDENTIALS`, `INVALID_CREDENTIALS`, `ACCOUNT_DEACTIVATED`, `ACCOUNT_LOCKED`, `MISSING_REFRESH_TOKEN`, `REFRESH_TOKEN_EXPIRED`, `INVALID_TOKEN`, `TOKEN_NOT_ACTIVE`, `TOKEN_VERSION_MISMATCH`, `TOKEN_REUSE_DETECTED`, `SESSION_INVALID`, `USER_NOT_FOUND`

**VALIDATION:** `BAD_REQUEST`, `MISSING_FIELDS`, `PASSWORDS_MISMATCH`, `INVALID_EMAIL`, `MISSING_PASSWORD`, `PASSWORD_SAME_AS_CURRENT`, `MISSING_VERIFICATION_CODE`, `INVALID_VERIFICATION_CODE`, `INVALID_RESET_TOKEN`

**RESOURCE:** `NOT_FOUND`, `CONFLICT`, `USER_EXISTS`

**RATE_LIMIT:** `TOO_MANY_REQUESTS`, `REGISTRATION_RATE_LIMITED`, `PASSWORD_RESET_RATE_LIMITED`

**SERVER:** `INTERNAL_ERROR`, `DATABASE_ERROR`, `VERIFICATION_FAILED`, `RESET_FAILED`

### Global Error Handler: `error-handler-middleware.js`

| Behavior | Logic |
|----------|-------|
| AppError detection | Checks `error instanceof AppError` |
| Response format | `{ success: false, statusCode, message, errorCode, stack? }` |
| Stack traces | Only in development |
| Logging | `emitLogMessage()` with full error context |

---

## SECTION 7: Frontend Provider/Layout Hierarchy

```
RootLayout (layout.jsx)
├── ExtensionErrorHandler.init()
├── html (lang={locale}, dir={dir})
│   ├── head
│   │   └── meta tags (charset, viewport)
│   └── body
│       ├── NextIntlClientProvider
│       │   ├── ThemeProvider (next-themes)
│       │   │   ├── StoreProvider (Redux + PersistGate)
│       │   │   │   ├── AuthBootstrap
│       │   │   │   │   └── ErrorBoundary
│       │   │   │   │       └── {children}
│       │   │   │   └── Toaster (Sonner)
│       │   │   └── Toaster
│       │   └── Toaster
│
├── (auth)/layout.jsx (AuthLayout)
│   └── AuthLayoutWrapper
│       ├── EnvironmentDebug
│       └── DevWrapper
│           └── {children}
│
├── (protected)/layout.jsx (AppLayout)
│   └── ProtectedGuard
│       ├── div.min-h-screen
│       │   ├── header
│       │   │   └── TopNav
│       │   └── main
│       │       └── {children}
│
├── (protected)/settings/layout.jsx (SettingsLayout)
│   ├── SettingsMobileNav
│   └── div.flex
│       ├── aside
│       │   └── SettingsSidebar
│       └── div.flex-1
│           └── {children}
│
├── loading.jsx (RootLoading)
│   └── AppSplashScreen
│
├── error.jsx (Segment Error)
│   └── ErrorFallback
│
├── global-error.jsx (Global Error)
│   └── NextIntlClientProvider (inline messages)
│       └── ErrorFallback
│
└── not-found.jsx (404)
    └── NotFound page (bilingual via next-intl)
```

---

## SECTION 8: Frontend Auth Infrastructure

### Auth Bootstrap: `auth-bootstrap.jsx`

**Logic Flow:**

1. **Mount Effect (Cross-tab sync)**
   - Clear `logout_source` and `login_source` from sessionStorage
   - Create `BroadcastChannel('auth_channel')`
   - Listen for:
     - `LOGOUT`: If not local source → `clearCredentials()` → redirect to `/login`
     - `LOGIN`: If not local source → redirect to `/`

2. **Session Restore Effect**
   - Skip if `hasAttemptedRestore` is true
   - Set `isLoading: true`
   - **Step 1:** Call `/auth/refresh` with `credentials: "include"`
     - If fails → `clearCredentials()` → return
   - **Step 2:** If refresh succeeds, get access token
   - **Step 3:** Call `/user/me` with `Authorization: Bearer ${accessToken}`
     - If fails → `clearCredentials()` → return
   - **Step 4:** `setCredentials({ user, accessToken })`
   - **Finally:** `setBootstrapComplete(true)`

### Route Guards

**ProtectedGuard (`protected-guard.jsx`):**
- **Input:** `children`
- **Logic:**
  - If `!isBootstrapComplete` → show `AppSplashScreen`
  - If `isBootstrapComplete && !isAuthenticated` → `router.push("/login")`
  - If `isAuthenticated` → render children

**PublicGuard (`public-guard.jsx`):**
- **Input:** `children`
- **Logic:**
  - If `!isBootstrapComplete` → show `AppSplashScreen`
  - If `isBootstrapComplete && isAuthenticated` → `router.push("/")`
  - If `!isAuthenticated` → render children

### Next.js Middleware (`middleware.js`)

| Route Type | Routes | Cookie Check | Behavior |
|------------|--------|--------------|----------|
| Protected | `/`, `/settings/*` | `refresh_token` present | Allow; if missing → redirect to `/login` with `returnTo` param |
| Public-only | `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email` | `refresh_token` present | If has cookie → redirect to `/` |

**Matcher Config:** `"/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.png|.*\\.jpg).*)"`

---

## SECTION 9: Redux State Architecture

### Store Configuration (`store/index.js`)

| Slice | Persistence | Storage | Whitelist | Transform |
|-------|-------------|---------|-----------|-----------|
| `auth` | Yes | SessionStorage | `isAuthenticated` | None |
| `user` | Yes | LocalStorage | `preferences` | None |
| `ui` | No | — | — | — |
| `notifications` | No | — | — | — |

### Auth Slice (`auth-slice.js`)

| State Key | Type | Initial | Description |
|-----------|------|---------|-------------|
| `user` | Object | `null` | Current user data |
| `accessToken` | String | `null` | JWT access token (memory only) |
| `isAuthenticated` | Boolean | `false` | Auth status |
| `isLoading` | Boolean | `false` | Global auth loading |
| `error` | String | `null` | Last auth error |
| `isVerifying` | Boolean | `false` | Email verification flow |
| `sessionExpired` | Boolean | `false` | Session expired flag |
| `isBootstrapComplete` | Boolean | `false` | Initial restore complete |

**Reducers:**
- `logout`, `setAccessToken`, `setUser`, `setAuthenticated`, `clearError`, `setAuthError`, `setCredentials`, `updateAccessToken`, `clearCredentials`, `setSessionExpired`, `setLoading`, `setBootstrapComplete`, `startVerification`, `endVerification`

**Extra Reducers (Thunks):**
| Thunk | Pending | Fulfilled | Rejected |
|-------|---------|-----------|----------|
| `loginUser` | `isLoading: true` | Set credentials if not 2FA | Set error |
| `registerUser` | `isLoading: true` | Store user, NOT authenticated | Set error |
| `bootstrapAuth` | `isLoading: true` | `isAuthenticated` check | Clear credentials |
| `logoutAllDevices` | — | Clear all | — |
| `verifyEmail` | `isLoading: true, isVerifying: true` | `isVerifying: false` | Set error |
| `forgotPassword` | `isLoading: true` | Success | Set error |
| `resetPassword` | `isLoading: true` | Success | Set error |
| `verify2fa` | `isLoading: true` | Set credentials | Set error |

### User Slice (`user-slice.js`)

| State Key | Type | Initial |
|-----------|------|---------|
| `profile` | Object | `null` |
| `preferences` | Object | `{ theme: "light", language: "en", notifications: true }` |
| `isLoading` | Boolean | `false` |
| `error` | String | `null` |

**Reducers:** `updatePreferences`, `updateProfile`, `clearError`, `clearUser`

### UI Slice (`ui/index.js`)

**Sub-slices:**
| Slice | Purpose |
|-------|---------|
| `layout` | Layout state |
| `modal` | Modal visibility |
| `loading` | Loading states |
| `confirmation` | Confirmation dialogs |
| `navigation` | Navigation state |
| `scroll` | Scroll position |
| `form` | Form state |
| `search` | Search state |
| `pagination` | Pagination state |
| `errors` | UI error state |
| `performance` | Performance metrics |

### Notifications Slice (`notifications-slice.js`)

| State Key | Type | Initial |
|-----------|------|---------|
| `items` | Array | `[]` |
| `unreadCount` | Number | `0` |

**Reducers:** `addNotification`, `markAsRead`, `markAllAsRead`, `setNotifications`, `removeNotification`, `clearNotifications`

---

## SECTION 10: API Client Architecture

### Base Client (`base-client.js`)

**Configuration:**
| Property | Value |
|----------|-------|
| `baseURL` | `API_CONFIG.FULL_BASE_URL` (env-driven) |
| `timeout` | `API_CONFIG.TIMEOUT` |
| `withCredentials` | `true` (HttpOnly cookies) |
| `headers` | `API_CONFIG.HEADERS` |

**Request Interceptor:**
1. Add `metadata.startTime` for tracking
2. Attach `Authorization: Bearer ${store.auth.accessToken}` if exists
3. Set `withCredentials: true`
4. Development console logging

**Response Interceptor:**
1. Calculate duration
2. Development console logging
3. Handle 401 with `errorCode === "TOKEN_EXPIRED"`:
   - If `_retry` flag set → `clearCredentials()` + `setSessionExpired(true)`
   - If first attempt → queue request, call refresh, retry with new token
4. Handle network errors (no response)
5. Handle 403, 429, 500, 502/503/504 with notifications

**Methods:** `get`, `post`, `put`, `patch`, `delete`, `upload`

### Public Client (`public-client.js`)

- Extends `BaseClient`
- Removes `Authorization` header in request interceptor
- Methods: `healthCheck()`, `getPublicData(endpoint)`

### Private Client (`private-client.js`)

- Extends `BaseClient`
- Adds `injectAuthToken` interceptor (reads from Redux)
- Adds `handleAuthError` interceptor:
  - **Path 1:** No session → redirect to `/login`
  - **Path 2:** Expired → call `refreshQueue.handleTokenRefresh()`
  - **Path 3:** Refresh fails → `refreshQueue.handleAuthFailure()`
- Adds `X-Request-ID` header
- Methods: `securedGet`, `securedPost`, `securedPut`, `securedPatch`, `securedDelete`, `batchRequests`

### Refresh Queue (`refresh-queue.js`)

| Property | Value |
|----------|-------|
| `maxQueueSize` | 50 |
| `maxRetries` | 3 |

**Methods:**
| Method | Purpose |
|--------|---------|
| `addToQueue(failedRequest)` | Queue failed request |
| `processQueue(newToken)` | Retry all queued requests |
| `retryRequest(failedRequest, newToken)` | Single request retry |
| `handleTokenRefresh(failedRequest)` | Orchestrate refresh flow |
| `handleAuthFailure()` | Clear session, logout, redirect |
| `clearQueue()` | Reset queue state |

### Endpoint Definitions

**Auth Endpoints:**
| Endpoint | Path |
|----------|------|
| `LOGIN` | `/auth/login` |
| `LOGOUT` | `/auth/logout` |
| `LOGOUT_ALL` | `/auth/logout-all` |
| `REGISTER` | `/auth/register` |
| `REFRESH_TOKEN` | `/auth/refresh` |
| `VERIFY_EMAIL` | `/auth/verify-email` |
| `RESEND_VERIFICATION` | `/auth/resend-verification` |
| `FORGOT_PASSWORD` | `/auth/forgot-password` |
| `RESET_PASSWORD` | `/auth/reset-password` |
| `VERIFY_2FA` | `/auth/verify-2fa` |
| `RESEND_2FA` | `/auth/resend-2fa` |

**User Endpoints:**
| Endpoint | Path | Status |
|----------|------|--------|
| `ME` | `/user/me` | Implemented |
| `EMAIL_CHANGE_REQUEST` | `/user/email/request` | Implemented |
| `PROFILE` | `/user/profile` | Planned |
| `UPLOAD_AVATAR` | `/user/profile/avatar` | Planned |
| `PREFERENCES` | `/user/preferences` | Planned |
| `CHANGE_PASSWORD` | `/user/security/password` | Planned |
| `TOGGLE_2FA` | `/user/security/2fa` | Planned |

---

## SECTION 11: Frontend Feature Hooks

### Auth Hooks

| Hook | File | Purpose | Returns |
|------|------|---------|---------|
| `useLogin` | `useLogin.js` | Login flow with 2FA support | `user`, `isLoading`, `error`, `handleLogin`, `requiresTwoFactor`, `handleVerify2fa`, `handleResendCode`, etc. |
| `useSignup` | `useSignup.js` | Registration flow | `isLoading`, `error`, `handleSignup`, validation helpers |
| `useForgotPassword` | `useForgotPassword.js` | Password reset request | `isLoading`, `isSubmitted`, `handleSubmit` |
| `useResetPassword` | `useResetPassword.js` | Password reset confirmation | `isLoading`, `error`, `handleResetPassword` |
| `useVerifyEmail` | `useVerifyEmail.js` | Email verification | `isLoading`, `isVerifying`, `verificationStatus`, `handleResend` |

### User Hooks

| Hook | File | Purpose | Returns |
|------|------|---------|---------|
| `useUserProfile` | `useUserProfile.js` | User data + logout | `user`, `firstName`, `lastName`, `initials`, `displayName`, `email`, `avatar`, `isVerified`, `lastLogin`, `memberSince`, `handleLogout` |
| `useEditProfile` | `useEditProfile.js` | Profile editing | `isLoading`, `handleUpdateProfile` |
| `useChangePassword` | `useChangePassword.js` | Password change | `isLoading`, `handleChangePassword` |
| `useChangeEmail` | `useChangeEmail.js` | Email change request | `isLoading`, `isSubmitted`, `handleRequestChange` |
| `useToggle2fa` | `useToggle2fa.js` | 2FA toggle | `isLoading`, `showPasswordField`, `handleToggle`, `handlePasswordSubmit` |
| `useProfilePhoto` | `useProfilePhoto.js` | Avatar upload | `isUploading`, `previewUrl`, `handleFileSelect`, `handleUpload`, `handleRemove` |
| `useSignOutAll` | `useSignOutAll.js` | Logout all devices | `isLoading`, `handleSignOutAll` |

### Infrastructure Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useAppDispatch` | `redux.js` | Typed Redux dispatch |
| `useAppSelector` | `redux.js` | Typed Redux selector |
| `useAppStore` | `redux.js` | Typed Redux store access |

---

## SECTION 12: Infrastructure Services

### Redis (`config/redis.js`)

| Property | Value |
|----------|-------|
| Library | `ioredis` |
| Connection | `process.env.REDIS_URL` |
| Retry delay | 100ms |
| Max retries | 3 |
| Lazy connect | `true` (prevents startup crash) |

**Usage:**
- Token blacklisting (JTI → "1" with TTL)
- Rate limiter storage
- Email queue (Bull)

### Email System

**Service:** `email.service.js` (`EmailService` class)

| Method | Template | Purpose |
|--------|----------|---------|
| `sendVerificationEmail` | `auth/verification` | Email verification (6-digit code) |
| `send2faCodeEmail` | `auth/2fa-code` | 2FA OTP delivery |
| `sendWelcomeEmail` | Mailtrap template | Post-verification welcome |
| `sendPasswordResetEmail` | `auth/password-reset` | Reset link |
| `sendResetSuccessEmail` | `auth/reset-success` | Confirmation after reset |
| `sendEmailChangeVerification` | `auth/email-change` | Email change confirmation |

**Queue:** `email.queue.js` (`EmailQueue` class)

| Property | Value |
|----------|-------|
| Library | `bull` |
| Redis | Uses same Redis instance |
| Concurrency | 5 workers |
| Retry | 3 attempts, exponential backoff |

**Provider:** `mailtrap.provider.js` (`MailtrapProvider`)

- Nodemailer SMTP transport
- Mailtrap sandbox for development
- Supports custom headers for Mailtrap templates

### Cloudinary (`cloudinaryService.js`)

| Method | Purpose |
|--------|---------|
| `createUserFolder(userId)` | Create `users/{userId}/{albums,avatars,documents,temp}` |
| `deleteUserFolder(userId)` | Delete all resources and folder |
| `uploadAvatar(userId, fileBuffer, mimetype)` | Upload to `users/{userId}/avatars`, 400x400, face gravity |
| `deleteImage(publicId)` | Destroy image by publicId |

### Rate Limiting (`rate-limiters.js`)

| Limiter | Window | Max Requests | Skip Conditions |
|---------|--------|--------------|-----------------|
| `loginLimiter` | 15 min | 5 | — |
| `registerLimiter` | 1 hour | 3 | — |
| `forgotPasswordLimiter` | 1 hour | 3 | — |
| `resendVerificationLimiter` | 1 hour | 3 | — |
| `resend2faLimiter` | 1 min | 3 | — |
| `refreshLimiter` | 15 min | 10 | — |
| `apiLimiter` | 15 min | 100 | `req.user?.role === 'admin'` |
| `healthLimiter` | 1 min | 10 | — |
| `testLimiter` | 1 min | 30 | — |
| `standardLimiter` | 15 min | 100 | — |

---

## SECTION 13: Security Layer Stack

| Layer | Implementation | Details |
|-------|-----------------|---------|
| **CORS** | `credentials-middleware.js` | Origin whitelist from env, `Access-Control-Allow-Credentials: true` |
| **Helmet** | `helmet-middleware.js` | CSP, HSTS, XSS-Filter, Frame-Options, Referrer-Policy, Permissions-Policy |
| **Rate Limiting** | `rate-limiter-middleware.js` + `rate-limiters.js` | Redis-backed, endpoint-specific |
| **XSS Sanitization** | `sanitize-middleware.js` | `xss` library, strict/relaxed/html modes, recursive object sanitization |
| **Auth Tokens** | `authTokenMiddleware.js` | JWT verification, Redis blacklist check |
| **Password Hashing** | `hash-utils.js` | bcrypt, 12 salt rounds |
| **Token Hashing** | `token-service.js` | SHA-256 for refresh token storage |
| **HttpOnly Cookies** | `cookie-service.js` | `httpOnly: true`, `secure: production`, `sameSite: "Lax"` |
| **Input Validation** | `validationRules.js` + `validation-middleware.js` | express-validator, custom rules |
| **File Upload** | `multer-middleware.js` | MIME type whitelist, 5MB limit, memory storage |

### JWT Claims

| Claim | Value | Purpose |
|-------|-------|---------|
| `UserInfo.userId` | MongoDB `_id` | User identification |
| `UserInfo.email` | User email | Additional context |
| `UserInfo.uuid` | `crypto.randomUUID()` | Security tracking |
| `UserInfo.type` | `"access"` / `"2fa"` | Token type |
| `iss` | `"new-starter-backend-v1"` | Issuer |
| `aud` | `"new-starter-web-client"` | Audience |
| `jti` | `crypto.randomBytes(16)` | Unique token ID for revocation |
| `exp` | 15 min (access) / 10 min (2FA temp) | Expiry |

---

## SECTION 14: Cross-Tab Sync

**Mechanism:** `BroadcastChannel('auth_channel')`

| Source | Event | Handler |
|--------|-------|---------|
| `auth-bootstrap.jsx` | `LOGOUT` | If not local → `clearCredentials()` → redirect to `/login` |
| `auth-bootstrap.jsx` | `LOGIN` | If not local → redirect to `/` |
| `useLogin.js` | `LOGIN` | `sessionStorage.setItem('login_source', 'local')` → broadcast |
| `useUserProfile.js` | `LOGOUT` | `sessionStorage.setItem('logout_source', 'local')` → broadcast |

**Session Storage Flags:**
| Key | Purpose |
|-----|---------|
| `logout_source` | Mark logout origin to prevent double-handling |
| `login_source` | Mark login origin to prevent double-handling |

---

## SECTION 15: Frontend Notification System

### NotificationService (`notify.js`)

**Architecture:** Static facade over Sonner

| Method | Default Duration | Sonner Equivalent |
|--------|-----------------|-------------------|
| `success(message, options)` | 3500ms | `toast.success` |
| `error(message, options)` | 6000ms | `toast.error` |
| `warn(message, options)` | 5000ms | `toast.warning` |
| `info(message, options)` | 4000ms | `toast.info` |
| `loading(message, options)` | ∞ (manual dismiss) | `toast.loading` |
| `promise(promise, messages)` | — | `toast.promise` |
| `dismiss(id?)` | — | `toast.dismiss` |

**Options Interface:**
| Option | Type | Description |
|--------|------|-------------|
| `id` | String | Toast ID for deduplication/update |
| `description` | String | Secondary text |
| `duration` | Number | Override default |
| `action` | Object | Action button `{ label, onClick }` |

### Toaster Component (`sonner.jsx`)

| Property | Value |
|----------|-------|
| Library | `sonner` |
| Position | `NotificationService.position` (static getter) → `"top-center"` |
| Rich colors | `true` |
| Close button | `true` |
| Visible toasts | 3 |
| Icons | Lucide icons (CircleCheck, Info, Loader2, OctagonX, TriangleAlert) |

---

## Audit Complete

**Files Read:** 70+  
**Sections Documented:** 15  
**Status:** Read-only reconnaissance complete — no modifications suggested per mandate.
