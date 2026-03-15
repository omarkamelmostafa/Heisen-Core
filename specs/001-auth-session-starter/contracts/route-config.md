# Route Configuration Contract

**Branch**: `001-auth-session-starter` | **Date**: 2026-03-10  
**File**: `frontend/src/lib/config/route-config.js`

## Route Arrays

### AUTH_ROUTES (unauthenticated only)

Routes that are accessible **only** to unauthenticated users. Authenticated users navigating to these routes are redirected to `/dashboard`.

```javascript
export const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];
```

### PROTECTED_ROUTES (authenticated only)

Routes that require authentication. Unauthenticated users navigating to these routes are redirected to `/login` with a `returnUrl` query parameter preserving the intended destination.

```javascript
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/app",
  "/settings",
  "/profile",
];
```

### PUBLIC_ROUTES (always accessible)

Routes that are accessible regardless of authentication state. No redirects applied.

```javascript
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
];
```

## How to Add a New Route

### Scenario 1: New protected page (e.g., `/billing`)

Add the path to `PROTECTED_ROUTES`:

```javascript
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/app",
  "/settings",
  "/profile",
  "/billing",  // ← Added. Route guard auto-enforced (FR-026).
];
```

No additional code, middleware registration, or guard component changes are needed.

### Scenario 2: New auth page (e.g., `/magic-link`)

Add the path to `AUTH_ROUTES`:

```javascript
export const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
  "/magic-link",  // ← Added. Authenticated redirect auto-enforced.
];
```

### Scenario 3: New public page (e.g., `/pricing`)

Add the path to `PUBLIC_ROUTES`:

```javascript
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
  "/pricing",  // ← Added. Accessible always, no guards.
];
```

## Helper Functions Contract

```javascript
// Returns true if the path matches an auth route (exact or prefix)
export const isAuthRoute = (path) =>
  AUTH_ROUTES.some(route => path === route || path.startsWith(`${route}/`));

// Returns true if the path matches a protected route (exact or prefix)
export const isProtectedRoute = (path) =>
  PROTECTED_ROUTES.some(route => path === route || path.startsWith(`${route}/`));

// Returns true if the path matches a public route (exact or prefix)
export const isPublicRoute = (path) =>
  PUBLIC_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
```

## Enforcement

Route enforcement is handled in `frontend/src/middleware.js` (Next.js middleware). The middleware runs on every navigation request (excluding static assets) and:

1. Checks for valid authentication state (access token cookie or successful silent refresh)
2. Applies `isAuthRoute()` / `isProtectedRoute()` / `isPublicRoute()` checks
3. Redirects as appropriate

No additional per-page guard components are needed.
