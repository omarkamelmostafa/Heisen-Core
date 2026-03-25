# FILE STRUCTURE AUDIT — NEW-STARTER
**Branch**: `001-auth-session-starter` | **Date**: March 25, 2026 | **Auditor**: Claude Code

---

## ANNOTATED FILE TREE

### Backend

```
├── backend/
│   ├── __tests__/
│   │   ├── integration/ (supertest integration suite)
│   │   │   ├── mocks/ (test doubles)
│   │   │   ├── auth-forgot-password.test.js
│   │   │   ├── auth-login.test.js
│   │   │   ├── auth-logout.test.js
│   │   │   ├── auth-refresh.test.js
│   │   │   ├── auth-register.test.js
│   │   │   ├── auth-reset-password.test.js
│   │   │   ├── auth-verify-email.test.js
│   │   │   ├── helpers.js
│   │   │   ├── rate-limiting.test.js
│   │   │   ├── setup.js (integration test bootstrap)
│   │   │   └── user-me.test.js
│   │   └── unit/ (logic-only unit suite)
│   │       ├── cookie-service.test.js
│   │       ├── crypto-utils.test.js
│   │       ├── hash-utils.test.js
│   │       ├── token-service.test.js
│   │       ├── token-utils.test.js
│   │       └── user-data-utils.test.js
│   ├── config/ (configuration modules)
│   │   ├── allowed-origins.js (cors whitelist)
│   │   ├── cloudinary.js (cloud storage config)
│   │   ├── connect-db.js (mongodb connection — FACTORY)
│   │   ├── cors-options.js (cors policy)
│   │   ├── redis.js (redis connection — FACTORY)
│   │   └── validate-env.js (startup env validation — SEALED)
│   ├── controllers/ (thin HTTP adapters)
│   │   ├── auth/ (auth endpoint handlers)
│   │   │   ├── auth-shared.js (response utilities)
│   │   │   ├── login.controller.js (login handler)
│   │   │   ├── logout.controller.js (logout handler)
│   │   │   ├── logout-all.controller.js (global logout)
│   │   │   ├── password-reset.controller.js (forgot + reset handlers)
│   │   │   ├── refresh.controller.js (token refresh)
│   │   │   ├── register.controller.js (registration)
│   │   │   ├── resend-2fa.controller.js (2fa resend)
│   │   │   ├── resend-verification.controller.js (email resend)
│   │   │   ├── verify-2fa.controller.js (2fa verification)
│   │   │   └── verify-email.controller.js (email verification)
│   │   ├── health/
│   │   │   └── health.controller.js (health check endpoint)
│   │   ├── test/
│   │   │   └── test-controller.js (test utilities)
│   │   └── user/ (user profile handlers — ❌ VIOLATION)
│   │       ├── change-password.controller.js
│   │       ├── email-change.controller.js
│   │       ├── toggle-2fa.controller.js
│   │       ├── update-profile.controller.js
│   │       ├── upload-avatar.controller.js
│   │       └── user.controller.js (direct DB access)
│   ├── middleware/ (request pipeline)
│   │   ├── auth/ (jwt & session verification)
│   │   │   ├── auth.js (legacy auth — SEALED)
│   │   │   ├── authTokenMiddleware.js (token verification — SEALED)
│   │   │   └── index.js (auth barrel export)
│   │   ├── core/ (logging, headers, parsing)
│   │   │   ├── api-version-middleware.js
│   │   │   ├── body-parser-middleware.js
│   │   │   ├── content-type-negotiation-middleware.js
│   │   │   ├── credentials-middleware.js
│   │   │   ├── index.js (core barrel export)
│   │   │   ├── logging-middleware.js (request logging — SEALED)
│   │   │   ├── logging-user-activity-middleware.js
│   │   │   └── request-id-middleware.js
│   │   ├── errors/ (global error handling)
│   │   │   ├── error-handler-middleware.js (centralized errors — SEALED)
│   │   │   ├── index.js
│   │   │   └── not-found-middleware.js
│   │   ├── security/ (helmet, rate limit, sanitize)
│   │   │   ├── helmet-middleware.js
│   │   │   ├── index.js
│   │   │   ├── rate-limiter-middleware.js
│   │   │   ├── rate-limiters.js (endpoint limit configs)
│   │   │   └── sanitize-middleware.js
│   │   ├── upload/
│   │   │   └── multer-middleware.js (file upload handler)
│   │   └── validation/
│   │       └── validation-middleware.js (express-validator)
│   ├── model/ (mongoose schemas)
│   │   ├── Album.js (legacy — ⚠️ ORPHAN)
│   │   ├── Favorite.js (legacy — ⚠️ ORPHAN)
│   │   ├── League.js (legacy — ⚠️ ORPHAN)
│   │   ├── Match.js (legacy — ⚠️ ORPHAN)
│   │   ├── Photo.js (legacy — ⚠️ ORPHAN)
│   │   ├── RefreshToken.js (session storage)
│   │   ├── Stats.js (legacy — ⚠️ ORPHAN)
│   │   ├── Team.js (legacy — ⚠️ ORPHAN)
│   │   └── User.js (user entity)
│   ├── routes/ (route definitions)
│   │   ├── auth/
│   │   │   └── auth-routes.js (auth route registry)
│   │   ├── health/
│   │   │   └── health-routes.js (health route)
│   │   ├── test/
│   │   │   └── test-routes.js (test routes)
│   │   └── user/
│   │       └── user-routes.js (user profile routes)
│   ├── services/ (domain services)
│   │   ├── auth/
│   │   │   ├── cookie-service.js (http-only cookie handler)
│   │   │   └── token-service.js (jwt operations)
│   │   ├── cloudinaryService.js (upload service)
│   │   └── email/ (nodemailer + templates)
│   │       ├── config/
│   │       │   └── email.config.js
│   │       ├── email.queue.js (bull email queue)
│   │       ├── email.service.js (email orchestration)
│   │       ├── providers/
│   │       │   ├── mail-test.js
│   │       │   └── mailtrap.provider.js
│   │       └── templates/
│   │           ├── auth/ (auth email templates)
│   │           ├── layouts/ (email HTML layouts)
│   │           ├── notifications/
│   │           └── template.engine.js
│   ├── use-cases/ (decoupled business logic)
│   │   ├── auth/ (auth flows)
│   │   │   ├── forgot-password.use-case.js
│   │   │   ├── index.js (barrel exports)
│   │   │   ├── login.use-case.js
│   │   │   ├── logout-all.use-case.js
│   │   │   ├── logout.use-case.js
│   │   │   ├── refresh-token.use-case.js
│   │   │   ├── register.use-case.js
│   │   │   ├── resend-2fa.use-case.js
│   │   │   ├── resend-verification.use-case.js
│   │   │   ├── reset-password.use-case.js
│   │   │   ├── verify-2fa.use-case.js
│   │   │   └── verify-email.use-case.js
│   │   └── user/ (user flows — ❌ INCOMPLETE)
│   │       ├── change-password.use-case.js
│   │       ├── confirm-email-change.use-case.js
│   │       ├── request-email-change.use-case.js
│   │       ├── toggle-2fa.use-case.js
│   │       ├── update-profile.use-case.js
│   │       └── upload-avatar.use-case.js
│   │       └── ⚠️ MISSING: get-user.use-case.js
│   ├── utilities/ (shared utilities)
│   │   ├── auth/ (crypto, hash, token)
│   │   │   ├── crypto-utils.js
│   │   │   ├── hash-utils.js
│   │   │   ├── token-utils.js
│   │   │   └── user-data-utils.js
│   │   ├── general/ (cookie, logger, response)
│   │   │   ├── cookie-utils.js
│   │   │   ├── emit-log.js (structured logger — SEALED)
│   │   │   ├── logger.js
│   │   │   └── response-manager.js (api response helper — SEALED)
│   │   └── utils.js (general helpers)
│   ├── validators/
│   │   ├── apply_email_fixes.cjs (migration script — ⚠️ ORPHAN)
│   │   ├── apply_fixes.cjs (migration script — ⚠️ ORPHAN)
│   │   ├── apply_fixes.js (migration script — ⚠️ ORPHAN)
│   │   ├── fix.js (migration script — ⚠️ ORPHAN)
│   │   └── validationRules.js (request validation rules)
│   ├── docs/ (swagger & api docs)
│   │   └── swagger/ (openAPI spec)
│   ├── errors/ (error classes)
│   ├── logs/ (runtime logs)
│   ├── public/
│   │   └── assets/
│   ├── app.js (ENTRY POINT — express setup)
│   └── index.js (ENTRY POINT — server bootstrap)
```

### Frontend

```
├── frontend/
│   ├── src/
│   │   ├── app/ (Next.js App Router)
│   │   │   ├── (auth)/ (auth route group)
│   │   │   │   ├── forgot-password/
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── login/
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── reset-password/
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── signup/
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── verify-email/
│   │   │   │   │   └── page.jsx
│   │   │   │   ├── auth-layout-wrapper.jsx
│   │   │   │   ├── error.jsx
│   │   │   │   ├── layout.jsx
│   │   │   │   └── loading.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── error.jsx
│   │   │   │   └── page.jsx
│   │   │   ├── error.jsx
│   │   │   ├── favicon.ico
│   │   │   ├── global-error.jsx
│   │   │   ├── globals.css
│   │   │   ├── layout.jsx
│   │   │   ├── loading.jsx
│   │   │   ├── not-found.jsx
│   │   │   └── page.jsx
│   │   ├── components/ (shared components)
│   │   │   ├── layout/
│   │   │   ├── providers/
│   │   │   ├── shared/
│   │   │   │   ├── error-boundary.jsx
│   │   │   │   └── error-fallback.jsx
│   │   │   ├── ui/ (shadcn/ui primitives)
│   │   │   │   ├── button.jsx
│   │   │   │   ├── sonner.jsx
│   │   │   │   └── ...
│   │   │   └── utils/
│   │   ├── features/ (feature modules)
│   │   │   ├── auth/ (auth feature domain)
│   │   │   │   ├── components/
│   │   │   │   │   ├── auth-bootstrap.jsx (❌ VIOLATION — uses dispatch)
│   │   │   │   │   ├── error/
│   │   │   │   │   ├── forgot-password/
│   │   │   │   │   ├── forms/
│   │   │   │   │   ├── guards/
│   │   │   │   │   │   ├── protected-guard.jsx
│   │   │   │   │   │   └── public-guard.jsx
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── panels/
│   │   │   │   │   ├── providers/
│   │   │   │   │   ├── reset-password/
│   │   │   │   │   ├── shared/
│   │   │   │   │   ├── signup/
│   │   │   │   │   └── verify-email/
│   │   │   │   └── hooks/ (business logic)
│   │   │   │       ├── useForgotPassword.js
│   │   │   │       ├── useLogin.js
│   │   │   │       ├── useResetPassword.js
│   │   │   │       ├── useSignup.js
│   │   │   │       └── useVerifyEmail.js
│   │   │   └── user/ (user feature domain)
│   │   │       ├── components/
│   │   │       ├── config/
│   │   │       └── hooks/
│   │   │           ├── useChangeEmail.js
│   │   │           ├── useChangePassword.js
│   │   │           ├── useEditProfile.js
│   │   │           ├── useProfilePhoto.js
│   │   │           ├── useSignOutAll.js
│   │   │           ├── useToggle2fa.js
│   │   │           └── useUserProfile.js
│   │   ├── hooks/ (global hooks — ⚠️ EMPTY)
│   │   ├── i18n/ (internationalization)
│   │   ├── lib/ (application utilities)
│   │   │   ├── animations/
│   │   │   ├── config/
│   │   │   ├── utils/
│   │   │   ├── validations/
│   │   │   ├── environment.js
│   │   │   ├── notify.js (toast facade — SEALED)
│   │   │   └── utils.js
│   │   ├── middleware.js (Next.js middleware)
│   │   ├── providers/
│   │   ├── services/ (api abstraction)
│   │   │   ├── api/
│   │   │   │   ├── client/
│   │   │   │   ├── endpoints/
│   │   │   │   └── interceptors/
│   │   │   ├── auth/
│   │   │   ├── domain/
│   │   │   ├── storage/
│   │   │   └── ui/
│   │   └── store/ (Redux Toolkit)
│   │       ├── slices/
│   │       │   ├── auth/
│   │       │   ├── notifications/
│   │       │   ├── ui/
│   │       │   └── user/
│   │       ├── utils/
│   │       ├── index.js
│   │       ├── root-actions.js
│   │       ├── root-reducer.js
│   │       └── store-accessor.js
```

### Project Root (Non-Source)

```
├── specs/001-auth-session-starter/ (feature documentation)
├── .speckit/ (architecture governance)
├── .agent/ .agents/ .claude/ .cursor/ (agent configs — ⚠️ ARCHIVE CANDIDATE)
├── .history/ (file history — ⚠️ ARCHIVE CANDIDATE)
├── .vscode/ .kilocode/ .opencode/ .windsurf/ (IDE configs)
├── to-delete/ (cleanup staging — ⚠️ ARCHIVE CANDIDATE)
├── tree-maker/ (utility scripts)
├── agents/ (audit reports)
```

---

## STRUCTURAL VIOLATIONS

| File | Rule Broken | Impact | Fix |
|------|-------------|--------|-----|
| `backend/controllers/user/user.controller.js` | Controller directly accesses User model | Violates use-case pattern; business logic in controller | Create `backend/use-cases/user/get-user.use-case.js` and delegate |
| `frontend/src/features/auth/components/auth-bootstrap.jsx` | Component imports `useDispatch` | UI layer depends on Redux directly | Move bootstrap logic to `features/auth/hooks/useAuthBootstrap.js`, component calls hook |
| `frontend/src/features/auth/components/guards/protected-guard.jsx` | Component imports `useDispatch` | Acceptable for guards (architectural exception) | Document exception in `.speckit/constitution.md` |
| `frontend/src/features/auth/components/guards/public-guard.jsx` | Component imports `useDispatch` | Acceptable for guards (architectural exception) | Document exception in `.speckit/constitution.md` |

---

## ORPHANS & DEAD CODE

| File/Directory | Last Known Purpose | Recommendation |
|----------------|-------------------|----------------|
| `backend/model/Album.js` | Legacy sports app model | Archive or delete if unused |
| `backend/model/Favorite.js` | Legacy sports app model | Archive or delete if unused |
| `backend/model/League.js` | Legacy sports app model | Archive or delete if unused |
| `backend/model/Match.js` | Legacy sports app model | Archive or delete if unused |
| `backend/model/Photo.js` | Legacy sports app model | Archive or delete if unused |
| `backend/model/Stats.js` | Legacy sports app model | Archive or delete if unused |
| `backend/model/Team.js` | Legacy sports app model | Archive or delete if unused |
| `backend/validators/apply_*.cjs/js` | Migration scripts from earlier dev | Move to `scripts/migrations/` or delete |
| `backend/validators/fix.js` | Migration script | Move to `scripts/migrations/` or delete |
| `frontend/src/hooks/` | Empty directory | Remove if unused, or add global hooks |
| `.history/` | File versioning history | Archive to external storage |
| `to-delete/` | Cleanup staging | Review and delete contents |
| `.agent/` `.agents/` | Agent workflow definitions | Keep if actively used, else archive |

---

## ARCHITECTURE HEALTH SCORE

| Dimension | Score | Notes |
|-----------|-------|-------|
| **Layer Separation** | 8/10 | User controller bypasses use-case layer; auth-bootstrap violates component purity |
| **Naming Consistency** | 9/10 | Minor mismatch: `password-reset.controller.js` vs `reset-password.use-case.js` (verb-noun ordering) |
| **Coverage Completeness** | 9/10 | Missing `get-user.use-case.js` for user controller; all other domains complete |
| **Seal Integrity** | 10/10 | No infrastructure files duplicated; middleware/services properly sealed |

**Overall: 9/10** — Production-grade with minor pattern violations in user domain.

---

## PHASE 3.4 — TOAST UX POLISH (COMPLETED)

**Status**: ✅ COMPLETE | **Date**: March 25, 2026

### Changes Implemented

| Batch | Scope | Files Modified | Status |
|-------|-------|----------------|--------|
| Batch 1 | Core redesign | `src/lib/notify.js`, `src/components/ui/sonner.jsx`, `src/app/layout.jsx` | ✅ |
| Batch 2 | Call site migration + alias removal | 12 hook files + notify.js cleanup | ✅ |

### Architecture Changes

**Before**: Plain object export with method wrappers  
**After**: Static class with centralized configuration

### Migration Summary

| Metric | Count |
|--------|-------|
| Files migrated | 12 |
| `notify.*` calls replaced | 34 |
| `notify.warning()` → `NotificationService.warn()` | 5 |
| New `loading()` method added | 1 |
| Deprecated alias removed | 1 |

### Verification

- [x] Zero files import `{ notify }` from `@/lib/notify`
- [x] Zero `notify.` method calls remain in codebase
- [x] Toaster props consolidated into `sonner.jsx`
- [x] Position synced via `NotificationService.position` getter
- [x] All 7 fixed toast IDs preserved

### Files Modified (Batch 2)

`auth-bootstrap.jsx`, `useLogin.js`, `useSignup.js`, `useVerifyEmail.js`, `useChangeEmail.js`, `useChangePassword.js`, `useEditProfile.js`, `useProfilePhoto.js`, `useSignOutAll.js`, `useToggle2fa.js`, `useUserProfile.js`, `base-client.js`, `notify.js`

---

## VERIFICATION SUMMARY

### ✅ Passing Checks
- [x] Every feature domain has `/components` + `/hooks` minimum (frontend auth, user)
- [x] Every backend domain has `/controllers` + `/use-cases` + `/routes` minimum
- [x] No business logic files directly in `/middleware`
- [x] Every `/use-cases` file has matching `/controllers` file (auth domain)
- [x] Every route file registered in `app.js` (auth, health, user, test)
- [x] No orphaned test files (all tests have matching source)
- [x] Infrastructure files not duplicated

### ❌ Failing Checks
- [ ] Controller → Use-Case parity in user domain (1 violation: user.controller.js)
- [ ] UI layer purity (1 violation: auth-bootstrap.jsx uses dispatch)

### 📋 Recommendations
1. **Priority 1**: Create `get-user.use-case.js` and refactor `user.controller.js` to use it
2. **Priority 2**: Extract Redux logic from `auth-bootstrap.jsx` into `useAuthBootstrap.js` hook
3. **Priority 3**: Archive legacy models (Album, Favorite, League, Match, Photo, Stats, Team) or move to deprecated package
4. **Priority 4**: Document `useDispatch` exception for route guards in constitution
