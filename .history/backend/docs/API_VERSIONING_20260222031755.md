# API Versioning Strategy

## Current Version

| Version | Status | Base Path |
|---------|--------|-----------|
| **v1** | Active | `/api/v1/*` |

## Versioning Rules

1. **URL Path Versioning** — All API routes use the `/api/v{N}/` prefix.
2. **Response Header** — Every response includes `X-API-Version: {N}` so clients can confirm which version they are talking to.
3. **No Breaking Changes Within a Version** — Once a version is released, its request/response contracts are immutable. New fields may be _added_ but never removed or renamed.

## Deprecation Process

When a new major version is introduced:

1. The old version is marked as **deprecated**.
2. Responses from the deprecated version include:
   - `X-API-Deprecated: true`
   - `X-API-Deprecation-Notice: API v{old} is deprecated. Please migrate to v{new}.`
   - `Sunset: {ISO date}` — the date after which the old version will be removed.
3. A minimum **6-month sunset window** is provided before removal.

## Adding a New Version

1. Create a new route directory: `routes/v2/`.
2. Mount it in `index.js` at `/api/v2/`.
3. Update `createApiVersionMiddleware({ currentVersion: '2', deprecatedVersions: ['1'], sunsetDate: '...' })` in `index.js`.

## Middleware Configuration

```js
// index.js
import { createApiVersionMiddleware } from "./middleware/core/index.js";

// Current: only v1 active, no deprecations
app.use(createApiVersionMiddleware({ currentVersion: "1" }));

// Future: v2 active, v1 deprecated
app.use(createApiVersionMiddleware({
  currentVersion: "2",
  deprecatedVersions: ["1"],
  sunsetDate: "2027-01-01T00:00:00Z",
}));
```
