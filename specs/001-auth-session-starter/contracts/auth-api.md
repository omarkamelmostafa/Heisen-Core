# Auth API Contracts

**Branch**: `001-auth-session-starter` | **Date**: 2026-03-10  
**Base Path**: `/api/v1/auth`

---

## POST /register

**Purpose**: Create a new user account and send a verification email.

**Request Body**:
```json
{
  "firstname": "string (3-16 chars, required)",
  "lastname": "string (3-16 chars, required)",
  "email": "string (valid email, required)",
  "password": "string (8-128 chars, min 1 upper + 1 lower + 1 digit + 1 special, required)"
}
```

**Success Response** (201):
```json
{
  "status": "success",
  "message": "Registration successful. Please check your email to verify your account.",
  "data": {
    "user": {
      "uuid": "string",
      "email": "string",
      "isVerified": false
    }
  }
}
```

**Error Responses**:
- `400` — Validation failure (password too weak, email format invalid)
- `409` — Email already registered
- `429` — Rate limit exceeded (3/hr/IP)

**Rate Limit**: 3 requests per hour per IP

---

## POST /login

**Purpose**: Authenticate a user, return an access token, and set a refresh token cookie.

**Request Body**:
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "accessToken": "string (JWT)",
    "user": {
      "uuid": "string",
      "email": "string",
      "firstname": "string",
      "lastname": "string",
      "isVerified": true
    }
  }
}
```

**Set-Cookie Header** (on success):
```
refresh_token=<opaque>; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth/refresh; Max-Age=604800; Domain=.example.com
```

**Error Responses**:
- `400` — Validation failure
- `401` — Invalid credentials (same message for wrong password or non-existent email — FR-028)
- `403` — Account not verified (instructs user to verify email — FR-005)
- `429` — Rate limit exceeded (5/15min/IP)

**Rate Limit**: 5 requests per 15 minutes per IP

---

## POST /refresh

**Purpose**: Exchange a valid refresh token for a new access token (and rotate the refresh token).

**Request**: No body. The refresh token is sent automatically by the browser via the path-restricted HttpOnly cookie.

**Cookie Required**: `refresh_token` (HttpOnly, path `/api/v1/auth/refresh`)

**Success Response** (200):
```json
{
  "status": "success",
  "data": {
    "accessToken": "string (JWT)"
  }
}
```

**Set-Cookie Header** (on success — rotation):
```
refresh_token=<new-opaque>; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth/refresh; Max-Age=604800; Domain=.example.com
```

**Error Responses**:
- `401` — Refresh token missing, expired, revoked, or reuse detected
- `429` — Rate limit exceeded (30/min/IP)

**Side Effects on Reuse Detection** (FR-016): If a rotated (already-used) token is presented, ALL refresh tokens for the user are revoked and a 401 is returned. The user must log in again on all devices.

**Rate Limit**: 30 requests per minute per IP

---

## GET /logout

**Purpose**: Invalidate the current device's refresh token and clear the cookie.

**Cookie Required**: `refresh_token`

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Logged out successfully."
}
```

**Set-Cookie Header** (clears cookie):
```
refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth/refresh; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0
```

**Error Responses**:
- `204` — No refresh token present (already logged out — idempotent)

---

## POST /logout-all

**Purpose**: Invalidate ALL refresh tokens for the current user across all devices.

**Authentication Required**: Valid access token in `Authorization: Bearer <token>` header.

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Logged out from all devices."
}
```

**Set-Cookie Header** (clears current device cookie):
```
refresh_token=; HttpOnly; Secure; SameSite=Lax; Path=/api/v1/auth/refresh; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Max-Age=0
```

**Side Effects**: Increments `user.tokenVersion` and revokes all `RefreshToken` documents for the user.

**Error Responses**:
- `401` — Not authenticated

---

## POST /verify-email

**Purpose**: Verify a user's email address using the token from the verification email.

**Request Body**:
```json
{
  "token": "string (required)"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Email verified successfully. You can now log in."
}
```

**Error Responses**:
- `400` — Token missing or invalid format
- `410` — Token expired (offers "resend verification email")
- `409` — Token already used

---

## POST /forgot-password

**Purpose**: Send a password reset email. Same response for valid and invalid emails (FR-020).

**Request Body**:
```json
{
  "email": "string (required)"
}
```

**Success Response** (200 — always, regardless of whether email exists):
```json
{
  "status": "success",
  "message": "If an account exists for this email, a password reset link has been sent."
}
```

**Error Responses**:
- `400` — Validation failure (email format invalid)
- `429` — Rate limit exceeded (3/hr/IP)

**Rate Limit**: 3 requests per hour per IP

---

## POST /reset-password

**Purpose**: Reset a user's password using the token from the reset email.

**Request Body**:
```json
{
  "token": "string (required)",
  "password": "string (8-128 chars, same strength rules as registration, required)"
}
```

**Success Response** (200):
```json
{
  "status": "success",
  "message": "Password reset successful. Please log in with your new password."
}
```

**Side Effects**: Invalidates the reset token (single-use), invalidates ALL refresh tokens for the user (FR-022), increments `tokenVersion`.

**Error Responses**:
- `400` — Token missing, password too weak
- `410` — Token expired
- `409` — Token already used

---

## Common Headers

All authenticated requests must include:
```
Authorization: Bearer <access-token>
```

All responses include:
```
Content-Type: application/json
X-Content-Type-Options: nosniff
```

CORS configuration (all auth endpoints):
```
Access-Control-Allow-Origin: <explicit-origin> (no wildcard)
Access-Control-Allow-Credentials: true
```
