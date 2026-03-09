# Frontend Master Summary & Task Roadmap

**Project:** Fantasy Coach (NEW-STARTER)  
**Scope:** Frontend only (`frontend/` folder)  
**Generated:** 2025-02-12  

---

# PART 1 — PROJECT SUMMARY

## 1.1 Project Overview

The frontend is a **Next.js 15** application for "Fantasy Coach" with App Router. It focuses on **authentication flows** (login, signup, verify-email, forgot-password, reset-password) and uses **Redux Toolkit** for state, **axios** for API calls, and **Tailwind CSS** for styling. The home page is still the default Next.js template; auth pages are built with forms and animations but **do not yet call the real API** (they use simulated delays and `console.log`). Backend auth endpoints exist and are documented; the frontend has the service layer and thunks ready but pages are not wired to them.

## 1.2 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 15.5.4 (App Router, Turbopack) |
| React | 19.1.0 |
| State | Redux Toolkit 2.9.2, react-redux 9.2.0, redux-persist 6.0.0 |
| HTTP | Axios 1.12.2 |
| Forms | react-hook-form 7.64.0, @hookform/resolvers 5.2.2, Zod 4.1.12 |
| UI / Styling | Tailwind CSS 4, Radix UI (checkbox, label, separator, slot), class-variance-authority, clsx, tailwind-merge |
| Animation | Framer Motion 12.23.22 |
| Icons | Lucide React 0.545.0 |
| Cookies | js-cookie 3.0.5, universal-cookie 8.0.1 |

## 1.3 Architecture Pattern

- **App Router** with route groups: `(auth)` for login, signup, verify-email, forgot-password, reset-password.
- **Feature-based components** under `components/auth/` (login, signup, forgot-password, reset-password, verify-email, forms, panels, shared, error, providers).
- **Service layer**: `services/api/` (clients, endpoints, refresh-queue), `services/domain/` (auth-service, user-service, etc.), `services/storage/` (cookie-service, token-manager).
- **Redux**: single store with persisted auth (sessionStorage) and user (localStorage); slices for auth, user, ui.
- **No RTK Query**; all API calls go through domain services that use axios clients.

## 1.4 Folder Structure Breakdown

```
frontend/
├── public/                    # Static assets, images, favicon
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Auth route group
│   │   │   ├── layout.jsx      # Auth layout (EnvironmentDebug, DevWrapper)
│   │   │   ├── auth-layout-wrapper.jsx
│   │   │   ├── login/, signup/, verify-email/, forgot-password/, reset-password/
│   │   │   │   ├── page.jsx, loading.jsx, error.jsx each
│   │   ├── layout.jsx          # Root layout (StoreProvider, ExtensionErrorHandler)
│   │   ├── page.jsx             # Home (default Next.js template)
│   │   ├── not-found.jsx       # 404 page
│   │   ├── globals.css
│   │   └── AnimatedLogoLoader/page.jsx
│   ├── components/
│   │   ├── auth/               # Auth feature components
│   │   │   ├── error/          # Error boundary, dev wrapper, simulators
│   │   │   ├── forgot-password/, login/, reset-password/, signup/, verify-email/
│   │   │   ├── forms/          # AuthFormProvider, FormField, AuthSubmitButtons
│   │   │   ├── panels/         # AuthRightPanel, content card
│   │   │   ├── providers/      # AuthProviders (Google, Facebook placeholders)
│   │   │   └── shared/         # Password strength, match indicator
│   │   ├── ui/                 # Reusable: Button, Input, Card, Checkbox, Label, Loaders, Logo, Skeleton
│   │   └── utils/              # ExtensionErrorHandler
│   ├── deepseek/               # Duplicate/alternate store + services (NOT used by app)
│   ├── hooks/                  # useSimulatedLoading, useErrorToggle, environment-debug, redux
│   ├── lib/
│   │   ├── animations/auth/    # authAnimations.js
│   │   ├── config/             # api-config.js, auth-content.js
│   │   ├── environment.js
│   │   ├── utils.js
│   │   └── validations/        # auth-schemas.js (Zod)
│   ├── providers/              # StoreProvider (Redux + PersistGate)
│   ├── services/
│   │   ├── api/                # base-client, public-client, private-client, refresh-queue, endpoints
│   │   ├── domain/             # auth-service, user-service, notification-service, etc.
│   │   └── storage/            # cookie-service, token-manager, storage-constants
│   ├── store/
│   │   ├── index.js            # configureStore, persist config
│   │   ├── root-reducer.js
│   │   ├── root-actions.js, FLOW.js
│   │   └── slices/
│   │       ├── auth/           # auth-slice, auth-thunks, auth-selectors
│   │       ├── user/           # user-slice, user-thunks, user-selectors
│   │       └── ui/             # ui-slice, ui-thunks, ui-selectors
│   └── middleware.js           # Next.js middleware (sets x-pathname header for auth routes)
├── components.json             # shadcn/ui style config
├── tailwind.config.js, postcss.config.mjs
├── next.config.mjs
├── jsconfig.json
└── package.json
```

## 1.5 Core Modules Description

- **Auth pages** (`app/(auth)/*/page.jsx`): Each uses `AuthFormProvider` + Zod schema, local state for loading/success, and a **mock submit handler** (setTimeout, no Redux thunk or auth-service call). Social providers are disabled.
- **Auth components**: Forms (FormField, AuthSubmitButtons), headers, welcome sections, success states, and right-hand panel content driven by `auth-content.js`.
- **Store**: Auth slice (user, tokens, isAuthenticated, loading, error); User slice (profile, preferences); UI slice. Auth and user are persisted (session/local).
- **Auth service** (`services/domain/auth-service.js`): Implements login, register, logout, refreshToken, forgotPassword, resetPassword, verifyEmail against `authEndpoints`; planned methods (profile, 2FA, sessions, etc.) throw with console.warn.
- **API clients**: `BaseClient` (axios instance, interceptors, normalizeError), `publicClient` (no auth), `privateClient` (injects Bearer from cookie, 401 → refresh-queue → retry). Refresh-queue uses `tokenManager.refreshToken()`.
- **Token/cookie flow**: `cookieService` (js-cookie) for access/refresh tokens; `tokenManager` uses Redux `refreshTokens` thunk and cookieService; **tokens from login/refresh are not written to cookies** (see gaps).

## 1.6 Authentication Flow Analysis

- **Intended flow**: User submits form → page handler should call `dispatch(loginUser(credentials))` → thunk calls `authService.login()` → backend returns user + tokens → thunk dispatches `loginSuccess(response.data)` → Redux + persist store tokens; private client should send Bearer token.
- **Current flow**: Login/signup/forgot/reset/verify pages use local `handle*Submit` that only `console.log` and simulate delay. No `dispatch(loginUser(...))`, no `authService` call, no cookie or Redux update from API.
- **Gaps**:
  1. **No API wiring**: Auth pages do not dispatch auth thunks or call auth-service.
  2. **No token persistence to cookies**: `loginSuccess` only updates Redux; `privateClient.injectAuthToken` reads from `cookieService.getAccessToken()`, so after “login” cookies would still be empty.
  3. **Post-login redirect**: No redirect to dashboard or `/` after success.
  4. **Middleware**: Only adds `x-pathname`; no auth guard (redirect unauthenticated users from protected routes).
  5. **Reset-password**: No token/query param handling for the reset link (e.g. `?token=...`).

## 1.7 API Integration Overview

- **Base URL**: `lib/config/api-config.js` → `FULL_BASE_URL` = `NEXT_PUBLIC_API_URL` + `/api/v{version}` (e.g. `http://localhost:3001/api/v1`).
- **Endpoints**: `services/api/endpoints/auth-endpoints.js` defines getters like `LOGIN` → `${this.PREFIX}/...` with `PREFIX = "/api/v1/auth"`, so LOGIN = `/api/v1/auth/login`. The axios base URL is already `.../api/v1`, so combined URL becomes `.../api/v1/api/v1/auth/login` (**double prefix bug**). Endpoints should be relative to base (e.g. `/auth/login`).
- **Pattern**: Domain services (e.g. auth-service) use `publicClient`/`privateClient` and endpoint constants; they normalize responses and errors. No global API slice; each feature uses its own service and thunks.

## 1.8 State Management Overview

- **Store**: `store/index.js` builds `persistedRootReducer` from `reducers` (auth, user, ui). It incorrectly references `reducers.api` in `persistedRootReducer`, but `root-reducer.js` only exports `auth`, `user`, `ui` — **no `api` reducer**. This can cause runtime error or undefined reducer.
- **Persistence**: Auth (tokens, isAuthenticated) → sessionStorage; User (preferences, theme) → localStorage.
- **Usage**: Auth thunks dispatch sync actions (startLoading, loginSuccess, setError, setTokens, logout). Components do not yet use auth thunks; they use local state only.

## 1.9 UI/UX Structure

- **Design**: Tailwind + Radix primitives; content from `auth-content.js` (en); Framer Motion for page and list animations.
- **Auth layout**: Two-column on large screens (form left, `AuthRightPanel` right); single column on small.
- **Loading**: Per-page loading.jsx and `useSimulatedLoading(0)`; app-level `PersistGate` shows `AnimatedLogoLoader`.
- **Errors**: Error boundaries, dev-only error toggle, production error trigger; `ExtensionErrorHandler` suppresses extension noise in dev.
- **404**: Custom not-found with link back home.

## 1.10 Identified Issues / Gaps

| Issue | Location | Description |
|-------|----------|-------------|
| Auth pages not calling API | All auth pages | Handlers use setTimeout and console.log instead of dispatching thunks / calling auth-service. |
| Tokens not stored in cookies | Auth thunks / auth-service | loginSuccess and refresh only update Redux; privateClient reads from cookies, so authenticated requests would fail. |
| Double API path prefix | auth-endpoints.js | PREFIX includes `/api/v1`; base URL already has it, so requests hit `/api/v1/api/v1/auth/...`. |
| Undefined `reducers.api` | store/index.js | persistedRootReducer sets `api: reducers.api`, but root-reducer does not export `api`. |
| Refresh-queue / token return shape | refresh-queue.js, private-client.js | tokenManager.refreshToken() returns access token string; code uses newTokens.accessToken and processQueue(newTokens.accessToken), causing undefined. |
| Home page placeholder | app/page.jsx | Still default Next.js template; no links to login/signup or dashboard. |
| No auth route protection | middleware.js | No redirect of unauthenticated users from protected routes. |
| Reset-password token | reset-password/page.jsx | No reading of token from URL (e.g. query or route param) to send to API. |
| Social providers disabled | Auth pages | Google/Facebook shown but disabled; no OAuth flow. |
| Axios CancelToken deprecated | base-client.js, private-client.js | createCancelToken uses deprecated CancelToken; should use AbortController. |
| Console.log in store | root-reducer.js | Debug console.log for reducer types should be removed for production. |
| Duplicate deepseek folder | src/deepseek/ | Mirrors store + services; not imported anywhere; dead code. |

## 1.11 Technical Debt

- **Commented-out code**: Large blocks in auth-slice, auth-schemas, login page (alternate useLoginForm version), private-client (alternate handleAuthError).
- **Inconsistent error handling**: Some forms only console.error; no global toast or form-level error display from thunk errors.
- **No TypeScript**: Project is JavaScript; no type safety on API responses or Redux state.
- **Environment**: NEXT_PUBLIC_* used for API URL/version/timeout; .env not committed (assumed in .gitignore).

---

# PART 2 — TASK ROADMAP

Tasks are grouped and ordered by dependency and priority. **Do not execute until the roadmap is approved.**

---

## Critical Fixes

### Task ID: T001  
**Title:** Fix store reference to undefined `reducers.api`  
**Description:** Remove or replace `api: reducers.api` in `store/index.js`. Either add a minimal `api` reducer in `root-reducer.js` or remove the `api` key from `persistedRootReducer` so the store only includes auth, user, ui.  
**Why It's Needed:** Prevents potential runtime error and keeps store configuration consistent with actual reducers.  
**Dependencies:** None  
**Priority:** High  
**Estimated Complexity:** Small  

---

### Task ID: T002  
**Title:** Fix auth endpoint paths (double /api/v1 prefix)  
**Description:** Change auth-endpoints so path getters return paths relative to the axios base URL (e.g. `PREFIX = "/auth"`, so LOGIN = `/auth/login`). Ensure other endpoint files (user-endpoints, admin-endpoints) follow the same convention.  
**Why It's Needed:** Requests currently target wrong URLs (e.g. `/api/v1/api/v1/auth/login`); backend expects `/api/v1/auth/login`.  
**Dependencies:** None  
**Priority:** High  
**Estimated Complexity:** Small  

---

### Task ID: T003  
**Title:** Fix refresh-queue and private-client token shape after refresh  
**Description:** Ensure token flow is consistent: either have `tokenManager.refreshToken()` return `{ accessToken }` or have refresh-queue and private-client use the returned string as the access token (no `.accessToken`). Fix processQueue and retry header to use the correct value.  
**Why It's Needed:** After 401 retry, the Authorization header and queued retries use `undefined` because the return value is a string.  
**Dependencies:** None  
**Priority:** High  
**Estimated Complexity:** Small  

---

### Task ID: T004  
**Title:** Persist auth tokens to cookies on login/refresh  
**Description:** After successful login or token refresh, write access and refresh tokens to cookies via `cookieService.setTokens(...)` so that `privateClient` can attach the Bearer token. Do this in the auth thunks (or in auth-service normalization) and ensure refresh thunk and tokenManager also update cookies when new tokens are received.  
**Why It's Needed:** Redux and sessionStorage hold tokens but privateClient reads from cookies; without this, authenticated requests never send a token.  
**Dependencies:** T003 (so refresh path is correct)  
**Priority:** High  
**Estimated Complexity:** Medium  

---

## Core Feature Completion

### Task ID: T005  
**Title:** Wire login page to auth API and Redux  
**Description:** Replace the mock `handleLoginSubmit` in login page with `dispatch(loginUser(credentials))`. Use thunk pending/fulfilled/rejected (e.g. from useAppSelector/useAppDispatch or getState) to drive loading and error state. Display validation/API errors in the UI.  
**Why It's Needed:** Core user flow; login must call backend and update app state.  
**Dependencies:** T002, T004  
**Priority:** High  
**Estimated Complexity:** Medium  

---

### Task ID: T006  
**Title:** Wire signup page to auth API and Redux  
**Description:** Replace mock signup submit with `dispatch(registerUser(userData))`. Handle success (e.g. redirect to verify-email or show message) and errors. Align form field names with backend (e.g. firstName/lastName/email/password).  
**Why It's Needed:** New users must be able to register.  
**Dependencies:** T002, T004  
**Priority:** High  
**Estimated Complexity:** Medium  

---

### Task ID: T007  
**Title:** Wire forgot-password page to auth API  
**Description:** Replace mock submit with call to auth-service forgotPassword (or a dedicated thunk). Show success state with the submitted email and handle errors.  
**Why It's Needed:** Users must be able to request a password reset.  
**Dependencies:** T002  
**Priority:** High  
**Estimated Complexity:** Small  

---

### Task ID: T008  
**Title:** Wire reset-password page to auth API and token  
**Description:** Read reset token from URL (query param or segment), replace mock submit with auth-service resetPassword (token + new password). Handle success and errors; optionally redirect to login.  
**Why It's Needed:** Password reset flow must complete via backend.  
**Dependencies:** T002  
**Priority:** High  
**Estimated Complexity:** Medium  

---

### Task ID: T009  
**Title:** Wire verify-email page to auth API  
**Description:** Replace mock verify and resend with auth-service verifyEmail and (if backend supports) resend verification. Dispatch verifyEmail thunk; on success update auth state and redirect or show success.  
**Why It's Needed:** Email verification must be functional.  
**Dependencies:** T002, T004  
**Priority:** High  
**Estimated Complexity:** Medium  

---

### Task ID: T010  
**Title:** Post-login and post-verification redirect  
**Description:** After successful login or email verification, redirect to a dashboard or home (e.g. `/` or `/dashboard`). Use returnUrl from query if present.  
**Why It's Needed:** Users expect to land in the app after auth success.  
**Dependencies:** T005, T009  
**Priority:** High  
**Estimated Complexity:** Small  

---

### Task ID: T011  
**Title:** Replace home page with app landing and auth links  
**Description:** Replace default Next.js template with a simple landing: app name, short description, links to Login and Sign Up (and Dashboard if authenticated). Optionally use auth state from Redux to show different CTAs.  
**Why It's Needed:** Entry point for users and clear navigation to auth.  
**Dependencies:** None (can be done early)  
**Priority:** Medium  
**Estimated Complexity:** Small  

---

### Task ID: T012  
**Title:** Add auth guard middleware for protected routes  
**Description:** In Next.js middleware, read auth state (e.g. from cookie or session) and redirect unauthenticated users from protected paths (e.g. `/dashboard`, `/app`) to `/login` with returnUrl. Allow public routes (login, signup, forgot-password, etc.).  
**Why It's Needed:** Protects authenticated-only pages.  
**Dependencies:** T004 (cookies as source of truth for middleware)  
**Priority:** Medium  
**Estimated Complexity:** Medium  

---

## Enhancements

### Task ID: T013  
**Title:** Centralized error display for auth forms  
**Description:** Use Redux auth error (or thunk error) in auth forms to show a persistent error message or toast. Ensure thunk errors are passed to the UI and cleared on new submit or navigation.  
**Why It's Needed:** Better UX than console-only errors.  
**Dependencies:** T005 (or any page using thunks)  
**Priority:** Medium  
**Estimated Complexity:** Small  

---

### Task ID: T014  
**Title:** Enable or hide social auth providers  
**Description:** Either implement OAuth (Google/Facebook) with backend or remove/disable the social buttons and content so the UI matches actual capabilities.  
**Why It's Needed:** Avoid misleading “Continue with Google” that does nothing.  
**Dependencies:** Backend OAuth support if enabling  
**Priority:** Low  
**Estimated Complexity:** Medium (if implementing) / Small (if removing)  

---

### Task ID: T015  
**Title:** Reset-password deep link and token handling  
**Description:** Ensure reset-password page is reachable via link (e.g. `/reset-password?token=...`). Validate token presence and show appropriate message if missing or expired.  
**Why It's Needed:** Email links must work end-to-end.  
**Dependencies:** T008  
**Priority:** Medium  
**Estimated Complexity:** Small  

---

## Refactoring

### Task ID: T016  
**Title:** Remove or repurpose deepseek folder  
**Description:** Delete `src/deepseek/` or merge any unique logic into `store/` and `services/`, then remove the duplicate folder. Update any docs that reference it.  
**Why It's Needed:** Reduces confusion and duplicate code.  
**Dependencies:** None  
**Priority:** Low  
**Estimated Complexity:** Small  

---

### Task ID: T017  
**Title:** Remove debug console.log from root-reducer  
**Description:** Remove the console.log statements that print reducer types in `store/root-reducer.js`.  
**Why It's Needed:** Cleaner production behavior.  
**Dependencies:** None  
**Priority:** Low  
**Estimated Complexity:** Small  

---

### Task ID: T018  
**Title:** Replace Axios CancelToken with AbortController  
**Description:** In base-client and private-client, replace createCancelToken/CancelToken usage with AbortController and signal so request cancellation is modern and compatible with current axios.  
**Why It's Needed:** CancelToken is deprecated.  
**Dependencies:** None  
**Priority:** Low  
**Estimated Complexity:** Small  

---

### Task ID: T019  
**Title:** Trim commented-out code in auth and API files  
**Description:** Remove or archive large commented blocks in auth-slice, auth-schemas, login page, private-client, and similar files. Keep only comments that explain non-obvious behavior.  
**Why It's Needed:** Improves readability and reduces noise.  
**Dependencies:** None  
**Priority:** Low  
**Estimated Complexity:** Small  

---

## Optimization

### Task ID: T020  
**Title:** Reduce base-client logging in production  
**Description:** Guard request/response logging in base-client (and private-client if needed) with `NODE_ENV === 'development'` or a config flag so production builds don’t log every API call.  
**Why It's Needed:** Less noise and smaller log payloads in production.  
**Dependencies:** None  
**Priority:** Low  
**Estimated Complexity:** Small  

---

# PART 3 — EXECUTION MODE

After this roadmap is approved:

1. **Start a task** by saying: `Start Task <Task ID>` (e.g. `Start Task T001`).
2. I will then:
   - Propose an implementation plan
   - List required file changes
   - Provide concrete code edits
   - Explain the logic and any follow-up steps

**Stop conditions respected:**

- No backend changes.
- No task execution until you approve the roadmap.
- No skipping of the architectural analysis above.

---

**End of Frontend Master Summary & Task Roadmap**
