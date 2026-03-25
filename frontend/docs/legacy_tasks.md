// frontend/docs/legacy_tasks.md
# Legacy Task Notes (headache.txt Archive)

> [!NOTE]
> This document preserves historical task progress and project structure snapshots from the early stages of development.

## Historical To-Do List (Auth)
- [x] Break down & clean up auth pages
- [x] Error pages for auth pages
- [x] Auth configuration variables
- [x] Password strength meter
- [x] Zod schema + React Hook Form
- [ ] Redux auth slice & store implementation (Initial planning phase)

## Early Architecture Ideas
- Use simulated loading for route transitions via Suspense.
- Implement lazy loading for feature modules.
- Framer Motion for auth panel animations.

---

## Historical Structure Report (2025-10-26)
- Total Files: 235
- Breakdown: 92 JSX files, 57 JS files, 49 `.download` artifacts (since cleared).

### Core Directories at the time:
- `src/app/(auth)`
- `src/components/auth` (10 modules)
- `src/services` (api, domain, storage)
- `src/store/modules` (Legacy structure before RTK migration)

---

## Initial Refactor Goals
1. Senior-level code audit and judgmental opinion.
2. Major update using Redux Toolkit and Redux Persist.
3. Dual-client API architecture (Public vs. Secured).
4. Axios interceptors with auto-refresh logic.
5. Secure cookie management for tokens.
6. Simplification of slices into primary vs. secondary states.
7. Next.js Middleware as a security guard.
