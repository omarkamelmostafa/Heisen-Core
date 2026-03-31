# Environment & Secrets Audit Report

**Project**: NEW-STARTER  
**Date**: 2026-03-31  
**Auditor**: DevOps Validator  
**Target**: Root + Backend + Frontend

---

## Environment Variables Matrix

### Backend (`backend/.env.example`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | No | `development` | Server environment mode |
| `PORT` | No | `4000` | Express server port |
| `DB_CONNECTION_MODE` | No | `local` | MongoDB mode: `local` or `atlas` |
| `DB_LOCAL_HOST` | No | `localhost` | Local MongoDB host |
| `DB_LOCAL_PORT` | No | `27017` | Local MongoDB port |
| `DB_LOCAL_NAME` | No | `new-starter` | Local database name |
| `DB_LOCAL_USER` | No | *(empty)* | Local MongoDB username |
| `DB_LOCAL_PASSWORD` | No | *(empty)* | Local MongoDB password |
| `DATABASE_URI` | **Conditional** | — | Atlas connection URI (required if `DB_CONNECTION_MODE=atlas`) |
| `DB_ATLAS_NAME` | No | `new-starter` | Atlas database name |
| `ACCESS_TOKEN_SECRET` | **YES** | — | JWT signing secret for access tokens |
| `REFRESH_TOKEN_SECRET` | **YES** | — | JWT signing secret for refresh tokens |
| `ACCESS_TOKEN_EXPIRY` | No | `15m` | Access token TTL |
| `REFRESH_TOKEN_EXPIRY` | No | `7d` | Refresh token TTL |
| `JWT_ISSUER` | No | `new-starter-backend-v1` | JWT issuer claim |
| `JWT_AUDIENCE` | No | `new-starter-web-client` | JWT audience claim |
| `ETHEREAL_HOST` | **Recommended** | — | SMTP host for dev email |
| `ETHEREAL_PORT` | **Recommended** | — | SMTP port for dev email |
| `ETHEREAL_USER` | **Recommended** | — | Ethereal email username |
| `ETHEREAL_PASS` | **Recommended** | — | Ethereal email password |
| `MAIL_FROM_ADDRESS` | No | `noreply@example.com` | Sender email address |
| `MAIL_FROM_NAME` | No | `New Starter Kit` | Sender display name |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | CORS allowed origins |
| `FRONTEND_URL` | No | `http://localhost:3000` | Frontend URL for email links |
| `REDIS_HOST` | No | `localhost` | Redis server host |
| `REDIS_PORT` | No | `6379` | Redis server port |
| `COOKIE_DOMAIN` | No | *(empty)* | Cookie domain attribute |
| `LOG_LEVEL` | No | `info` | Winston log level |
| `RATE_LIMIT_LOGIN_MAX` | No | `5` | Max login attempts |
| `RATE_LIMIT_LOGIN_WINDOW_MS` | No | `900000` | Login rate limit window (15min) |
| `RATE_LIMIT_REGISTER_MAX` | No | `3` | Max registration attempts |
| `RATE_LIMIT_REGISTER_WINDOW_MS` | No | `3600000` | Register rate limit window (1hr) |
| `RATE_LIMIT_FORGOT_MAX` | No | `3` | Max forgot password attempts |
| `RATE_LIMIT_FORGOT_WINDOW_MS` | No | `3600000` | Forgot password window (1hr) |
| `RATE_LIMIT_REFRESH_MAX` | No | `30` | Max token refresh attempts |
| `RATE_LIMIT_REFRESH_WINDOW_MS` | No | `60000` | Refresh token window (1min) |

### Frontend (`frontend/.env.example`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_PORT` | No | `3000` | Next.js dev server port |
| `NEXT_PUBLIC_API_URL` | **YES** | `http://localhost:4000` | Backend API base URL |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Frontend app URL (metadata) |

---

## Validate-Env.js Verification

**Status**: ✅ **VALID**

`validate-env.js` properly checks:

**REQUIRED Variables (startup fails without):**
- `ACCESS_TOKEN_SECRET` — `validate-env.js:5`
- `REFRESH_TOKEN_SECRET` — `validate-env.js:9`

**RECOMMENDED Variables (warnings only):**
- `ETHEREAL_HOST`, `ETHEREAL_PORT`, `ETHEREAL_USER`, `ETHEREAL_PASS`
- `ALLOWED_ORIGINS`, `FRONTEND_URL`

### Issues Found

1. **MISSING VALIDATION**: `DATABASE_URI` is not validated but is **required** when `DB_CONNECTION_MODE=atlas`. The app will crash at `connect-db.js:43-45` instead of during startup validation.

2. **DUPLICATE ENTRIES**: `REFRESH_TOKEN_EXPIRY` and `COOKIE_DOMAIN` appear twice in `.env.example` (lines 21/62 and 46/63).

---

## Secrets Exposure Risk Assessment

**Status**: ✅ **NO HARDCODED SECRETS DETECTED**

Search patterns used:
- `= "your-*`, `='your-*` — No hardcoded placeholder secrets
- `hardcoded`, `const SECRET`, `const KEY`, `const PASSWORD` — None found

### Risk Areas (All use `process.env`)

| File | Purpose |
|------|---------|
| `services/auth/token-service.js` | Token secrets |
| `use-cases/auth/login.use-case.js` | Password handling |
| `utilities/auth/hash-utils.js` | Hash utilities |

### Security Compliance

- ✅ JWT tokens use `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET` from env
- ✅ Passwords hashed with bcrypt (salt rounds from env or default 12)
- ✅ No plaintext secrets in source code

---

## Frontend NEXT_PUBLIC_ Prefix Verification

**Status**: ⚠️ **PARTIAL COMPLIANCE**

### Correctly Prefixed

| Variable | File | Line |
|----------|------|------|
| `NEXT_PUBLIC_API_URL` | `next.config.mjs` | 62, 77 (CSP connect-src, rewrites) |
| `NEXT_PUBLIC_API_URL` | `lib/config/api-config.js` | API base URL |
| `NEXT_PUBLIC_APP_ENV` | `lib/environment.js` | 5-7 (Development check) |

### Issues Found

1. **MISSING PREFIX**: `environment.js` references `NEXT_PUBLIC_APP_ENV` which is **NOT defined** in `frontend/.env.example`. This variable is missing entirely.

---

## Local Development Prerequisites Checklist

| Service | Port | Default Config | Required |
|---------|------|----------------|----------|
| **MongoDB** | 27017 | `DB_LOCAL_HOST=localhost` | ✅ YES — Local mode default |
| **Redis** | 6379 | `REDIS_HOST=localhost` | ⚠️ Optional — Only for email queue |
| **Backend** | 4000 | `PORT=4000` | ✅ YES |
| **Frontend** | 3000 | `NEXT_PUBLIC_PORT=3000` | ✅ YES |

### Setup Commands

```bash
# 1. MongoDB (local)
# Install MongoDB Community Edition or use Docker:
docker run -d -p 27017:27017 --name mongodb mongo:6

# 2. Redis (optional, for email queue)
docker run -d -p 6379:6379 --name redis redis:alpine

# 3. Backend
cd backend && npm install && npm run dev

# 4. Frontend
cd frontend && npm install && npm run dev
```

---

## Summary

| Category | Status | Findings |
|----------|--------|----------|
| Env Variable Documentation | ✅ Complete | All variables documented with defaults |
| Required Validation | ⚠️ Partial | Missing `DATABASE_URI` conditional validation |
| Secrets Security | ✅ Pass | No hardcoded secrets detected |
| Frontend Prefix | ⚠️ Partial | `NEXT_PUBLIC_APP_ENV` missing from `.env.example` |
| Duplicates | ❌ Found | `REFRESH_TOKEN_EXPIRY`, `COOKIE_DOMAIN` duplicated |

### Recommendations

1. Add `DATABASE_URI` to `validate-env.js` with conditional check for Atlas mode
2. Remove duplicate entries from `backend/.env.example`
3. Add `NEXT_PUBLIC_APP_ENV` to `frontend/.env.example` or remove from `environment.js`

---

*Generated by DevOps Validator Agent*  
*Constitution Compliance: Reviewed against security gates*
