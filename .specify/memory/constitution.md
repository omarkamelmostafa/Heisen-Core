# Fantasy Coach App — Project Constitution

> **Highest-authority governance document.** All downstream agents — discovery, planning, task decomposition, coding, QA, and documentation — must treat every rule below as non-negotiable unless a superseding amendment is recorded in the Governance section.

---

## I. Core Architectural Principles

1. **Separation of Concerns is mandatory.** Backend and frontend are independent applications managed under separate `package.json` files at `backend/` and `frontend/`. They must never share runtime code, dependencies, or node_modules.
2. **API-first design.** The backend exposes a versioned REST API (`/api/v1/`). All frontend data access must go through this API; direct database access from the frontend is forbidden.
3. **ESM-only on the backend.** The backend declares `"type": "module"`. All new backend files must use ES Module `import`/`export` syntax. CommonJS `require()` is forbidden.
4. **Stateless JWT authentication.** Authentication is stateless, token-based (JWT). Access tokens are short-lived (env: `ACCESS_TOKEN_EXPIRY`). Refresh tokens are rotated via `POST /api/v1/auth/refresh`. No server-side session storage.
5. **Tokens are delivered and stored exclusively as HttpOnly cookies.** Tokens must never be placed in `localStorage`, `sessionStorage`, or response bodies accessible to JavaScript.
6. **Feature ownership boundaries.** Each domain feature (auth, user, league, match, stats, media, notifications) owns its own route file, controller, service, and model. Cross-domain calls go through services, not direct model imports.
7. **Infrastructure is not optional.** Redis, Cloudinary, and email services (Mailtrap/Resend) are first-class dependencies. Discovery, planning, and implementation agents must treat them as required infrastructure, not optional extensions.
8. **No invented architecture.** Agents must not introduce layers, patterns, or abstractions that are not already present in the codebase without explicit user approval.

---

## II. Repository Organization Rules

1. **Root layout is fixed.** The repository root must contain: `backend/`, `frontend/`, `.specify/`, `.agent/`, `.claude/`, and `agents/`. No new top-level application directories may be added without a constitution amendment.
2. **Backend directory structure must be preserved:**
   ```
   backend/
     config/          – DB connection, Cloudinary, environment setup
     controllers/     – Route handler logic
     errors/          – Custom error classes and error constants
     middleware/
       core/          – Logging, request ID, body parsing, CORS credentials, API version
       security/      – Helmet, rate limiting, XSS sanitization
       auth/          – JWT validation, token middleware
       validation/    – Input validation middleware
       errors/        – 404 and global error handlers
     model/           – Mongoose document models
     routes/          – Express route definitions grouped by domain
     services/        – Domain business logic (auth, email, cloudinary)
     use-cases/       – Orchestration layer (optional, preserve if present)
     utilities/       – Shared helper utilities
     validators/      – express-validator rule sets
     public/          – Static assets served at /assets
     docs/            – Swagger/OpenAPI documentation files
     index.js         – Application entry point
   ```
3. **Frontend directory structure must be preserved:**
   ```
   frontend/src/
     app/             – Next.js App Router pages and layouts
       (auth)/        – Auth route group: login, signup, forgot-password, reset-password, verify-email
       dashboard/     – Protected dashboard pages
     components/
       auth/          – Auth-specific UI components
       shared/        – Cross-feature reusable components
       ui/            – Design system primitives (Radix-based)
       utils/         – Component utility helpers
     hooks/           – Custom React hooks
     i18n/            – next-intl internationalisation messages and config
     lib/             – Configuration, utilities, pure helpers (no side effects)
       config/        – route-config.js and other runtime config
     providers/       – React context providers (Redux, theme, i18n)
     services/
       api/           – Axios API client and interceptors
       auth/          – Auth-specific service calls
       domain/        – Domain feature service calls
       storage/       – Cookie and local storage helpers
       ui/            – UI state helpers
     store/           – Redux Toolkit store
       slices/        – Feature slices: auth, user, ui, notifications
       root-reducer.js
       root-actions.js
       store-accessor.js
       index.js
   ```
4. **No flat files in `src/`.** All source files must be placed inside a named subdirectory. The only permitted top-level file in `src/` is `middleware.js`.
5. **Config must not contain business logic.** Files in `config/`, `lib/config/`, and environment files must contain only initialization and configuration. No controller, service, or UI logic.

---

## III. Technology Stack Constraints

### Backend
| Constraint | Enforced Value |
|---|---|
| Runtime | Node.js (ESM, `"type": "module"`) |
| Framework | Express.js ≥ 4.18 |
| Database | MongoDB via Mongoose ≥ 8 |
| Cache / Queue | Redis (ioredis) + Bull |
| Auth | jsonwebtoken + bcrypt |
| File storage | Cloudinary (SDK v2) + GridFS (multer-gridfs-storage) |
| Email | Mailtrap SDK (primary) + Resend (secondary) |
| Logging | Pino |
| Docs | swagger-jsdoc + swagger-ui-express |
| Security | Helmet, express-rate-limit, rate-limit-redis, xss |
| Validation | express-validator |
| Dev runner | nodemon |

### Frontend
| Constraint | Enforced Value |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| UI Library | React 19 |
| Styling | Tailwind CSS v4 + PostCSS |
| Component system | Radix UI |
| Animation | Framer Motion |
| State management | Redux Toolkit + redux-persist |
| Forms | react-hook-form + @hookform/resolvers |
| Schema validation | Zod v4 |
| HTTP client | Axios |
| Internationalisation | next-intl |
| Icons | lucide-react |
| Linting | ESLint 9 (eslint-config-next) |

1. **No stack substitution.** Agents must not substitute, add, or remove framework-level dependencies without explicit user approval.
2. **Tailwind v4 syntax only.** Tailwind v4 uses `@import "tailwindcss"` in CSS, not `@tailwind base/components/utilities`. Agents must write Tailwind v4-compatible code.
3. **No CSS-in-JS.** Styling must use Tailwind utility classes. Inline `style={}` props are permitted only for dynamic values that cannot be expressed as Tailwind classes.
4. **No direct DOM manipulation.** React components must use declarative patterns. `document.querySelector`, `innerHTML`, and direct DOM operations are forbidden in React code.
5. **Zod schemas must co-locate with their form.** Validation schemas must be defined in or directly alongside the component file they serve.
6. **No test framework is installed.** Agents must not write test files or scaffold testing infrastructure unless the user explicitly installs and configures a testing framework.

---

## IV. Discovery and Evidence Rules

1. **Evidence-first discovery.** No architectural claim may be made before file-level inspection. Every conclusion must cite at least one file path, configuration entry, dependency declaration, or code pattern.
2. **Observed facts, inferences, and unknowns must be separated.** Discovery artifacts must contain three labelled sections: `FACTS` (directly observed), `INFERENCES` (reasoned from evidence), `UNKNOWNS` (evidence absent or contradictory).
3. **Confidence levels are mandatory.** Every inferred conclusion must carry an explicit confidence level: `HIGH`, `MEDIUM`, or `LOW`. Low-confidence inferences require escalation before acting.
4. **No broad architecture assumptions before inspection.** Agents must not assume monorepo tooling, microservices, shared libraries, or deployment targets before inspecting the corresponding configuration files.
5. **Infrastructure discovery is mandatory before planning.** Discovery agents must inspect and document: `.env.example`, `config/`, Redis configuration, Cloudinary configuration, email service configuration, and any CI/deployment files before producing a discovery artifact.
6. **Ambiguity must be surfaced, not resolved by assumption.** When evidence is missing or contradictory, agents must surface the ambiguity as an `UNKNOWN` and request clarification before proceeding.
7. **Discovery must proceed outside-in:**
   - Stage 1: Repository layout, package files, workspace configuration
   - Stage 2: Build and tooling files (next.config.mjs, jsconfig.json, eslint.config.mjs, postcss.config.mjs)
   - Stage 3: Entry points (`backend/index.js`, `frontend/src/app/layout.jsx`, `frontend/src/middleware.js`)
   - Stage 4: Module and feature boundaries (routes, controllers, slices, services)
   - Stage 5: Data layer (Mongoose models, Redis usage, GridFS usage)
   - Stage 6: Infrastructure (env files, config/, Cloudinary, email, Bull queues)
   - Stage 7: Tests, CI, deployment (if present)

---

## V. State Management Rules

1. **Redux Toolkit is the only permitted global state manager.** Context API may be used only for UI-scoped, non-persistent state (e.g., theme, modal open/close).
2. **Store slices must be feature-scoped.** Permitted slices: `auth`, `user`, `ui`, `notifications`. New slices require a named domain and must not duplicate data already owned by another slice.
3. **Async data fetching uses plain Axios service calls, not RTK Query.** RTK Query is not installed. Async operations belong in service files under `src/services/`, dispatched from components or hooks.
4. **redux-persist is active.** Agents must not add `localStorage` calls for any data already managed in the Redux store. Persistence configuration must be respected and not duplicated.
5. **No cross-slice direct imports.** Slices must not import from each other directly. Cross-slice orchestration must use root actions or middleware.
6. **Auth state is the source of truth for UI authentication decisions.** Server-side authentication is enforced by `src/middleware.js` using cookie presence. Client-side authentication state comes from the Redux auth slice; the two must remain consistent.

---

## VI. API Design Standards

1. **All API routes must be prefixed with `/api/v1/`.** The version prefix is enforced by the `createApiVersionMiddleware` applied globally in `backend/index.js`.
2. **Route groups must map to domain models.** Route files live at `routes/<domain>/<domain>-routes.js`. Each domain gets exactly one route file.
3. **Controllers must not contain business logic.** Controllers handle request parsing, delegate to a service, and return a formatted response. Business logic belongs in `services/`.
4. **HTTP method semantics must be respected.** `GET` must be idempotent and side-effect-free. `POST` creates resources. `PUT`/`PATCH` updates. `DELETE` removes. Non-standard usage requires justification.
5. **Error responses must use the centralized error handler.** Controllers must throw custom error class instances (from `errors/`). They must not write raw `res.status().json()` error responses.
6. **CORS is configured via environment variables.** `ALLOWED_ORIGINS`, `ALLOWED_METHODS`, `ALLOWED_HEADERS`, and `EXPOSED_HEADERS` are sourced from `.env`. Agents must not hardcode CORS values in code.
7. **API versioning is header-based.** The `X-API-Version` header is exposed. Breaking changes must increment the version prefix and update `createApiVersionMiddleware`.
8. **Swagger docs must be maintained for all public routes.** JSDoc `@swagger` annotations are required on all routes in `routes/`. Discovery agents must treat missing Swagger coverage as a known gap.
9. **Rate limiting is mandatory on all public endpoints.** The `createRateLimiterMiddleware` uses Redis-backed storage (`rate-limit-redis`). New public routes must be covered.

---

## VII. Data Layer and Persistence Rules

1. **Mongoose is the only permitted ODM.** No other MongoDB library (native driver, Prisma, etc.) may be introduced.
2. **All models must be defined in `backend/model/`.** No model definitions may exist in controllers, services, or route files.
3. **Models must use explicit schema definitions.** Schemas must declare field types, required flags, defaults, and validation constraints. Schemaless documents are forbidden.
4. **GridFS is the file storage layer for binary files.** File uploads go through `multer-gridfs-storage` to MongoDB GridFS. Cloudinary is used for media assets requiring CDN delivery. Agents must not duplicate storage layers.
5. **Redis is used for caching and job queuing only.** Redis must not be used as a primary data store. Persistent domain data belongs in MongoDB.
6. **Bull queue jobs must have error handlers.** All Bull queue processor functions must implement a catch block and emit a log on failure.
7. **DB connection mode is environment-controlled.** `DB_CONNECTION_MODE=local` uses local MongoDB; `DB_CONNECTION_MODE=atlas` uses MongoDB Atlas URI. Connection logic lives exclusively in `config/connect-db.js`.
8. **No raw MongoDB connection strings in application code.** Connection URIs must be read from environment variables only.

---

## VIII. Validation and Security Requirements

1. **All user input must be validated with express-validator.** Validator rule sets must live in `backend/validators/`. They must be applied as route middleware before the controller runs.
2. **XSS sanitization middleware is globally applied.** The `createSanitizeMiddleware` (using the `xss` library) runs on all requests. Agents must not remove or bypass it.
3. **Passwords must be hashed with bcrypt before storage.** Plaintext passwords must never be stored or logged.
4. **JWT tokens must declare `iss`, `aud`, and `exp` claims.** Issuers and audiences are set via `JWT_ISSUER` and `JWT_AUDIENCE` environment variables.
5. **Refresh token rotation must be implemented.** Each successful refresh call must invalidate the old refresh token and issue a new one.
6. **Helmet is globally applied.** The `helmetMiddleware` runs before all routes. Agents must not modify Helmet defaults without documented justification.
7. **Secrets must only exist in environment variables.** API keys, JWT secrets, database credentials, and cloud service tokens must never appear in source code.
8. **Frontend security headers are defined in `next.config.mjs`.** All security headers (`X-Frame-Options`, `X-Content-Type-Options`, `CSP`, `Referrer-Policy`, `Permissions-Policy`) must be maintained in the Next.js headers config.
9. **Silent token refresh runs in Next.js middleware.** The `src/middleware.js` performs server-side token refresh before route guard evaluation. Agents must not duplicate this logic in client components.

---

## IX. Testing Requirements

1. **No test framework is currently installed.** Agents must not generate test files, mock setups, or test configuration unless the user explicitly directs this with a named framework.
2. **The `/test` route group exists for development-only manual testing.** It is gated by `NODE_ENV === "development"` in `backend/index.js`. This is not a substitute for an automated test suite.
3. **Health check endpoint is available at `GET /api/v1/health`.** It must verify database connectivity and return structured status. Agents must preserve this endpoint.
4. **A Postman collection exists at `backend/App Fantasy Coach.postman_collection.json`.** Discovery agents must treat this as an integration test reference, not authoritative API documentation.
5. **When a test framework is adopted, it must be documented as a constitution amendment before any test scaffolding begins.**

---

## X. Infrastructure and Deployment Standards

1. **Environment variables are the only permitted configuration mechanism.** No config files that embed secrets, credentials, or environment-specific values in source code.
2. **`.env` files must never be committed.** `.env.example` is the only committed reference. All services must document their required variables in `.env.example`.
3. **Environment variable groups are segregated by concern:**
   - `DB_*` — database connection
   - `ACCESS_TOKEN_*` / `REFRESH_TOKEN_*` / `JWT_*` — token configuration
   - `REDIS_URL` — Redis connection
   - `CLOUDINARY_*` — media storage
   - `MAILTRAP_*` — email delivery
   - `ALLOWED_*` — CORS policy
   - `PORT`, `API_URL`, `BASE_URL`, `NODE_ENV` — server runtime
4. **The frontend proxies all API calls through Next.js rewrites.** The rewrite rule in `next.config.mjs` maps `/api/:path*` to `${NEXT_PUBLIC_API_URL}/api/:path*`. Agents must not configure Axios base URL to point directly to the backend without this proxy.
5. **No CI/CD pipeline is detected.** Discovery agents must flag the absence of CI configuration (`.github/`, `.gitlab-ci.yml`, etc.) as an `UNKNOWN` and request clarification on deployment strategy.
6. **No containerization configuration is detected.** Absence of `Dockerfile`, `docker-compose.yml`, or similar must be flagged as an `UNKNOWN`.
7. **Graceful shutdown is implemented in `backend/index.js`.** `SIGINT` and `SIGTERM` handlers close the HTTP server before disconnecting MongoDB. Agents must preserve this shutdown sequence.
8. **Static assets are served from `backend/public/assets/` at the `/assets` path.** This is a production concern and must not be removed.
9. **The scraper service is externally referenced** via `SCRAPER_BASE_URL`. It is an external dependency, not part of this repository. Agents must not attempt to discover or modify it.

---

## XI. Observability and Operational Rules

1. **Pino is the logger.** All backend log output must use `emitLogMessage()` from `utilities/general/emit-log.js`, which wraps Pino. `console.log` is forbidden in production code paths.
2. **Structured logging is mandatory.** Log entries must include log level, message, and context (request ID where available). Unstructured string concatenation in logs is prohibited.
3. **Request IDs are injected per request.** The `createRequestIdMiddleware` assigns a unique ID to every request. This ID must be propagated in responses and log entries.
4. **User activity logging is active.** `createUserActivityLogger` tracks authenticated user actions. Agents must not remove excluded routes (`/test-error`, `/assets`) from its config without justification.
5. **Health check must return database connection status.** Any degradation in database connectivity must be reflected in the health check response body.
6. **Log files persist to `backend/logs/`.** This directory must be gitignored and must not accumulate unbounded logs in production without rotation policy.
7. **Morgan is installed but Pino is preferred.** If Morgan and Pino both appear in a given middleware chain, the duplication must be flagged and resolved in favour of Pino.

---

## XII. AI Agent Behavioral Constraints

1. **Evidence before action.** Agents must read and cite relevant source files before writing, modifying, or deleting code. Stating "I assume X" without a file citation is a protocol violation.
2. **No silent modifications.** Agents must not rename, move, or refactor existing files or functions as a side effect of an unrelated task. Refactoring must be an explicit, approved task.
3. **One domain per task.** A task must not simultaneously modify backend models, backend services, frontend slices, and frontend components unless a dedicated cross-cutting task has been approved.
4. **Constitution compliance is checked before task execution.** Before implementing any task, the executing agent must verify that the planned changes do not violate any section of this constitution.
5. **Ambiguity escalates, it does not default.** When a requirement is unclear or when evidence is missing, agents must stop and surface the ambiguity. They must not choose a default implementation silently.
6. **Confidence levels govern action.** `HIGH` confidence: proceed. `MEDIUM` confidence: proceed with documented assumptions. `LOW` confidence: stop and escalate.
7. **Deprecated patterns must not be reintroduced.** RBAC-based middleware, role-permission models, and session-based auth were removed. Agents must not reintroduce them.
8. **All generated code must match the project's module format.** Backend: ESM `import`/`export`. Frontend: ESM, React functional components with hooks. Class components are forbidden.
9. **No test files without a test framework.** Generating `.test.js`, `.spec.js`, or `__tests__/` without an installed and configured framework is a protocol violation.
10. **Discovery artifacts produced by discovery agents must follow the canonical format defined in Section IV.** They must be stored in `.specify/memory/` and referenced by planning and task decomposition agents before they begin work.
11. **Infrastructure gaps must be flagged, not silently handled.** Missing CI, containerisation, or deployment configuration must appear as documented `UNKNOWNS` in the discovery artifact and must not be auto-generated without user approval.
12. **The constitution supersedes all other guidance files.** If a conflict exists between this document and any workflow, prompt, or template, this constitution takes precedence.

---

## XIII. Governance

1. **This constitution supersedes all other practices, templates, and agent instructions.**
2. **Amendments require:** written rationale, identification of the impacted sections, a migration plan for existing code, and explicit user ratification recorded below.
3. **All agents must verify compliance before task execution.** Non-compliance findings must be surfaced before implementation begins, not after.
4. **Complexity must be justified.** New dependencies, architectural layers, and patterns must be justified against an existing problem. Preemptive abstraction is forbidden.
5. **Constitution amendments are recorded with a version increment and ratification date below.**

---

**Version**: 1.1.0 | **Ratified**: 2026-03-10 | **Last Amended**: 2026-03-10

_Amendment 1.1.0_: Added Section XIII — Agent Authority Boundaries and Gate Rules. Formalises the six-agent delivery model, exclusive write ownership per memory artifact, and mandatory gates at the Delivery Planner and QA Validator layers.

---
---

## XIII. Agent Authority Boundaries and Gate Rules

This section is the authoritative governance reference for all agents operating within the Spec Kit delivery pipeline. Every rule below is non-negotiable and overrides any individual workflow file instruction.

### 1. Agent Inventory and Workflow Mapping

| Agent | Full Definition | Entry Workflow | Stage in Lifecycle |
|---|---|---|---|
| Requirements Analyst | `speckit.requirements-analyst.md` | `speckit.specify`, `speckit.clarify` | Feature start |
| Solution Architect | `speckit.solution-architect.md` | `speckit.plan` | Post-spec |
| Delivery Planner | `speckit.delivery-planner.md` | `speckit.tasks`, `speckit.analyze` | Post-plan |
| Implementation Engineer | `speckit.implementation-engineer.md` | `speckit.implement` | Post-tasks |
| QA Validator | `speckit.validate.md` | `speckit.validate` | Post-implement |
| Documentation Writer | `speckit.document.md` | `speckit.document` | Conditional — post-QA-PASS |

### 2. Exclusive Memory Write Ownership

Each memory artifact has exactly one writing agent. No other agent may write to that file except as an explicitly noted exception.

| Memory Artifact | Sole Writer | Permitted Readers | Exception |
|---|---|---|---|
| `.specify/memory/constitution.md` | Requirements Analyst (via `speckit.constitution`) | All agents | Any agent may flag a violation; only RA may author the amendment. |
| `.specify/memory/discovery.md` | Requirements Analyst (master discovery prompt) | All agents | Re-triggered by user only. |
| `specs/NNN/spec.md` | Requirements Analyst | SA, DP, QA | None — no other agent writes to `spec.md`. |
| `specs/NNN/plan.md` | Solution Architect | DP, IE, QA | None. |
| `specs/NNN/research.md` | Solution Architect | DP, IE | None. |
| `specs/NNN/data-model.md` | Solution Architect | DP, IE, QA, DW | None. |
| `specs/NNN/contracts/*` | Solution Architect | DP, IE, QA, DW | None. |
| `specs/NNN/quickstart.md` | Solution Architect (skeleton) → Documentation Writer (final) | IE, QA | DW overwrites SA skeleton — only permitted after QA PASS verdict. |
| `specs/NNN/tasks.md` | Delivery Planner (structure) | IE (marks `[x]` only), QA | IE may change `[ ]` → `[x]` only. No structural edits. |
| `specs/NNN/analysis-report.md` | Delivery Planner | IE, QA | None. |
| `specs/NNN/checkpoint-log.md` | Delivery Planner (initializes) → Implementation Engineer (appends) | QA | DP initializes header. IE appends phase records. Neither may delete records. |
| `specs/NNN/validation-report.md` | QA Validator | DW, IE (on rejection) | None. |
| `specs/NNN/defect-log.md` | QA Validator (primary) | RA, SA, DP, IE (read target records) | IE may append `PLANNING_GAP` records only. |
| `specs/NNN/docs/*` | Documentation Writer | None (final output) | None. |

### 3. Mandatory Gate Rules (Rule IDs)

These gate rules are referenced by their IDs throughout all workflow files. A gate MUST be enforced before the downstream agent is permitted to begin.

**Rule RA-1 — Spec gate before architecture**  
`specs/NNN/spec.md` must contain zero `[NEEDS CLARIFICATION]` markers AND `specs/NNN/checklists/requirements.md` must be all-pass before Solution Architect may begin `speckit.plan`.

**Rule SA-1 — Architecture gate before task decomposition**  
`specs/NNN/plan.md` Handoff Readiness checklist must be all-pass AND the Constitution Check section must show all gates PASS or VIOLATION+JUSTIFICATION before Delivery Planner may begin `speckit.tasks`.

**Rule DP-1 — Analysis gate before implementation**  
`specs/NNN/analysis-report.md` must exist AND `Status: APPROVED` (zero CRITICAL findings) before Implementation Engineer may begin `speckit.implement`. This gate is non-optional. No `speckit.implement` invocation is legitimate without an APPROVED `analysis-report.md`.

**Rule IE-1 — Completion gate before validation**  
All tasks in `specs/NNN/tasks.md` must be marked `[x]` AND `specs/NNN/checkpoint-log.md` must have one COMPLETE record per phase with zero FAILED records before QA Validator may begin `speckit.validate`.

**Rule QA-1 — PASS gate before documentation**  
`specs/NNN/validation-report.md` must exist AND `Verdict: PASS` before Documentation Writer may begin `speckit.document`. Documentation Writer must halt immediately if `Verdict: REJECT` or if `validation-report.md` is absent.

**Rule QA-2 — Rejection escalation cap**  
Any defect type that has been rejected twice (recorded in `defect-log.md` as `QA Run: 2`) and remains unresolved triggers mandatory escalation to the user on the third occurrence. No further routing is permitted without user intervention.

### 4. Agent Authority Prohibitions

The following actions constitute authority boundary violations. Any agent that detects a violation must surface it before proceeding.

| Prohibition | Violating Agent Category | Why |
|---|---|---|
| Writing to `spec.md` | Any agent except Requirements Analyst | Spec ownership is exclusive. Changes without RA review corrupt the requirements baseline. |
| Writing to `plan.md`, `research.md`, `data-model.md`, `contracts/` | Any agent except Solution Architect | Architecture ownership is exclusive. Downstream changes invalidate the task decomposition. |
| Marking tasks `[x]` in `tasks.md` | Any agent except Implementation Engineer | Only IE has confirmed task execution. Premature marking breaks QA validation traceability. |
| Writing to `validation-report.md` or `defect-log.md` | Any agent except QA Validator (and IE for `PLANNING_GAP` exception) | Validation ownership is exclusive. Contamination breaks the rejection routing model. |
| Producing documentation artifacts | Any agent except Documentation Writer | Documentation must reflect validated, not planned, reality. Only DW may make this judgement. |
| Starting `speckit.implement` without APPROVED `analysis-report.md` | Implementation Engineer | Rule DP-1. No exceptions. |
| Starting `speckit.document` without PASS `validation-report.md` | Documentation Writer | Rule QA-1. No exceptions. |
| Introducing new dependencies without constitution amendment | All agents | Section III. Technology Stack Constraints are locked. Any new dependency requires `speckit.constitution` amendment first. |
| Invoking RBAC, role, or permission logic | All agents | Section XII eliminates RBAC from this project. No agent may reintroduce it. |

### 5. Defect Taxonomy and Routing Quick Reference

All agents that discover a defect must classify it using this taxonomy before routing:

| Type | Root Cause | Route To |
|---|---|---|
| `REQUIREMENTS` | Spec ambiguous, untestable, or contradictory | Requirements Analyst |
| `PLANNING_GAP` | Plan missing component, data definition, or contract | Solution Architect |
| `COVERAGE_GAP` | `tasks.md` missing tasks covering a requirement | Delivery Planner |
| `IMPL` | Code does not match `plan.md` | Implementation Engineer |
| `SECURITY` | Missing auth guard, token in wrong location, unsanitized input | Implementation Engineer |
| `INFRA` | Missing env handling, misconfigured Redis/Cloudinary | Implementation Engineer |
| `CONSTITUTION` | Code or plan violates a section MUST rule | Layer that introduced the violation |

---

# Spec Kit Master Discovery Prompt

> **Purpose:** Paste the block below into Antigravity IDE (or any compatible agentic environment) to run a complete, evidence-first repository discovery of the Fantasy Coach App. The output is a normalized canonical discovery artifact stored in `.specify/memory/` that all downstream planning, task decomposition, and coding agents must read before beginning work.

---

```
## SPEC KIT — MASTER DISCOVERY PROMPT
### Fantasy Coach App | Evidence-First Repository Discovery

---

#### PREAMBLE — ACCESS ASSUMPTIONS

Before beginning discovery, confirm the following access conditions and record them in the artifact:

- [ ] Can you list and read files in the repository? (Required)
- [ ] Can you execute terminal commands (`npm`, `node`, `git`)? (Optional — record YES/NO)
- [ ] Can you read `.env` files? (Optional — record YES/NO; do NOT log secrets)
- [ ] Can you access `node_modules/`? (Optional — record YES/NO)

If file read access is unavailable, stop and report the access failure. Do not proceed with partial access unless the user explicitly permits it.

---

#### SECTION 1 — SCOPE AND DISCOVERY CONTRACT

You are a senior discovery agent. Your task is to inspect this repository and produce a canonical discovery artifact at `.specify/memory/discovery.md`.

This prompt governs your behavior during discovery:

1. You MUST read files before making any claim about them.
2. You MUST separate FACTS, INFERENCES, and UNKNOWNS in every section.
3. Every INFERENCE must carry a confidence level: HIGH, MEDIUM, or LOW.
4. LOW confidence inferences must include an escalation note specifying what evidence is needed.
5. You MUST treat infrastructure as mandatory. Missing infrastructure evidence is an UNKNOWN, not an absence.
6. You MUST NOT invent, assume, or extrapolate architecture that is not supported by direct file evidence.
7. You MUST follow the discovery sequence defined in Section 5.
8. At the end, you MUST produce a normalized discovery artifact in the format defined in Section 6.

---

#### SECTION 2 — KNOWN CONTEXT

The following is already known from the project constitution. Do not re-derive these unless you find contradicting evidence. If you find contradictions, surface them as UNKNOWNS.

- Repository type: Two-app workspace (not a monorepo with shared tooling). `backend/` and `frontend/` are independent Node.js applications.
- Backend: Express.js (ESM, `"type": "module"`), entry at `backend/index.js`, port 4000 (env: `PORT`).
- Frontend: Next.js 15 (App Router, Turbopack enabled), entry at `frontend/src/app/layout.jsx`, dev port 3000.
- Database: MongoDB via Mongoose, connection controlled by `DB_CONNECTION_MODE` (local|atlas), configured in `backend/config/connect-db.js`.
- Auth: JWT (access + refresh tokens), HttpOnly cookies, silent refresh in Next.js middleware at `frontend/src/middleware.js`.
- Redis: ioredis + Bull queue, `REDIS_URL` env variable.
- Media: Cloudinary SDK v2 + GridFS (multer-gridfs-storage).
- Email: Mailtrap (primary) + Resend (secondary).
- Logger: Pino, via `backend/utilities/general/emit-log.js`.
- State: Redux Toolkit + redux-persist, slices in `frontend/src/store/slices/`.
- i18n: next-intl in `frontend/src/i18n/` and `frontend/messages/`.
- API prefix: `/api/v1/`.
- Security: Helmet, express-rate-limit (Redis-backed), xss, bcrypt.
- Docs: swagger-jsdoc + swagger-ui-express.

---

#### SECTION 3 — DISCOVERY SEQUENCE

Execute the following stages in order. Do not skip a stage. If a stage cannot be completed, record the reason as an UNKNOWN and continue.

**STAGE 1 — Repository Shape**

Inspect:
- Root directory listing
- `backend/` top-level listing
- `frontend/` top-level listing
- `.specify/` listing
- `.agent/workflows/` listing
- `.claude/commands/` listing
- `agents/` listing (if present)

Record:
- Confirmed directories and their contents
- Files that are present but not listed in the constitution (surface as INFERENCES or UNKNOWNS)
- Files mentioned in the constitution that are missing (surface as UNKNOWNS)

---

**STAGE 2 — Build, Tooling, and Package Files**

Inspect:
- `backend/package.json` — runtime, scripts, all dependencies
- `frontend/package.json` — runtime, scripts, all dependencies
- `frontend/next.config.mjs` — rewrites, headers, image domains, experimental flags
- `frontend/jsconfig.json` — path aliases
- `frontend/eslint.config.mjs` — linting rules
- `frontend/postcss.config.mjs` — CSS processor config
- `frontend/components.json` — shadcn/Radix UI config
- `frontend/tsconfig.json` (if present) — indicates TypeScript migration

Record:
- Exact dependency names and versions (do not paraphrase)
- Detected scripts and what they invoke
- Path aliases that affect import resolution
- Tailwind version (confirm v4 vs v3 from postcss config and package.json)
- Any TypeScript presence — FACT if tsconfig exists, UNKNOWN if absent

---

**STAGE 3 — Entry Points and Middleware Chain**

Inspect:
- `backend/index.js` — full middleware stack order, route mounting, shutdown logic
- `frontend/src/middleware.js` — matcher path, auth logic, silent refresh, redirect rules
- `frontend/src/app/layout.jsx` — root layout, providers, font loading, metadata

Record:
- Exact middleware registration order in `backend/index.js`
- All mounted route prefixes (`app.use(...)`)
- Whether test routes are gated by environment check
- Silent refresh logic and the refresh endpoint it calls
- Route matcher patterns in `frontend/src/middleware.js`
- Provider stack in root layout

---

**STAGE 4 — Module and Feature Boundaries**

Inspect:
- `backend/routes/` — list all route files and their URL prefixes
- `backend/controllers/` — list all controller files
- `backend/services/` — list all service files
- `backend/use-cases/` — list all use-case files
- `backend/middleware/` — list all middleware files across all subdirectories
- `backend/validators/` — list all validator files
- `backend/errors/` — list all error class and constant files
- `frontend/src/app/` (recursive) — list all page.jsx, layout.jsx, loading.jsx files
- `frontend/src/components/` — list all component files
- `frontend/src/store/slices/` — list all slice files and describe their state shape
- `frontend/src/services/` — list all service files
- `frontend/src/hooks/` — list all hooks

Record:
- Implemented routes (path + HTTP method if determinable)
- Route groups and their guard status (public vs protected vs auth-only)
- Domain boundaries: which domains have routes, controllers, services, models
- Domains referenced in routes but missing a service or model (UNKNOWN)
- Redux slice names and their persisted keys

---

**STAGE 5 — Data Layer and Models**

Inspect:
- `backend/model/` — all model files
- `backend/config/connect-db.js` — connection logic
- Any Redis client configuration files
- Any Bull queue definition files (search in `services/` or `use-cases/`)

Record:
- Model names and key fields (do not reproduce full schemas; summarize)
- Relationship references (refs between models)
- GridFS usage (multer-gridfs-storage configuration if found)
- Redis consumer and producer patterns (from Bull job definitions found)
- Database index definitions found in models (flag if none)

---

**STAGE 6 — Infrastructure, Environment, and Integrations**

Inspect:
- `backend/.env.example` — all environment variable keys and their groups
- `frontend/.env.example` — all frontend env variable keys
- `frontend/.env.local` — keys only (do NOT log values)
- `frontend/.env.production` — keys only (do NOT log values)
- `backend/config/cloudinary.js` — Cloudinary SDK initialization
- `backend/services/email/` — email service implementation
- Any Redis connection file
- `backend/package.json` scripts for seeding, migration, or deployment
- Root `.github/`, `.gitlab-ci.yml`, `Dockerfile`, `docker-compose.yml` (if present)

Record:
- All detected infrastructure integrations as FACTS with evidence files
- Missing integrations listed in constitution but not found in config (UNKNOWNS)
- CI/CD pipeline presence or confirmed absence
- Containerisation presence or confirmed absence
- Seeding scripts and their purpose
- Any environment-specific build targets

---

**STAGE 7 — Tests and Quality Gates**

Inspect:
- `backend/package.json` test script
- Any `*.test.js`, `*.spec.js`, `__tests__/` directories
- Any Jest, Vitest, Mocha, or similar config files
- `backend/App Fantasy Coach.postman_collection.json` — number of requests
- `backend/postman.json`

Record:
- Whether an automated test framework is installed (FACT or UNKNOWN)
- Number of Postman requests available as a manual testing reference
- Coverage tooling, if any

---

#### SECTION 4 — ESCALATION RULES

Stop and request clarification before proceeding if:

1. You find evidence that contradicts the known context in Section 2 and the contradiction materially affects planning (e.g., TypeScript detected when none was expected).
2. You find a database migration system, monorepo tool (nx, turborepo, lerna), or containerisation configuration that was not disclosed in the constitution.
3. You find secrets or credentials in committed files (report the file path only, not the value).
4. You cannot read files in two or more sections of the discovery sequence.
5. You find a new major domain (a significant model + route + service group) not mentioned in the constitution.

---

#### SECTION 5 — DISCOVERY ARTIFACT FORMAT

Produce the complete artifact at `.specify/memory/discovery.md` using this exact structure:

```markdown
# Fantasy Coach App — Discovery Artifact
**Generated**: [ISO timestamp]
**Agent Access Model**: [list access capabilities confirmed in Preamble]
**Constitution Version**: [version from constitution.md]

---

## Access Conditions
[Confirmed access capabilities table]

---

## FACTS

### Workspace Layout
[Confirmed directory structure with evidence]

### Dependencies
#### Backend
[Exact name@version list]
#### Frontend
[Exact name@version list]

### Entry Points
[backend/index.js facts, frontend middleware.js facts, layout.jsx facts]

### API Routes
[Route prefix | HTTP methods | Auth required | Evidence file]

### Data Models
[Model name | Key fields (summary) | Refs | Evidence file]

### Infrastructure
[Service | Config file | Keys present (Y/N) | Notes]

### Auth Flow
[Fact-level description of token lifecycle, cookie names, refresh endpoint, middleware chain]

### Internationalisation
[Locales, message locations, i18n provider]

### CI/CD
[Confirmed or confirmed absent]

### Containerisation
[Confirmed or confirmed absent]

---

## INFERENCES

| ID | Claim | Evidence | Confidence | Notes |
|----|-------|----------|------------|-------|
| I-01 | ... | file/path | HIGH/MEDIUM/LOW | ... |

---

## UNKNOWNS

| ID | Unknown | Why it matters | Evidence needed |
|----|---------|----------------|-----------------|
| U-01 | ... | ... | ... |

---

## Constitution Compliance
[List any deviations found from the constitution. If fully compliant, state that.]

---

## Recommended Discovery Gaps to Resolve
[Ordered list of unknowns or low-confidence inferences that should be resolved before planning begins]
```

---

#### SECTION 6 — COMPLETION CRITERIA

The discovery run is complete when:

1. All seven discovery stages have been executed or documented as blocked.
2. Every claim is labelled as FACT, INFERENCE, or UNKNOWN.
3. Every INFERENCE has a confidence level.
4. Infrastructure integrations (database, Redis, Cloudinary, email) are documented with evidence.
5. The discovery artifact has been written to `.specify/memory/discovery.md`.
6. Any escalation conditions from Section 4 have been surfaced to the user.

Report your completion status to the user by listing:
- Stages completed
- Stages blocked (with reason)
- Escalation triggers found (if any)
- Path to the written discovery artifact
```
