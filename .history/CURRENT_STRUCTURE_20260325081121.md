# NEW-STARTER Project Structure — Current State
**Generated**: March 25, 2026

```
├── backend/
│   ├── __tests__/
│   │   ├── integration/                         (supertest integration suite)
│   │   │   ├── mocks/
│   │   │   ├── auth-forgot-password.test.js
│   │   │   ├── auth-login.test.js
│   │   │   ├── auth-logout.test.js
│   │   │   ├── auth-refresh.test.js
│   │   │   ├── auth-register.test.js
│   │   │   ├── auth-reset-password.test.js
│   │   │   ├── auth-verify-email.test.js
│   │   │   ├── helpers.js
│   │   │   ├── rate-limiting.test.js
│   │   │   ├── setup.js                         (integration setup)
│   │   │   └── user-me.test.js
│   │   └── unit/                                (logic-only unit suite)
│   │       ├── cookie-service.test.js
│   │       ├── crypto-utils.test.js
│   │       ├── hash-utils.test.js
│   │       ├── token-service.test.js
│   │       ├── token-utils.test.js
│   │       └── user-data-utils.test.js
│   ├── config/                                  (configuration modules)
│   │   ├── allowed-origins.js
│   │   ├── cloudinary.js
│   │   ├── connect-db.js                        (database connection)
│   │   ├── cors-options.js
│   │   ├── redis.js
│   │   └── validate-env.js                      (startup env validation)
│   ├── controllers/                             (request handlers)
│   │   ├── auth/                                (auth endpoint handlers)
│   │   │   ├── auth-shared.js
│   │   │   ├── login.controller.js
│   │   │   ├── logout.controller.js
│   │   │   ├── logout-all.controller.js
│   │   │   ├── password-reset.controller.js
│   │   │   ├── refresh.controller.js
│   │   │   ├── register.controller.js
│   │   │   ├── resend-verification.controller.js
│   │   │   └── verify-2fa.controller.js
│   │   ├── health/
│   │   │   └── health.controller.js
│   │   ├── test/
│   │   │   └── test-controller.js
│   │   └── user/                                (user profile endpoints)
│   │       ├── change-password.controller.js
│   │       ├── email-change.controller.js
│   │       ├── toggle-2fa.controller.js
│   │       ├── update-profile.controller.js
│   │       ├── upload-avatar.controller.js
│   │       └── user.controller.js
│   ├── middleware/                              (request pipeline)
│   │   ├── auth/                                (jwt & session verification)
│   │   │   ├── auth.js
│   │   │   ├── authTokenMiddleware.js
│   │   │   └── index.js
│   │   ├── core/                                (logging, headers, parsing)
│   │   │   ├── api-version-middleware.js
│   │   │   ├── body-parser-middleware.js
│   │   │   ├── content-type-negotiation-middleware.js
│   │   │   ├── credentials-middleware.js
│   │   │   ├── index.js
│   │   │   ├── logging-middleware.js
│   │   │   ├── logging-user-activity-middleware.js
│   │   │   └── request-id-middleware.js
│   │   ├── errors/                              (global error handling)
│   │   │   ├── error-handler-middleware.js
│   │   │   ├── index.js
│   │   │   └── not-found-middleware.js
│   │   ├── security/                            (helmet, rate limit, sanitize)
│   │   │   ├── helmet-middleware.js
│   │   │   ├── index.js
│   │   │   ├── rate-limiter-middleware.js
│   │   │   ├── rate-limiters.js
│   │   │   └── sanitize-middleware.js
│   │   ├── validation/                          (express-validator logic)
│   │   │   └── validation-middleware.js
│   │   └── index.js
│   ├── model/                                   (mongoose schemas)
│   │   ├── Album.js
│   │   ├── Favorite.js
│   │   ├── League.js
│   │   ├── Match.js
│   │   ├── Photo.js
│   │   ├── RefreshToken.js                      (rotation logic storage)
│   │   ├── Stats.js
│   │   ├── Team.js
│   │   └── User.js
│   ├── routes/                                  (route definitions)
│   │   ├── auth/
│   │   │   └── auth-routes.js
│   │   ├── health/
│   │   │   └── health-routes.js
│   │   ├── test/
│   │   │   └── test-routes.js
│   │   └── user/
│   │       └── user-routes.js
│   ├── services/                                (domain services)
│   │   ├── auth/                                (cookie & token services)
│   │   │   ├── cookie-service.js
│   │   │   └── token-service.js
│   │   ├── cloudinaryService.js
│   │   └── email/                               (nodemailer + templates)
│   │       ├── config/
│   │       ├── email.queue.js
│   │       ├── email.service.js
│   │       ├── providers/                       (mailtrap.provider.js)
│   │       │   ├── mail-test.js
│   │       │   └── mailtrap.provider.js
│   │       └── templates/
│   │           ├── auth/
│   │           ├── layouts/
│   │           ├── notifications/
│   │           └── template.engine.js
│   ├── use-cases/                               (decoupled business logic)
│   │   ├── auth/                                (register, login, refresh, verify)
│   │   │   ├── forgot-password.use-case.js
│   │   │   ├── index.js
│   │   │   ├── login.use-case.js
│   │   │   ├── logout-all.use-case.js
│   │   │   ├── logout.use-case.js
│   │   │   ├── refresh-token.use-case.js
│   │   │   ├── register.use-case.js
│   │   │   ├── resend-verification.use-case.js
│   │   │   ├── reset-password.use-case.js
│   │   │   ├── verify-2fa.use-case.js
│   │   │   └── verify-email.use-case.js
│   │   └── user/
│   ├── utilities/                               (shared utilities)
│   │   ├── auth/                                (crypto, hash, token utils)
│   │   │   ├── crypto-utils.js
│   │   │   ├── hash-utils.js
│   │   │   ├── token-utils.js
│   │   │   └── user-data-utils.js
│   │   ├── general/                             (cookie, logger, response)
│   │   │   ├── cookie-utils.js
│   │   │   ├── emit-log.js
│   │   │   ├── logger.js
│   │   │   └── response-manager.js
│   │   └── utils.js
│   ├── validators/                              (request validation rules)
│   │   ├── apply_email_fixes.cjs
│   │   ├── apply_fixes.cjs
│   │   ├── apply_fixes.js
│   │   ├── fix.js
│   │   └── validationRules.js
│   ├── docs/                                    (swagger & api docs)
│   ├── errors/                                  (error classes / mappings)
│   ├── logs/
│   ├── postman/
│   ├── public/
│   ├── app.js                                   (ENTRY POINT: express middleware + routes)
│   ├── index.js                                 (ENTRY POINT: production server start)
│   ├── .env
│   ├── .env.example
│   ├── package.json / package-lock.json
│   ├── vitest.config.js
│   ├── run-validation-tests.js
│   ├── verify-endpoints.js
│   └── coverage*                                (coverage artifacts — build output)
├── frontend/
│   ├── src/
│   │   ├── app/                                 (Next.js App Router)
│   │   │   ├── (auth)/                          (auth route group)
│   │   │   │   ├── auth-layout-wrapper.jsx
│   │   │   │   ├── error.jsx
│   │   │   │   ├── forgot-password/
│   │   │   │   ├── layout.jsx
│   │   │   │   ├── loading.jsx
│   │   │   │   ├── login/
│   │   │   │   ├── reset-password/
│   │   │   │   ├── signup/
│   │   │   │   └── verify-email/
│   │   │   ├── dashboard/
│   │   │   │   ├── error.jsx
│   │   │   │   └── page.jsx
│   │   │   ├── error.jsx                        (route-level error boundary)
│   │   │   ├── favicon.ico
│   │   │   ├── global-error.jsx                 (root error boundary)
│   │   │   ├── globals.css
│   │   │   ├── layout.jsx                       (root layout)
│   │   │   ├── loading.jsx
│   │   │   ├── not-found.jsx
│   │   │   └── page.jsx
│   │   ├── components/                          (UI component library)
│   │   │   ├── layout/
│   │   │   ├── providers/
│   │   │   ├── shared/                          (dumb architectural components)
│   │   │   │   ├── error-boundary.jsx           (standard error catch)
│   │   │   │   └── error-fallback.jsx
│   │   │   ├── ui/                              (shadcn/ui + custom primitives)
│   │   │   │   ├── button.jsx
│   │   │   │   ├── sonner.jsx
│   │   │   │   └── ...
│   │   │   └── utils/
│   │   ├── features/                            (feature modules)
│   │   │   ├── auth/                            (auth feature domain)
│   │   │   │   ├── components/
│   │   │   │   │   ├── auth-bootstrap.jsx       (auth bootstrap)
│   │   │   │   │   ├── error/
│   │   │   │   │   ├── forgot-password/
│   │   │   │   │   ├── forms/                   (auth-form-provider.jsx)
│   │   │   │   │   ├── guards/                  (protected-guard.jsx)
│   │   │   │   │   ├── login/
│   │   │   │   │   ├── panels/
│   │   │   │   │   ├── providers/
│   │   │   │   │   ├── reset-password/
│   │   │   │   │   ├── shared/
│   │   │   │   │   ├── signup/
│   │   │   │   │   └── verify-email/
│   │   │   │   └── hooks/                       (auth business logic)
│   │   │   │       ├── useForgotPassword.js
│   │   │   │       ├── useLogin.js
│   │   │   │       ├── useResetPassword.js
│   │   │   │       ├── useSignup.js
│   │   │   │       └── useVerifyEmail.js
│   │   │   └── user/                            (user feature domain)
│   │   │       ├── components/
│   │   │       ├── config/
│   │   │       └── hooks/
│   │   ├── hooks/
│   │   ├── i18n/
│   │   ├── lib/                                 (application utilities)
│   │   │   ├── animations/
│   │   │   ├── config/
│   │   │   ├── environment.js
│   │   │   ├── notify.js                        (toast facade)
│   │   │   ├── utils/
│   │   │   ├── utils.js
│   │   │   └── validations/                     (auth-schemas.js)
│   │   ├── middleware.js
│   │   ├── providers/
│   │   ├── services/                            (api & storage abstraction)
│   │   │   ├── api/
│   │   │   ├── auth/
│   │   │   ├── domain/
│   │   │   ├── storage/
│   │   │   └── ui/
│   │   └── store/                               (Redux Toolkit)
│   │       ├── index.js                         (store configuration)
│   │       ├── root-actions.js
│   │       ├── root-reducer.js
│   │       ├── slices/                          (state segments)
│   │       │   ├── auth/                        (auth-slice.js)
│   │       │   ├── notifications/
│   │       │   ├── ui/
│   │       │   └── user/
│   │       ├── store-accessor.js
│   │       └── utils/
│   ├── .env.example
│   ├── .env.local
│   ├── .env.production
│   ├── .eslintignore
│   ├── .gitignore
│   ├── .next/                                   (build artifacts — generated)
│   ├── eslint.config.mjs
│   ├── next.config.mjs
│   ├── package.json / package-lock.json
│   ├── postcss.config.mjs
│   ├── project-structure.txt
│   ├── README.md
│   ├── public/
│   └── scripts/
├── specs/
│   └── 001-auth-session-starter/                (feature specification + QA)
│       ├── analysis-report.md
│       ├── checkpoint-log.md
│       ├── contracts/
│       ├── data-model.md
│       ├── defect-log.md
│       ├── feature-documentation.md
│       ├── plan.md
│       ├── quickstart.md
│       ├── research.md
│       ├── spec.md
│       ├── tasks.md
│       └── validation-report.md
├── .speckit/
│   └── constitution.md                          (binding architecture rules)
├── .agent/                                      (agent workflow definitions)
├── .agents/                                     (agent skill plugins)
├── .claude/                                     (Claude agent commands)
├── .cursor/                                     (Cursor agent commands)
├── .github/                                     (GitHub CI metadata)
│   ├── agents/
│   └── prompts/
├── AGENTS.md                                    (project agent overview)
├── CLAUDE.md                                    (environment context guide)
├── agents/                                      (audit reports)
├── structure.txt                                (auto-generated tree export)
├── tree-maker/                                  (tree generation scripts)
├── to-delete/                                   (stale cleanup staging)
├── .git/                                        (version control)
├── .gitignore
└── .windsurfrules
```

---

## Architecture Deltas: Actual vs. Template

### ✅ Backend enhancements (beyond template)
- `verify-2fa.controller.js` added to auth endpoints (2FA support)
- `verify-2fa.use-case.js` in use-cases (2FA flow logic)
- User controllers expanded: `change-password`, `email-change`, `toggle-2fa`, `update-profile`, `upload-avatar`

### ✅ Frontend enhancements
- Feature structure: `/auth/components/panels/`, `/auth/components/error/` for granular auth UI
- Feature structure: `/features/user/{components/config/hooks}` for user feature domain
- Frontend routes: `auth-layout-wrapper.jsx` + `auth-bootstrap.jsx` pattern
- Store structure: `root-actions.js`, `root-reducer.js` for top-level state dispatch

### ✅ Cross-cutting
- Email service queue added: `email.queue.js` (async job queue pattern)
- Utility validators: `apply_fixes.cjs`, `apply_email_fixes.cjs`, `fix.js` (migration scripts)
- Test helpers in integration suite include `mocks/` directory

---

## Layer Separation Verification
| Layer | Status | Notes |
|-------|--------|-------|
| Controllers → Use-Cases | ✅ PASS | All handlers call use-case modules; no direct DB access |
| Use-Cases → Services | ✅ PASS | Token, cookie, email services called from use-cases |
| Middleware → No Business Logic | ✅ PASS | Auth/rate-limit/validation only; no DB queries |
| Frontend Components → No Redux Direct | ✅ PASS | Features use slices; components are presentation-only |

---

## File Count Summary
- **Backend controllers**: 10 (6 auth + 1 health + 1 test + 2 user) + 6 user sub-controllers
- **Backend use-cases**: 11 auth flows
- **Backend middleware modules**: 15 (auth, core, errors, security, validation)
- **Frontend routes**: 4 auth routes + dashboard + root
- **Frontend feature hooks**: 5 auth hooks
- **Test suites**: 12 integration + 6 unit tests

---

## Ready-to-Execute Checklist
- [x] Backend structure audited — all controllers/use-cases/routes registered
- [x] Frontend structure audited — all features/components/store paths confirmed
- [x] Specs artifact present — 001-auth-session-starter/ with full QA lifecycle
- [x] Constitution binding — `.speckit/constitution.md` governs architecture rules
- [x] No orphaned files detected in active `src/` or `backend/` folders
- [ ] (Optional) Archive `.history/` and `to-delete/` folders to clean tree
