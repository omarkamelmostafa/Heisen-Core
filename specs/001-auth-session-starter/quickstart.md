# Quickstart: Authentication and Session Management Starter Kit

**Branch**: `001-auth-session-starter` | **Date**: 2026-03-10

## Prerequisites

- Node.js (ESM)
- MongoDB running (local or Atlas)
- Redis running (for token blacklisting)
- Environment variables configured (see `.env.example`)

## Environment Variables (auth-specific)

```env
# Token lifetimes
ACCESS_TOKEN_EXPIRY=15m
ACCESS_TOKEN_SECRET=<random-256-bit-secret>
REFRESH_TOKEN_EXPIRY=7d
REFRESH_TOKEN_SECRET=<different-random-256-bit-secret>

# JWT claims
JWT_ISSUER=new-starter-backend-v1
JWT_AUDIENCE=new-starter-web-client

# Cookie domain (for subdomain sharing)
COOKIE_DOMAIN=.example.com

# CORS
CORS_ORIGIN=http://localhost:3000

# Email (use existing email service config)
# EMAIL_* variables per existing .env.example
```

## Integration Scenarios

### Scenario 1: Register → Verify → Login → Use API → Logout

1. **Register**: `POST /api/v1/auth/register` with `{ firstname, lastname, email, password }`
2. **Receive verification email**: Check inbox for link containing verification token
3. **Verify**: `POST /api/v1/auth/verify-email` with `{ token }` from email link
4. **Login**: `POST /api/v1/auth/login` with `{ email, password }`
   - Response body contains `accessToken`
   - Browser receives `refresh_token` HttpOnly cookie (path: `/api/v1/auth/refresh`)
5. **Access protected resource**: Include `Authorization: Bearer <accessToken>` header
6. **Logout**: `GET /api/v1/auth/logout`
   - Server revokes refresh token, clears cookie
   - Frontend clears Redux state

### Scenario 2: Silent Token Refresh

1. Access token expires (after 15 minutes)
2. Next API call returns 401
3. Axios interceptor queues the failed request
4. Interceptor calls `POST /api/v1/auth/refresh` (browser auto-sends cookie)
5. Response contains new `accessToken` + Set-Cookie with rotated `refresh_token`
6. Interceptor updates Redux state with new access token
7. Queued request is retried with new token — user sees no interruption

### Scenario 3: Page Refresh / New Tab Bootstrap

1. User refreshes page (F5) or opens new tab
2. App initialization calls `POST /api/v1/auth/refresh`
3. Browser sends `refresh_token` cookie automatically
4. Response restores `accessToken` in Redux state
5. User is authenticated without any prompt — no localStorage or sessionStorage used

### Scenario 4: Multi-Device Sessions

1. User logs in on laptop → `RefreshToken` A created
2. User logs in on phone → `RefreshToken` B created (independent)
3. User logs out on laptop → Only `RefreshToken` A revoked, phone still works
4. User selects "logout all devices" → All `RefreshToken` records for user revoked
5. All devices must re-authenticate

### Scenario 5: Refresh Token Theft Detection

1. User logs in → `RefreshToken` X issued
2. User uses app → Token X rotated to Token Y
3. Attacker replays stolen Token X
4. Server detects X is already rotated (`isRevoked: true, replacedBy: Y`)
5. Server revokes ALL tokens for user (nuclear option)
6. All devices forced to re-login — theft contained

### Scenario 6: Password Reset with Session Invalidation

1. User requests reset: `POST /api/v1/auth/forgot-password` with `{ email }`
2. User receives email with reset link
3. User submits new password: `POST /api/v1/auth/reset-password` with `{ token, password }`
4. Server updates password, invalidates ALL refresh tokens, increments `tokenVersion`
5. User must log in again on all devices with new password

## Adding a New Protected Route

1. Add the path to `PROTECTED_ROUTES` in `frontend/src/lib/config/route-config.js`
2. Create the page component in `frontend/src/app/<path>/page.jsx`
3. Done — route guard auto-enforced, no additional code needed (FR-026)
