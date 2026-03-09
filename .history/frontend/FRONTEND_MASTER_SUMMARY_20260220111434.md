# FRONTEND_MASTER_SUMMARY.md
> **Generated**: 2026-02-20 | **Stack**: Next.js 15.5.4 · React 19.1 · Redux Toolkit 2.9 · Tailwind CSS v4 · Axios  
> **Purpose**: AI-ingestible system prompt for a dedicated Frontend Agent. Describes current architecture, identified issues, prioritised task list, and backend requirements.

---

## 🔎 1. Frontend Architecture Overview

### 1.1 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router) | 15.5.4 |
| UI Library | React | 19.1.0 |
| State Management | Redux Toolkit + redux-persist | 2.9.2 / 6.0.0 |
| HTTP Client | Axios | 1.12.2 |
| Styling | Tailwind CSS v4 + tw-animate-css | 4.x |
| Forms | react-hook-form + zod + @hookform/resolvers | 7.64 / 4.1.12 / 5.2.2 |
| UI Primitives | Radix UI (checkbox, label, separator, slot) | latest |
| Component Lib | shadcn/ui (partial – via `components.json`) | — |
| Animations | framer-motion | 12.23.22 |
| Icons | lucide-react | 0.545.0 |
| Cookies | js-cookie + universal-cookie | 3.0.5 / 8.0.1 |
| Dev Tooling | ESLint (flat config), @hookform/devtools | 9.x / 4.4.0 |

### 1.2 Directory Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Auth route group (login, signup, verify-email, forgot-password, reset-password)
│   │   ├── layout.jsx            # Root layout (StoreProvider, fonts, meta)
│   │   ├── page.jsx              # Landing / hero page
│   │   ├── not-found.jsx         # 404 page
│   │   └── globals.css           # Tailwind v4 theme tokens + base styles
│   │
│   ├── components/
│   │   ├── auth/                 # 10 sub-modules (login, signup, verify-email, forgot-password, reset-password, error, forms, panels, providers, shared)
│   │   ├── ui/                   # 10 primitives (button, card, checkbox, input, label, skeleton, logo, animated-logo, fantasy-loader, letters-pull-up)
│   │   └── utils/                # ExtensionErrorHandler (console noise suppressor)
│   │
│   ├── store/
│   │   ├── index.js              # configureStore + redux-persist (auth→sessionStorage, user→localStorage)
│   │   ├── root-reducer.js       # combineReducers({auth, user, ui})
│   │   ├── root-actions.js       # Barrel re-exports
│   │   ├── FLOW.js               # Documentation-only (architectural flow diagrams)
│   │   └── slices/
│   │       ├── auth/             # auth-slice, auth-thunks, auth-selectors, index
│   │       ├── user/             # user-slice, user-thunks, user-selectors, index
│   │       └── ui/               # ui-slice (562 LOC), ui-thunks, ui-selectors (13.6 KB), index
│   │
│   ├── services/
│   │   ├── api/
│   │   │   ├── client/           # BaseClient, PublicClient, PrivateClient (singletons)
│   │   │   ├── endpoints/        # AuthEndpoints, UserEndpoints, AdminEndpoints (classes)
│   │   │   └── refresh-queue.js  # Concurrent token refresh manager
│   │   ├── domain/               # auth-service, user-service (1008 LOC), notification-service, toast-service, ui-service, activity-service
│   │   └── storage/              # cookie-service, token-manager, storage-constants
│   │
│   ├── hooks/                    # useAppDispatch, useAppSelector, useAppStore, useErrorToggle, useLoadingSimulator, environment-debug
│   ├── lib/
│   │   ├── config/               # api-config.js (309 LOC), auth-content.js
│   │   ├── animations/           # Framer-motion presets
│   │   ├── validations/          # Zod schemas
│   │   ├── environment.js        # Env-aware flags
│   │   └── utils.js              # cn() helper (clsx + tailwind-merge)
│   ├── providers/                # StoreProvider (Redux + PersistGate)
│   └── middleware.js             # Edge middleware: route protection (cookie-based auth check)
│
├── .env.local                    # API_URL=localhost:4000, API_VERSION=1, timeout/retry env vars
├── .env.production               # Production env template
├── next.config.mjs               # EMPTY — no custom configuration
├── tailwind.config.js            # Custom fonts, animations, breakpoints (Tailwind v3 format — UNUSED by v4)
├── jsconfig.json                 # Path aliases (@/*, @/auth/*, @/ui/*, etc.) — some point to non-existent dirs
├── eslint.config.mjs             # Comprehensive flat config (import order, a11y, hooks, security rules)
├── postcss.config.mjs            # Tailwind v4 PostCSS plugin
└── components.json               # shadcn/ui configuration
```

### 1.3 Key Architectural Patterns

| Pattern | Implementation |
|---|---|
| **API Client** | Class-based hierarchy: `BaseClient` → `PublicClient` / `PrivateClient`. Singletons exported. |
| **Token Lifecycle** | Dual storage: cookies (for middleware + API interceptors) AND Redux sessionStorage (via redux-persist). Token refresh handled by **both** `RefreshQueue` and `TokenManager` (duplication). |
| **State Management** | 3 root slices (`auth`, `user`, `ui`). Manual `dispatch(startLoading())` pattern in thunks instead of `extraReducers` with builder notation. |
| **Middleware** | Next.js edge middleware checks `access_token` cookie; redirects unauthenticated users away from `/dashboard/*`, `/app/*` and authenticated users away from auth routes. |
| **Domain Services** | Singleton classes (`AuthService`, `UserService`, `NotificationService`) that import `store` directly for side-effects (notifications, logout). |
| **Endpoint Management** | Class-based endpoint registries with getter properties. Includes both implemented and planned (stub) endpoints in same file. |
| **Persistence** | `auth` slice → sessionStorage (whitelisted: `tokens`, `isAuthenticated`). `user` slice → localStorage (whitelisted: `preferences`, `theme`). `ui` slice → not persisted. |

---

## ⚠️ 2. Identified Issues

### 2.1 CRITICAL — Must Fix Before Production

| # | Issue | Location | Impact |
|---|---|---|---|
| C1 | **Dual token refresh systems** — `RefreshQueue` and `TokenManager` both implement refresh logic with their own queues, retry limits, and failure handlers. Race conditions possible. | `refresh-queue.js`, `token-manager.js` | Auth failures, infinite refresh loops |
| C2 | **Tokens stored in Redux sessionStorage** — `auth` slice persists `accessToken`/`refreshToken` to sessionStorage via redux-persist. Tokens should only live in HttpOnly cookies (set by backend) or at minimum only in the cookie-service layer, not in client-readable storage. | `store/index.js` L39-43 | XSS can exfiltrate tokens |
| C3 | **Empty `next.config.mjs`** — No security headers, no image domains, no redirects, no rewrites, no experimental flags, no output config. | `next.config.mjs` | Missing CSP headers, no image optimisation domains, no CORS proxy |
| C4 | **No Error Boundary** — Only `ExtensionErrorHandler` (console noise suppressor) exists. No React Error Boundary component wrapping routes. Unhandled render errors crash the entire app. | `components/utils/` | Full-page crash in production |
| C5 | **Services directly import `store` singleton** — `UserService`, `NotificationService`, `TokenManager`, `PrivateClient` all import `store` at module level. Creates circular dependency risk and makes unit testing impossible. | `domain/*.js`, `storage/token-manager.js` | Circular imports, untestable code |
| C6 | **`zoom: 0.9` on html AND body** — Forces 90% zoom globally, causing layout inconsistencies across devices and accessibility issues. | `globals.css` L135, L148 | Broken layouts, accessibility violation |
| C7 | **`confirmation.onConfirm`/`onCancel` stored in Redux** — Functions stored in Redux state are non-serializable; redux-persist will error or silently drop them. | `ui-slice.js` L77-78 | Runtime warnings, broken confirmations |

### 2.2 IMPORTANT — Should Fix

| # | Issue | Location | Impact |
|---|---|---|---|
| I1 | **~560 lines of commented-out code** in `user-service.js` (entire old implementation left in file). | `domain/user-service.js` L451-1008 | Code rot, confusion |
| I2 | **Commented-out old config** in `api-config.js` (30 lines), `eslint.config.mjs` (27 lines), `tailwind.config.js` (plugins). | Multiple files | Maintenance burden |
| I3 | **`FLOW.js` documentation file in `store/` directory** — A .js file that contains only comments. Should be a `.md` file or moved to docs. | `store/FLOW.js` | Confusing, bundled unnecessarily |
| I4 | **`combine.js` + `combined_data.txt` scattered across services** — Ad-hoc concatenation scripts polluting production source tree. | `services/api/client/`, `services/api/endpoints/`, `services/domain/` | Source tree pollution |
| I5 | **`headache.txt` in `src/`** — Non-code file in source root. | `src/headache.txt` | Source tree pollution |
| I6 | **UI slice is a God Object** (562 LOC, 15+ state domains: theme, layout, modals, notifications, loading, toast, confirmation, navigation, responsive, scroll, forms, search, pagination, preferences, errors, performance). | `ui-slice.js` | Unmaintainable, every UI dispatch triggers listeners |
| I7 | **`tailwind.config.js` is Tailwind v3 format but Tailwind v4 is installed** — v4 uses `@theme` in CSS (`globals.css` already does this). The `tailwind.config.js` file is likely ignored. | `tailwind.config.js` | Dead config, developer confusion |
| I8 | **jsconfig.json includes non-existent paths** — Aliases like `@/auth/*` → `src/features/auth/*` but `src/features/` doesn't exist. Also `include` references `../to-delete/`. | `jsconfig.json` L18-21, L43-44 | IDE resolution failures |
| I9 | **No TypeScript** — Entire codebase is JavaScript. No type safety for store slices, API responses, props, or service contracts. | Project-wide | Bugs from type mismatches |
| I10 | **Thunks use manual `dispatch(startLoading())` instead of `extraReducers`** — The accepted RTK pattern for async thunks is `extraReducers` with `pending`/`fulfilled`/`rejected` cases. Manual dispatch creates race conditions. | `auth-thunks.js` | Race conditions with loading states |
| I11 | **Metadata description is boilerplate** (`"Generated by create next app"`). | `layout.jsx` L23 | SEO failure |
| I12 | **Duplicate error normalisation** — `BaseClient.normalizeError()`, `AuthService.normalizeError()`, `UserService.normalizeError()` all have their own implementation. Should be centralised. | Multiple files | Inconsistent error shapes |
| I13 | **`NotificationService` accesses `window`/`localStorage` in constructor** — Breaks SSR. Constructor calls `initialize()` which calls `localStorage.getItem()`. | `notification-service.js` L28-29 | SSR crash |
| I14 | **No request cancellation on unmount** — Components dispatching thunks don't abort in-flight requests when unmounted. | `auth-thunks.js`, `user-thunks.js` | Memory leaks, stale state updates |
| I15 | **Selectors not memoized** — `selectAuthStatus` creates a new object every call, causing unnecessary re-renders. No `createSelector` (reselect) used. | `auth-selectors.js` L21-25 | Excessive re-renders |

### 2.3 ENHANCEMENTS — Nice to Have

| # | Issue | Location | Impact |
|---|---|---|---|
| E1 | **No testing infrastructure** — No test runner, no test files, no testing-library setup. | Project-wide | Zero test coverage |
| E2 | **No loading/error/success pattern abstraction** — Each thunk manually manages loading state; no shared `createAppThunk` wrapper. | Store slices | Boilerplate across all thunks |
| E3 | **No route-level code splitting** — `next/dynamic` not used for heavy components. | Components | Larger initial bundle |
| E4 | **No Suspense boundaries** — No `loading.jsx` files in app router for streaming SSR. | `app/` directory | No progressive rendering |
| E5 | **Cookie config not using `HttpOnly`** — Comment says "handled by backend" but `js-cookie` can't set HttpOnly. Tokens set client-side are readable by XSS. | `storage-constants.js` L16 | Security gap |
| E6 | **No app-wide toast/notification UI component** — State management exists in `ui-slice` but no rendering component exists. | `components/` | Notifications dispatched but never shown |
| E7 | **Dual cookie libraries** — Both `js-cookie` and `universal-cookie` are dependencies. Only `js-cookie` is used. | `package.json` | Unnecessary bundle size |
| E8 | **No PWA configuration** — No `manifest.json`, no service worker, no offline support. | Project-wide | No installability |
| E9 | **No internationalization (i18n)** — Hardcoded English strings everywhere. | Project-wide | Not localizable |
| E10 | **Auth content config** (`auth-content.js`, 11KB) is a large content file — should come from a CMS or at minimum be split per page. | `lib/config/auth-content.js` | Monolithic content file |
| E11 | **`#__next` selector in globals.css** — App Router doesn't use `#__next`; that's Pages Router. Dead CSS rule. | `globals.css` L162-164 | Dead code |

---

## 📋 3. Task List

### 🔴 CRITICAL

- [x] **C1**: Consolidate token refresh — remove `TokenManager` and let `RefreshQueue` be the single refresh orchestrator. Update `PrivateClient` to use only `RefreshQueue`.
  - *Completed On: 2026-02-20*
- [x] **C2**: Remove token persistence from Redux — stop whitelisting `tokens` in `authPersistConfig`. Tokens should only be managed by `cookie-service`. Update selectors/thunks to read tokens from cookies, not Redux state.
  - *Completed On: 2026-02-20*
- [x] **C3**: Configure `next.config.mjs` — add security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), image domains, API rewrites/proxy, and compression.
  - *Completed On: 2026-02-20*
- [ ] **C4**: Create a React Error Boundary component wrapping `{children}` in `layout.jsx`. Add `error.jsx` and `global-error.jsx` files in `app/` for App Router error handling.
- [ ] **C5**: Decouple services from store — inject `dispatch` via a `ServiceRegistry` or pass it as a parameter from thunks. Remove direct `import { store }` from domain services.
- [ ] **C6**: Remove `zoom: 0.9` from `globals.css`. Use responsive design or `transform: scale()` if zoom is truly required.
- [ ] **C7**: Remove `onConfirm`/`onCancel` from Redux state. Use a callback registry pattern or React context for confirmation dialogs.

### 🟡 IMPORTANT

- [ ] **I1–I2**: Remove all commented-out code from `user-service.js`, `api-config.js`, `eslint.config.mjs`, `tailwind.config.js`, `store-provider.jsx`.
- [ ] **I3**: Convert `FLOW.js` to `FLOW.md` and move to a `docs/` folder (or delete if covered by this summary).
- [ ] **I4–I5**: Delete `combine.js`, `combined_data.txt`, `How-To-Use.js`, `headache.txt` from source tree. Move utility scripts to a `scripts/` folder outside `src/`.
- [ ] **I6**: Split `ui-slice` into focused slices: `theme-slice`, `modal-slice`, `notification-slice`, `loading-slice`, `navigation-slice`, `form-slice`, `search-slice`, `pagination-slice`.
- [ ] **I7**: Delete `tailwind.config.js` (Tailwind v4 uses CSS-based config in `globals.css`).
- [ ] **I8**: Clean `jsconfig.json` — remove aliases pointing to non-existent paths (`@/auth/*`, `@/dashboard/*`, `@/users/*`, `@/settings/*`, `@/forms/*`, `@/layout/*`, `@/api/*`, `@/assets/*`, `@/types/*`). Remove `../to-delete/` from `include`.
- [ ] **I9**: Add TypeScript — rename files to `.ts`/`.tsx`, add `tsconfig.json`, type store slices, API responses, and service contracts.
- [ ] **I10**: Refactor thunks to use `createAsyncThunk` with `extraReducers` (pending/fulfilled/rejected) instead of manual `dispatch(startLoading())`.
- [ ] **I11**: Update metadata in `layout.jsx` — proper title template, description, OG tags, favicon, manifest link.
- [ ] **I12**: Create a single `normalizeError()` utility in `lib/utils/` and use it across all services.
- [ ] **I13**: Guard `NotificationService.initialize()` with `typeof window !== 'undefined'` check before accessing `localStorage` or `Notification` API.
- [ ] **I14**: Add AbortController support to thunks — pass `signal` via `thunkAPI.signal` and wire to axios requests.
- [ ] **I15**: Memoize selectors using `createSelector` from `@reduxjs/toolkit` — especially `selectAuthStatus` and compound selectors.

### 🟢 ENHANCEMENTS

- [ ] **E1**: Set up Vitest + React Testing Library. Add unit tests for slices, services, and critical components.
- [ ] **E2**: Create `createAppThunk` helper that wraps `createAsyncThunk` with standardized loading/error/success handling.
- [ ] **E3**: Use `next/dynamic` for heavy components (e.g., `AnimatedLogoLoader`, `FantasyLoader`).
- [ ] **E4**: Add `loading.jsx` files in route segments for streaming SSR.
- [ ] **E5**: Implement HttpOnly cookie flow — backend sets tokens via `Set-Cookie` header, frontend never touches raw tokens.
- [ ] **E6**: Build `<NotificationProvider>` and `<Toast>` components that render from `ui.notifications` state.
- [ ] **E7**: Remove `universal-cookie` from dependencies (only `js-cookie` is used).
- [ ] **E8**: Add PWA support — `manifest.json`, service worker, offline fallback.
- [ ] **E9**: Add i18n framework (e.g., `next-intl`) for multi-language support.
- [ ] **E10**: Split `auth-content.js` into per-page content files or integrate a headless CMS.
- [ ] **E11**: Remove `#__next` CSS rule from `globals.css`.

---

## 🔗 4. Backend Requirements for Integration

The frontend currently implements authentication flows that call the backend API. Before full integration of additional features, the following backend endpoints and capabilities are required:

### 4.1 Currently Functional Backend Endpoints (Verified)

| Endpoint | Method | Purpose |
|---|---|---|
| `/auth/login` | POST | User login |
| `/auth/register` | POST | User registration |
| `/auth/logout` | GET | Session termination |
| `/auth/refresh` | POST | Token refresh |
| `/auth/verify-email` | POST | Email verification |
| `/auth/forgot-password` | POST | Password reset request |
| `/auth/reset-password` | POST | Password reset execution |

### 4.2 Required Backend Endpoints (Not Yet Implemented)

#### User Profile Management
| Endpoint | Method | Frontend Consumer |
|---|---|---|
| `GET /users/profile` | GET | `UserService.getProfile()` |
| `PUT /users/profile` | PUT | `UserService.updateProfile()` |
| `POST /users/profile/avatar` | POST (multipart) | `UserService.uploadAvatar()` |
| `DELETE /users/profile/avatar` | DELETE | `UserService.deleteAvatar()` |

#### User Preferences
| Endpoint | Method | Frontend Consumer |
|---|---|---|
| `GET /users/preferences` | GET | `UserService.getPreferences()` |
| `PATCH /users/preferences` | PATCH | `UserService.updatePreferences()` |

#### Security & Account
| Endpoint | Method | Frontend Consumer |
|---|---|---|
| `POST /users/security/password` | POST | `UserService.changePassword()` |
| `POST /users/security/email` | POST | `UserService.updateEmail()` |
| `POST /users/security/account` | POST (delete) | `UserService.deleteAccount()` |
| `GET /users/security/logs` | GET | `UserService.getSecurityLogs()` |

#### Session Management
| Endpoint | Method | Frontend Consumer |
|---|---|---|
| `GET /users/sessions` | GET | `UserService.getSessions()` |
| `DELETE /users/sessions/:id` | DELETE | `UserService.revokeSession()` |

### 4.3 Backend Configurations Required

| Requirement | Detail |
|---|---|
| **CORS** | Backend must allow `Origin: http://localhost:3000` (dev) and production domain. Must allow `Authorization`, `X-Request-ID`, `X-Requested-With` headers. |
| **HttpOnly Cookies** | Backend should set `access_token` and `refresh_token` as HttpOnly + Secure + SameSite=Strict cookies via `Set-Cookie` header instead of returning tokens in response body. This eliminates the need for client-side token storage. |
| **Standardized Error Format** | All API errors should return `{ success: false, message: string, details?: object, code?: string }`. Frontend `normalizeError()` depends on `response.data.message` and `response.data.details`. |
| **Pagination Contract** | Paginated endpoints should return `{ data: [], pagination: { page, limit, total, totalPages } }`. |
| **File Upload** | Avatar endpoint must accept `multipart/form-data` with field name `avatar`. Max size should be communicated via `MAX_CONTENT_LENGTH` response header or documented constant. |
| **Rate Limiting Headers** | Backend should return `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` headers. Frontend `api-config.js` has `TOO_MANY_REQUESTS` handling ready. |
| **Health Check** | `GET /health` endpoint for frontend connection validation (`PublicClient.healthCheck()`). |

### 4.4 API Contract Notes

- Frontend base URL construction: `${NEXT_PUBLIC_API_URL}/api/v${NEXT_PUBLIC_API_VERSION}` → e.g., `http://localhost:4000/api/v1`
- All auth endpoints are prefixed with `/auth/` (relative to base URL)
- All user endpoints are prefixed with `/users/` (relative to base URL)
- Token refresh sends `{ refreshToken }` in POST body to `/auth/refresh`
- Login expects `{ email, password }` and returns `{ user, tokens: { accessToken, refreshToken } }`

---

## 📘 5. Architecture Decision Notes (for AI Agent Context)

### Current State
The application is a **Fantasy Coach** platform. The frontend is currently **auth-only** — only authentication flows (login, signup, email verification, password reset) are implemented and wired to the backend. No dashboard, no app content, no user profile pages exist yet.

### What Works
- ✅ Auth flow is complete: login → signup → email verify → forgot password → reset password
- ✅ Token management with auto-refresh on 401
- ✅ Route protection via Next.js edge middleware
- ✅ Redux store with persistence (sessionStorage for auth, localStorage for preferences)
- ✅ Well-structured component hierarchy for auth pages
- ✅ Comprehensive ESLint configuration
- ✅ Design system tokens via Tailwind v4 CSS variables (light/dark mode support)

### What's Missing for Production
- ❌ Error boundaries and error pages
- ❌ Security headers in next.config
- ❌ Tests of any kind
- ❌ Type safety (TypeScript)
- ❌ Dashboard / app shell (post-auth experience)
- ❌ Notification/toast rendering components
- ❌ Loading states for route transitions
- ❌ Bundle optimization (no code splitting, no dynamic imports)
- ❌ SEO (boilerplate metadata, no OG tags, no sitemap)
- ❌ Accessibility audit
- ❌ CI/CD pipeline configuration

### File Ownership Rules (for AI Agent)
- **DO NOT modify**: anything in `/backend/`
- **Source of truth for endpoints**: `services/api/endpoints/*.js`
- **Source of truth for state shape**: `store/slices/*/`
- **Source of truth for theme tokens**: `app/globals.css` (NOT `tailwind.config.js`)
- **Source of truth for env config**: `.env.local` and `lib/config/api-config.js`

---

## 🔄 6. Execution Protocol (Agent Command Grammar & Operational Rules)

This section defines how the Frontend Execution Agent must interpret and execute tasks.

---

### 6.1 Command Formula

The agent only accepts commands in one of the following formats:

- `Start Task C1`
- `Start Task I6`
- `Start Task E3`

Where:
- C = Critical
- I = Important
- E = Enhancement
- The number corresponds exactly to the task ID in Section 3.

Any other instruction must be ignored unless explicitly clarified.

---

### 6.2 Execution Rules

When receiving a valid command (e.g., `Start Task C1`), the agent must:

1. Locate the exact task definition in Section 3.
2. Output a structured execution plan:
   - Objective
   - Architectural impact
   - Files to modify
   - Risk assessment
3. Wait for confirmation **before applying destructive changes** (if task involves deletion or major refactor).
4. Apply changes only related to that specific task.
5. Stop immediately after completing that task.

The agent MUST NOT:
- Execute multiple tasks in one run.
- Automatically move to the next task.
- Refactor unrelated modules.
- Introduce new architecture not described in this document.

---

### 6.3 Output Format Per Task

Every execution must follow this format:

### 🔧 Task: C1 — Consolidate Token Refresh

1. Summary of Problem  
2. Refactor Strategy  
3. Files Modified  
4. Code Changes  
5. Validation Checklist  
6. Post-Execution Notes  

After completion, the agent must end with:

`Task C1 completed. Awaiting next instruction.`

---

### 6.4 Task Order Enforcement

The agent must enforce the following priority:

1. All 🔴 CRITICAL tasks must be completed first.
2. 🟡 IMPORTANT tasks can only start after all CRITICAL tasks are done.
3. 🟢 ENHANCEMENTS can only start after CRITICAL and IMPORTANT are completed.

If a lower-priority task is requested prematurely, the agent must respond:

`Higher priority tasks remain incomplete. Please complete CRITICAL tasks first.`

---

### 6.5 Safety Rules

- Never modify `/backend/`.
- Never change API contracts without explicit instruction.
- Never remove legacy code until replacement is confirmed working.
- Never store authentication tokens in client-readable storage.
- Maintain compatibility with Next.js App Router architecture.

---

### 6.6 Completion Tracking

After each task is completed, the agent must:

- Mark the task as completed in Section 3.
- Add a short “Completed On” note under the task.
- Not modify other task statuses.