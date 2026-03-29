# Authentication System — New Starter Kit

## 1. Token Architecture

The application uses a dual-token architecture. The access token is short-lived and stored in Redux memory only — it is never persisted to localStorage, sessionStorage, or cookies on the client. The refresh token is long-lived and stored as an HTTP-only cookie — JavaScript cannot read it.

| Property | Access Token | Refresh Token |
|----------|-------------|---------------|
| Format | JWT (signed) | Random bytes (opaque) |
| Lifetime | 15 minutes | 7 days (default) or 30 days (rememberMe) |
| Storage (client) | Redux memory only | HTTP-only cookie |
| Storage (server) | Not stored | MongoDB (SHA-256 hashed) |
| Transport | Authorization: Bearer header | Cookie: refresh_token |
| Revocation | Redis blacklist (JTI) | MongoDB isRevoked flag |
| Secret | ACCESS_TOKEN_SECRET | REFRESH_TOKEN_SECRET |

The two JWT secrets MUST be different. Using the same secret for both tokens is a security vulnerability — a leaked refresh token could be used as an access token.

### JWT Claims Structure

```json
{
  "UserInfo": {
    "userId": "MongoDB ObjectId",
    "email": "user@example.com",
    "uuid": "crypto.randomUUID()",
    "type": "access"
  },
  "iss": "new-starter-backend-v1",
  "aud": "new-starter-web-client",
  "jti": "crypto.randomBytes(16).toString('hex')",
  "iat": 1704067200,
  "exp": 1704068100
}
```

## 2. Login Flow

Login supports three paths: standard login, 2FA-required login, and remember-me extended sessions.

```mermaid
sequenceDiagram
    participant Browser
    participant NextJS as Next.js Client
    participant API as Express API
    participant DB as MongoDB
    participant Redis

    Browser->>NextJS: Submit email + password + rememberMe
    NextJS->>API: POST /api/v1/auth/login

    API->>API: Rate limit check (loginLimiter)
    API->>API: Validate input (emailRules, password exists)
    API->>DB: User.findOne({ email }) with +password
    DB-->>API: User document

    alt User not found OR wrong password
        API-->>NextJS: 401 { errorCode: "INVALID_CREDENTIALS" }
        Note over API: Same response for both cases (anti-enumeration)
    end

    alt 2FA enabled
        API->>API: Generate 6-digit code, save to user
        API->>API: Generate temp JWT (type: "2fa", 10 min)
        API-->>NextJS: 200 { requiresTwoFactor: true, tempToken }
        NextJS->>Browser: Show 2FA input form
    end

    alt Standard login
        API->>API: Generate access token (JWT, 15 min)
        API->>API: Generate refresh token (random bytes)
        API->>DB: Save RefreshToken (SHA-256 hashed)
        API->>API: Set-Cookie: refresh_token (HttpOnly)
        API-->>NextJS: 200 { user, accessToken }
        NextJS->>NextJS: dispatch(setCredentials)
        NextJS->>NextJS: BroadcastChannel.postMessage({ type: "LOGIN" })
        NextJS->>Browser: Redirect to /
    end
```

## 3. Token Refresh Flow

When an API call receives a 401 with errorCode TOKEN_EXPIRED, the Axios interceptor automatically attempts a silent refresh. The refresh call uses a SEPARATE plain axios instance — not the interceptor-equipped one — to prevent infinite retry loops.

```mermaid
sequenceDiagram
    participant Client as Axios Private Client
    participant Queue as Refresh Queue
    participant API as Express API
    participant DB as MongoDB

    Client->>API: GET /api/v1/user/me (expired token)
    API-->>Client: 401 { errorCode: "TOKEN_EXPIRED" }

    Client->>Queue: Add failed request to queue
    Queue->>Queue: Set isRefreshing = true

    Queue->>API: POST /api/v1/auth/refresh (cookie sent automatically)
    API->>API: Extract refresh_token from cookie
    API->>API: SHA-256 hash the raw token
    API->>DB: Find RefreshToken by hash

    alt Token is revoked (reuse detected)
        API->>DB: Revoke ALL tokens for this user
        API-->>Queue: 401 { errorCode: "TOKEN_REUSE_DETECTED" }
        Queue->>Client: handleAuthFailure() — clear session, redirect
    end

    alt Token is valid
        API->>API: Check tokenVersion matches user.tokenVersion
        API->>API: Generate new access token + new refresh token
        API->>DB: Mark old token as revoked, save new token
        API->>API: Set-Cookie: new refresh_token
        API-->>Queue: 200 { accessToken }
        Queue->>Queue: Set isRefreshing = false
        Queue->>Client: Retry all queued requests with new token
    end
```

## 4. Token Reuse Detection

If a revoked refresh token is used, the system assumes token theft and performs nuclear revocation — ALL active sessions for that user are immediately revoked. This is implemented in the refresh token use case.

```mermaid
flowchart TD
    A["Refresh request arrives"] --> B["Hash token, lookup in DB"]
    B --> C{"Token found?"}
    C -->|No| D["401 INVALID_REFRESH_TOKEN"]
    C -->|Yes| E{"isRevoked?"}
    E -->|No| F{"Expired?"}
    F -->|Yes| G["401 REFRESH_TOKEN_EXPIRED"]
    F -->|No| H{"tokenVersion matches?"}
    H -->|No| I["401 TOKEN_VERSION_MISMATCH"]
    H -->|Yes| J["Rotate: revoke old, issue new"]
    E -->|Yes| K{"Has replacedBy?"}
    K -->|Yes| L["REUSE DETECTED — Revoke ALL user tokens"]
    K -->|No| M["401 INVALID_REFRESH_TOKEN"]
    L --> N["401 TOKEN_REUSE_DETECTED"]
```

## 5. Registration + Email Verification Flow

Registration creates an unverified user and sends a 6-digit verification code via email. The code expires after 24 hours.

```mermaid
sequenceDiagram
    participant Browser
    participant API as Express API
    participant DB as MongoDB
    participant Cloud as Cloudinary
    participant Email as Email Service (Bull Queue)

    Browser->>API: POST /api/v1/auth/register
    API->>API: Validate input (email, password, name, terms)
    API->>DB: Check email uniqueness
    API->>API: bcrypt.hash(password, 12)
    API->>API: Generate 6-digit verification code
    API->>API: SHA-256 hash the code for storage
    API->>Cloud: createUserFolder(userId)
    API->>DB: Create User document
    API->>Email: Queue verification email (async)
    API-->>Browser: 201 { user } (no tokens — must verify first)

    Note over Browser: User checks email for code

    Browser->>API: POST /api/v1/auth/verify-email { token: "123456" }
    API->>API: SHA-256 hash the submitted code
    API->>DB: Find user by hashed emailVerificationToken
    API->>API: Check expiry (24h)
    API->>DB: Set isVerified = true, clear token fields
    API-->>Browser: 200 { message: "Email verified" }
```

## 6. Password Reset Flow

Password reset uses a two-step flow: request a reset link, then submit the new password with the token. On successful reset, ALL active sessions are revoked (nuclear revocation).

```mermaid
sequenceDiagram
    participant Browser
    participant API as Express API
    participant DB as MongoDB
    participant Email as Email Queue

    Browser->>API: POST /api/v1/auth/forgot-password { email }
    API->>DB: Find user by email
    
    alt User not found
        API-->>Browser: 200 { message: "If email exists..." }
        Note over API: Same response regardless (anti-enumeration)
    end

    API->>API: Generate 32-byte hex token
    API->>API: SHA-256 hash for storage
    API->>DB: Save hash + 1-hour expiry
    API->>Email: Queue password reset email
    API-->>Browser: 200 { message: "If email exists..." }

    Note over Browser: User clicks link in email

    Browser->>API: POST /api/v1/auth/reset-password { token, newPassword }
    API->>API: Hash submitted token
    API->>DB: Find user by hashed passwordResetToken
    API->>API: Check expiry (1h)
    API->>API: bcrypt.hash(newPassword, 12)
    API->>DB: Update password, increment tokenVersion
    API->>DB: Revoke ALL refresh tokens for user
    API->>Email: Queue success confirmation email
    API-->>Browser: 200 { message: "Password reset successful" }
```

## 7. Cookie Configuration

The refresh token cookie is configured for maximum security while supporting future OAuth and payment integrations.

| Property | Value | Rationale |
|----------|-------|-----------|
| Name | refresh_token | Convention (snake_case) |
| Path | / | Visible to all routes (required for middleware.js) |
| HttpOnly | always true | JavaScript cannot read the cookie |
| Secure | true (production), false (dev) | HTTPS only in production |
| SameSite | Lax | Allows top-level navigations (OAuth redirects) |
| MaxAge (rememberMe: true) | 30 days | Persistent cookie |
| MaxAge (rememberMe: false) | not set (session cookie) | Expires on browser close |

Note: When rememberMe is false, the cookie has no MaxAge (session cookie — disappears on browser close), but the database record has a 7-day TTL for orphan cleanup. These are intentionally different.

## 8. Logout Flow

Logout supports single-device and all-device variants.

### Single Device Logout

```mermaid
sequenceDiagram
    participant Client
    participant API
    participant DB as MongoDB
    participant Redis
    participant BC as BroadcastChannel

    Client->>API: GET /api/v1/auth/logout (Bearer + Cookie)
    API->>DB: Revoke refresh token (isRevoked = true)
    API->>Redis: Blacklist access token JTI (TTL = remaining lifetime)
    API->>API: Clear refresh_token cookie
    API-->>Client: 200 { message: "Logged out" }
    Client->>Client: dispatch(clearCredentials)
    Client->>BC: postMessage({ type: "LOGOUT" })
    Client->>Client: Redirect to /login
```

### All Devices Logout

Logout-all increments tokenVersion on the User document, which invalidates all existing access tokens (they carry the old version). It also revokes ALL refresh tokens in MongoDB.

## 9. Cross-Tab Session Sync

The BroadcastChannel API synchronizes auth state across browser tabs. Each tab's AuthBootstrap component listens for messages on the 'auth_channel' channel.

| Event | Broadcaster | Other Tabs Action | Same-Tab Prevention |
|-------|------------|-------------------|---------------------|
| LOGIN | useLogin hook | Full page reload to / | sessionStorage: login_source = "local" |
| LOGOUT | useUserProfile hook | clearCredentials + redirect to /login + toast | sessionStorage: logout_source = "local" |

Stale flags (logout_source, login_source) are cleared on every AuthBootstrap mount to prevent ghost state from previous sessions.

## 10. Security Properties

| Property | Implementation | Status |
|----------|---------------|--------|
| Access token in memory only | Redux store, never persisted | Enforced |
| Separate JWT secrets | ACCESS_TOKEN_SECRET ≠ REFRESH_TOKEN_SECRET | Enforced |
| Anti-enumeration (login) | Same error for wrong password + unknown email | Enforced |
| Anti-enumeration (forgot-password) | Same response regardless of email existence | Enforced |
| Token reuse detection | Revoked + has replacement = nuke all sessions | Implemented (needs test) |
| Password reset revokes sessions | All refresh tokens revoked on reset | Implemented (needs test) |
| AuthBootstrap uses raw fetch | Not interceptor axios (prevents circular dep) | Enforced |
| Refresh uses separate axios | Not interceptor instance (prevents infinite loop) | Enforced |

## 11. Document Cross-References

| Topic | Document |
|-------|----------|
| System overview | 01-SYSTEM-OVERVIEW.md |
| Backend architecture | 02-BACKEND-ARCHITECTURE.md |
| Frontend architecture | 03-FRONTEND-ARCHITECTURE.md |
| Database schemas | 05-DATABASE-DESIGN.md |
| Infrastructure services | 06-INFRASTRUCTURE.md |
