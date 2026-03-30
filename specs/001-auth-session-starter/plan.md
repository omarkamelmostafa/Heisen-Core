# Implementation Plan: Authentication and Session Management Starter Kit

**Branch**: `001-auth-session-starter` | **Date**: 2026-03-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/001-auth-session-starter/spec.md`

## Summary

Implement a production-grade authentication system with multi-device session support, refresh token rotation with theft detection, and array-based route protection. The project already has significant auth infrastructure (JWT token service, cookie service, all 7 auth routes, Next.js middleware with silent refresh, Axios interceptor with refresh queue). The primary architectural change is extracting the single `refreshToken` field from the `User` model into a dedicated `RefreshToken` model to enable multi-device sessions, rotation chain tracking, and reuse detection.

## Technical Context

**Language/Version**: Node.js (ESM, `"type": "module"`) — Express.js backend, Next.js 15 frontend  
**Primary Dependencies**: Express.js, Mongoose, jsonwebtoken, bcrypt, ioredis, Axios, Redux Toolkit, Next.js App Router  
**Storage**: MongoDB via Mongoose, Redis (ioredis + Bull)  
**Testing**: None — no automated test framework per constitution §III.6  
**Target Platform**: Web (Server: Node.js, Client: Browser)  
**Project Type**: Full-stack web application (MERN + Next.js)  
**Performance Goals**: SC-003: bootstrap < 2s, SC-004/SC-006: invalidation < 1s  
**Constraints**: HttpOnly cookies only, no localStorage tokens, no CSS-in-JS, no CommonJS, no `console.log` in production  
**Scale/Scope**: Multi-device sessions per user, no device limit

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Rule | Section | Status | Evidence |
|------|---------|--------|----------|
| Backend ESM only, no CommonJS | §I.3 | ✅ PASS | All backend files use `import`/`export` |
| Tokens in HttpOnly cookies only | §I.5 | ✅ PASS | `cookie-service.js` sets `httpOnly: true` |
| API prefix `/api/v1/` | §I.2 | ✅ PASS | `auth-routes.js` mounted under `/api/v1/auth/` |
| Feature owns route, controller, service, model | §I.6 | ✅ PASS | `routes/auth/`, `controllers/auth/`, `services/auth/`, `model/User.js` |
| No test framework — no test files | §III.6 | ✅ PASS | No test files will be scaffolded |
| Tailwind CSS only — no CSS-in-JS | §III.3 | ✅ PASS | All frontend styling via Tailwind |
| No direct DOM manipulation in React | §III.4 | ✅ PASS | Declarative patterns used |
| `emitLogMessage()` — no `console.log` | §XI.1 | ⚠️ VIOLATION | Existing `refresh-queue.js`, `token-manager.js`, `token-service.js` use `console.log/error/warn`. Must be migrated to `emitLogMessage()`. |
| JWT claims: `iss`, `aud`, `exp` | §VIII.4 | ✅ PASS | `token-service.js` includes `iss`, `aud`; `exp` set via `expiresIn` |
| Passwords hashed with bcrypt | §VIII.3 | ✅ PASS | Existing auth flow uses bcrypt |
| Centralized error handler — no raw `res.status().json()` | §VI.5 | ⚠️ NEEDS REVIEW | Some controllers may use raw error responses — to be audited during implementation |
| Redux Toolkit only for global state | §V.1 | ✅ PASS | Auth slice in `store/slices/auth/` |
| No stack substitution | §III.1 | ✅ PASS | No new dependencies introduced |
| No invented architecture | §I.8 | ✅ PASS | RefreshToken model follows existing Mongoose pattern |
| XSS sanitization applied globally | §VIII.2 | ✅ PASS | `middleware/security/` already configured |

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| `console.log` → `emitLogMessage()` migration in refresh-queue.js, token-manager.js | Constitution §XI.1 mandates structured logging | `console.log` is not structured, not filterable in production, and violates the governance document |

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-session-starter/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── auth-api.md      # Auth endpoint contracts
│   └── route-config.md  # Route array contract
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── model/
│   ├── User.js                     # [MODIFY] Remove embedded token fields, add passwordChangedAt
│   └── RefreshToken.js             # [NEW] Dedicated refresh token model for multi-device
├── services/auth/
│   ├── token-service.js            # [MODIFY] Rewrite refresh logic for RefreshToken model + rotation chain
│   └── cookie-service.js           # [MODIFY] Restrict cookie path to /api/v1/auth/refresh, update maxAge to 7d
├── controllers/auth/
│   ├── register.controller.js      # [MODIFY] Hash password with bcrypt, create unverified user, send verification email
│   ├── login.controller.js         # [MODIFY] Create RefreshToken record per device, set path-restricted cookie
│   ├── logout.controller.js        # [MODIFY] Revoke RefreshToken record, add logout-all-devices
│   ├── refresh.controller.js       # [MODIFY] Rotate token, detect reuse via replacedBy chain
│   ├── verify-email.controller.js  # [MODIFY] Validate token expiry and single-use, mark user verified
│   ├── password-reset.controller.js # [MODIFY] Validate token expiry and single-use, invalidate all sessions
│   └── auth-shared.js              # [REVIEW] Shared controller utilities
├── routes/auth/
│   └── auth-routes.js              # [MODIFY] Add logout-all endpoint, apply rate limiting per endpoint
├── middleware/auth/
│   ├── auth.js                     # [REVIEW] Access token verification middleware
│   └── authTokenMiddleware.js      # [REVIEW] Token middleware
├── validators/
│   └── validationRules.js          # [MODIFY] Add password strength rules (8+ chars, upper, lower, digit, special)
├── services/email/                 # [MODIFY] Add verification and reset email templates
├── errors/                         # [REVIEW] Ensure centralized error handler coverage
└── utilities/general/
    └── emit-log.js                 # [EXISTS] Structured logger — all auth modules must use this

frontend/src/
├── lib/config/
│   └── route-config.js             # [REVIEW] Already has AUTH_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTES arrays
├── middleware.js                    # [MODIFY] Replace console.error with structured logging, verify bootstrap flow
├── services/
│   ├── auth/token-manager.js       # [MODIFY] Replace console.error with emitLogMessage equivalent
│   └── api/refresh-queue.js        # [MODIFY] Replace all console.log/error/warn, verify queue-then-retry flow
├── store/slices/auth/
│   └── auth-slice.js               # [MODIFY] Ensure access token is in Redux state only (not persisted)
├── app/(auth)/                     # [MODIFY] Auth pages: login, signup, verify-email, forgot-password, reset-password
└── app/dashboard/                  # [EXISTS] Protected dashboard page
```

**Structure Decision**: Web application with separated `backend/` and `frontend/` following the existing repository layout per constitution §II.1. No new top-level directories. New `RefreshToken` model added to `backend/model/` following existing Mongoose conventions.

## Handoff Readiness

Before handing off to Delivery Planner (`/speckit.tasks`), confirm all items below are complete:

```
- [x] research.md: all unknowns resolved, Decision/Rationale/Alternatives format
- [x] data-model.md: complete — RefreshToken model and User model modifications documented
- [x] contracts/: complete — auth-api.md (8 endpoints) and route-config.md
- [x] quickstart.md: skeleton written with integration scenarios per user story
- [x] Constitution Check: all gates PASS or VIOLATION + JUSTIFICATION in Complexity Tracking
- [x] Technical Context: zero NEEDS CLARIFICATION remaining
```
