# Data Model: Authentication and Session Management Starter Kit

**Branch**: `001-auth-session-starter` | **Date**: 2026-03-10

## Entity: User (MODIFY — `backend/model/User.js`)

### Fields Modified

| Field | Change | Before | After |
|-------|--------|--------|-------|
| `refreshToken` | **REMOVE** | `String, select: false, indexed` | Moved to `RefreshToken` model |
| `resetPasswordToken` | **KEEP** | `String, select: false, indexed` | No change — stays on User |
| `resetPasswordExpiresAt` | **KEEP** | `Date, select: false` | No change |
| `verificationToken` | **KEEP** | `String, select: false, indexed` | No change |
| `verificationTokenExpiresAt` | **KEEP** | `Date, select: false` | No change |
| `tokenVersion` | **KEEP** | `Number, default: 1` | Used for "logout all devices" — incremented on password change and explicit invalidation |
| `loginAttempts` | **REMOVE** | `Number, default: 0` | Spec excludes account lockout (deferred) |
| `isLocked` | **REMOVE** | `Boolean, default: false` | Spec excludes account lockout (deferred) |
| `lockUntil` | **REMOVE** | `Date` | Spec excludes account lockout (deferred) |
| `firstname` | **KEEP** | `String, required` | No change |
| `lastname` | **KEEP** | `String, required` | No change |
| `email` | **KEEP** | `String, required, unique, lowercase` | Already case-insensitive (FR-031 satisfied by `lowercase: true`) |
| `password` | **KEEP** | `String, required, select: false` | No change — bcrypt hashing done in controller |
| `isVerified` | **KEEP** | `Boolean, default: false` | No change |
| `isActive` | **KEEP** | `Boolean, default: true` | No change |
| `uuid` | **KEEP** | `String, uuidv4, unique` | No change — used in JWT claims |
| `lastLogin` | **KEEP** | `Date` | No change |
| `lastPasswordChange` | **KEEP** | `Date, select: false` | No change |
| `lastSecurityEvent` | **KEEP** | `Date, select: false` | No change |

### Methods Modified

| Method | Change | Reason |
|--------|--------|--------|
| `incrementLoginAttempts()` | **REMOVE** | Account lockout deferred |
| `resetLoginAttempts()` | **REMOVE** | Account lockout deferred |
| `isAccountLocked()` | **REMOVE** | Account lockout deferred |
| `findByEmailWithSecurity()` | **MODIFY** | Remove `+loginAttempts +isLocked +lockUntil` from select, remove `+refreshToken` |

### Pre-Save Hooks Modified

| Hook | Change | Reason |
|------|--------|--------|
| Password change → `tokenVersion++` | **KEEP** | Needed for "logout all devices" on password change |
| Sensitive change → `refreshToken = null` | **REMOVE** | Refresh tokens now in separate collection; invalidation uses `tokenVersion` increment |
| Auto-unlock logic | **REMOVE** | Account lockout deferred |

### Indexes

| Index | Status |
|-------|--------|
| `{ email: 1, isActive: 1 }` | **KEEP** |
| `{ verificationToken: 1, isVerified: 1 }` | **KEEP** |
| `{ resetPasswordToken: 1, isActive: 1 }` | **KEEP** |

---

## Entity: RefreshToken (NEW — `backend/model/RefreshToken.js`)

### Purpose

Represents an active device session. Each login creates one RefreshToken document. Supports multi-device sessions (FR-027), rotation (FR-015), and reuse detection (FR-016).

### Fields

| Field | Type | Required | Default | Index | Description |
|-------|------|----------|---------|-------|-------------|
| `token` | String | yes | — | unique, sparse | Hashed refresh token value (stored hashed, compared via `crypto.timingSafeEqual`) |
| `user` | ObjectId (ref: User) | yes | — | yes | Associated user |
| `isRevoked` | Boolean | no | `false` | yes (compound with `user`) | Whether this token has been revoked (logout, rotation, or reuse detection) |
| `replacedBy` | ObjectId (ref: RefreshToken) | no | `null` | — | Points to the RefreshToken that replaced this one during rotation. Used for reuse detection chain traversal. |
| `expiresAt` | Date | yes | — | TTL index | Token expiration (7 days from creation). MongoDB TTL index auto-deletes expired documents. |
| `issuedAt` | Date | no | `Date.now` | — | When the token was created |
| `userAgent` | String | no | — | — | User-Agent header from the login request (for session identification in "manage devices" UI, future feature) |
| `ipAddress` | String | no | — | — | IP address from the login request (for session identification) |
| `tokenVersion` | Number | no | — | — | Snapshot of user's `tokenVersion` at creation time. Used for "logout all" comparison. |

### Indexes

| Index | Type | Purpose |
|-------|------|---------|
| `{ token: 1 }` | Unique, sparse | Fast lookup by hashed token value |
| `{ user: 1, isRevoked: 1 }` | Compound | Find active tokens per user (for "logout all" and session listing) |
| `{ expiresAt: 1 }` | TTL (expireAfterSeconds: 0) | Auto-delete expired token documents |

### State Transitions

```
ACTIVE (isRevoked: false, replacedBy: null)
  ├─ ROTATED (isRevoked: true, replacedBy: <new token ID>) — on successful refresh
  ├─ REVOKED (isRevoked: true, replacedBy: null) — on logout or "logout all"
  └─ EXPIRED — auto-deleted by MongoDB TTL index after 7 days

ROTATED → REUSE DETECTED
  └─ If a ROTATED token is presented again:
     1. Find the entire replacement chain (follow replacedBy forward)
     2. Revoke ALL tokens in the chain
     3. Revoke ALL tokens for this user (nuclear option — theft detected)
```

### Validation Rules

- `token` must be present and non-empty
- `user` must reference a valid User document
- `expiresAt` must be in the future at creation time
- `tokenVersion` must match the user's current `tokenVersion` at verification time

---

## Entity: Verification Token (KEEP — embedded in User)

Stays embedded in `User.js` as `verificationToken` + `verificationTokenExpiresAt`. Single-use (cleared after verification). Expires after 24 hours (FR-007).

**No structural change.** Verification tokens are one-per-user and do not need multi-device support.

---

## Entity: Password Reset Token (KEEP — embedded in User)

Stays embedded in `User.js` as `resetPasswordToken` + `resetPasswordExpiresAt`. Single-use (cleared after reset). Expires after 1 hour (FR-021).

**No structural change.** Reset tokens are one-per-user and do not need multi-device support.

---

## Relationship Summary

```
User (1) ──── (N) RefreshToken
  ├── user._id = refreshToken.user
  ├── One user can have many active refresh tokens (one per device)
  └── user.tokenVersion compared to refreshToken.tokenVersion on each refresh

RefreshToken (1) ──── (0..1) RefreshToken (replacedBy)
  ├── Forms a rotation chain within a single device session
  └── Chain traversal detects reuse (theft detection)
```
