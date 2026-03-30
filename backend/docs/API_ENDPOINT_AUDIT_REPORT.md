# API Endpoint Surface vs. Swagger & Postman Documentation Drift Audit

**Date:** 2026-03-28  
**Auditor:** QA Validator (speckit.validate)  
**Scope:** Backend API route surface, validation rules, response shapes, Swagger/OpenAPI spec, Postman collection  
**Status:** READ-ONLY AUDIT COMPLETE

---

## Executive Summary

This audit catalogs all 31 registered backend endpoints (19 production API + 12 dev-only test endpoints) and compares them against existing Swagger/OpenAPI documentation and Postman collection. **Critical finding: 8 production endpoints are completely undocumented** in both Swagger and Postman.

---

## Table 1: Registered Backend Endpoints

| # | Method | Full Path | Middleware Chain | Controller | Has Validation? | Rate Limiter | Auth Required? |
|---|--------|-----------|------------------|------------|-----------------|--------------|----------------|
| 1 | POST | /api/v1/auth/login | `loginLimiter`, `loginValidationRules`, `handleValidationErrors` | `handleLogin` | ✅ | loginLimiter (10/5min) | ❌ |
| 2 | POST | /api/v1/auth/verify-2fa | `verify2faLimiter`, `verify2faValidationRules`, `handleValidationErrors` | `handleVerify2fa` | ✅ | verify2faLimiter (10/15min) | ❌ |
| 3 | POST | /api/v1/auth/resend-2fa | `resend2faLimiter`, `[body("tempToken")...]`, `handleValidationErrors` | `handleResend2fa` | ✅ inline | resend2faLimiter (3/15min) | ❌ |
| 4 | POST | /api/v1/auth/register | `registerLimiter`, `registerValidationRules`, `handleValidationErrors` | `handleRegister` | ✅ | registerLimiter (5/15min) | ❌ |
| 5 | POST | /api/v1/auth/logout | `logoutLimiter` | `handleLogout` | ❌ | logoutLimiter (30/15min) | ❌ (cookie only) |
| 6 | POST | /api/v1/auth/logout-all | `logoutLimiter`, `authTokenMiddleware` | `handleLogoutAll` | ❌ | logoutLimiter (30/15min) | ✅ |
| 7 | POST | /api/v1/auth/refresh | `refreshLimiter` | `handleRefreshToken` | ❌ | refreshLimiter (30/1min) | ❌ (cookie only) |
| 8 | POST | /api/v1/auth/verify-email | `verifyEmailLimiter`, `emailVerificationValidationRules`, `handleValidationErrors` | `handleVerifyEmail` | ✅ | verifyEmailLimiter (10/15min) | ❌ |
| 9 | POST | /api/v1/auth/resend-verification | `resendVerificationLimiter`, `resendVerificationValidationRules`, `handleValidationErrors` | `handleResendVerification` | ✅ | resendVerificationLimiter (3/15min) | ❌ |
| 10 | POST | /api/v1/auth/forgot-password | `forgotPasswordLimiter`, `forgotPasswordValidationRules`, `handleValidationErrors` | `handleForgotPassword` | ✅ | forgotPasswordLimiter (3/15min) | ❌ |
| 11 | POST | /api/v1/auth/reset-password | `resetPasswordLimiter`, `resetPasswordValidationRules`, `handleValidationErrors` | `handleResetPassword` | ✅ | resetPasswordLimiter (5/15min) | ❌ |
| 12 | GET | /api/v1/health | `healthLimiter` | `healthCheck` | ❌ | healthLimiter (30/15min) | ❌ |
| 13 | GET | /api/v1/user/me | `userMeLimiter`, `authTokenMiddleware` | `getCurrentUser` | ❌ | userMeLimiter (60/15min) | ✅ |
| 14 | PATCH | /api/v1/user/me | `updateProfileLimiter`, `authTokenMiddleware`, `updateProfileValidationRules`, `handleValidationErrors` | `updateProfile` | ✅ | updateProfileLimiter (10/15min) | ✅ |
| 15 | POST | /api/v1/user/profile/avatar | `avatarUploadLimiter`, `authTokenMiddleware`, `handleAvatarUpload` | `handleUploadAvatar` | ❌ (multer) | avatarUploadLimiter (10/15min) | ✅ |
| 16 | POST | /api/v1/user/email/request | `emailChangeLimiter`, `authTokenMiddleware`, `emailChangeValidationRules`, `handleValidationErrors` | `handleRequestEmailChange` | ✅ | emailChangeLimiter (3/hour) | ✅ |
| 17 | GET | /api/v1/user/email/confirm/:token | *none* | `handleConfirmEmailChange` | ❌ | ❌ | ❌ |
| 18 | POST | /api/v1/user/security/password | `changePasswordLimiter`, `authTokenMiddleware`, `updatePasswordValidationRules`, `handleValidationErrors` | `handleChangePassword` | ✅ | changePasswordLimiter (5/15min) | ✅ |
| 19 | PATCH | /api/v1/user/security/2fa | `toggle2faLimiter`, `authTokenMiddleware`, `toggle2faValidationRules`, `handleValidationErrors` | `handleToggle2fa` | ✅ | toggle2faLimiter (5/15min) | ✅ |
| 20 | GET | /test/health | *none* | `healthCheck` | ❌ | ❌ | [DEV] |
| 21 | GET | /test/error | *none* | `testError` | ❌ | ❌ | [DEV] |
| 22 | GET | /test/error/:type | *none* | `testError` | ❌ | ❌ | [DEV] |
| 23 | GET | /test/helmet | *none* | `testHelmet` | ❌ | ❌ | [DEV] |
| 24 | GET | /test/sanitize | *none* | `testSanitize` | ❌ | ❌ | [DEV] |
| 25 | POST | /test/sanitize | *none* | `testSanitize` | ❌ | ❌ | [DEV] |
| 26 | GET | /test/sanitize/:id | *none* | `testSanitize` | ❌ | ❌ | [DEV] |
| 27 | POST | /test/dangerous-input | *none* | `testDangerousInput` | ❌ | ❌ | [DEV] |
| 28 | GET | /test/dangerous-input | *none* | `testDangerousInput` | ❌ | ❌ | [DEV] |
| 29 | GET | /test/security | *none* | `testSecurityComprehensive` | ❌ | ❌ | [DEV] |
| 30 | POST | /test/security | *none* | `testSecurityComprehensive` | ❌ | ❌ | [DEV] |
| 31 | GET | /test/stats | *none* | `getSecurityStats` | ❌ | ❌ | [DEV] |

**Summary:** 31 total endpoints (19 production API, 12 dev-only test endpoints)

---

## Table 2: Request Shapes per Endpoint

| Endpoint | Body Fields | Query Params | Path Params | Validation Rules Summary |
|----------|-------------|--------------|-------------|--------------------------|
| POST /auth/login | `email` (string, email), `password` (string), `rememberMe` (boolean, optional) | - | - | Email: valid format required. Password: required (no strength check on login). rememberMe: boolean optional. |
| POST /auth/verify-2fa | `token` (string, 6 digits), `tempToken` (string) | - | - | token: 6-digit numeric string required. tempToken: non-empty string required. |
| POST /auth/resend-2fa | `tempToken` (string) | - | - | tempToken: non-empty string, must be string type. |
| POST /auth/register | `firstname` (3-16 chars), `lastname` (3-16 chars), `email` (valid, no disposable), `password` (8-128 chars, complex), `confirmPassword` (match), `terms` (boolean=true) | - | - | Password: 1+ uppercase, 1+ lowercase, 1+ number, 1+ special char, no common passwords, no sequential chars, max 2 repeated chars, cannot contain email/firstname/lastname. |
| POST /auth/logout | - | - | - | No body validation. Requires refresh_token cookie. |
| POST /auth/logout-all | - | - | - | No body validation. Requires auth token + refresh_token cookie. |
| POST /auth/refresh | - | - | - | No body validation. Requires refresh_token cookie. |
| POST /auth/verify-email | `token` (string, 6-digit) | - | - | token: 6-digit numeric code, trimmed. |
| POST /auth/resend-verification | `email` (valid email) | - | - | Email: valid format required. |
| POST /auth/forgot-password | `email` (valid email) | - | - | Email: valid format required. |
| POST /auth/reset-password | `token` (64-char hex), `password` (complex), `confirmPassword` (match) | - | - | token: 64-char hex string. Password: same complexity rules as register. |
| GET /health | - | - | - | No validation. |
| GET /user/me | - | - | - | No body. Requires auth token. |
| PATCH /user/me | `firstname` (3-16 chars, letters/spaces), `lastname` (3-16 chars, letters/spaces) | - | - | Both: 3-16 chars, only letters and spaces allowed. |
| POST /user/profile/avatar | (multipart/form-data) | - | - | File upload via multer. No explicit body validation rules. |
| POST /user/email/request | `newEmail` (valid email), `currentPassword` (string) | - | - | newEmail: valid format, max 254 chars. currentPassword: non-empty string. |
| GET /user/email/confirm/:token | - | - | `token` (string) | No validation middleware. Token from URL param. |
| POST /user/security/password | `oldPassword` (string), `newPassword` (complex), `confirmPassword` (match) | - | - | oldPassword: non-empty, max 128 chars. newPassword: same complexity as register. |
| PATCH /user/security/2fa | `enable` (boolean), `currentPassword` (string) | - | - | enable: boolean required. currentPassword: non-empty string, max 128 chars. |
| Test routes | Varies | Varies | Varies | No validation (dev-only). |

---

## Table 3: Response Shapes per Endpoint

| Endpoint | Success Status | Success Body Shape | Error Codes Possible |
|----------|---------------|--------------------|----------------------|
| POST /auth/login | 200 | `{ success: true, message, data: { accessToken, user }, timestamp, requestId }` | INVALID_CREDENTIALS, EMAIL_NOT_VERIFIED, RATE_LIMITED, INTERNAL_ERROR |
| POST /auth/verify-2fa | 200 | `{ success: true, message, data: { accessToken, user }, timestamp, requestId }` | INVALID_TOKEN, TOKEN_EXPIRED, RATE_LIMITED, INTERNAL_ERROR |
| POST /auth/resend-2fa | 200 | `{ success: true, message, timestamp, requestId }` | RATE_LIMITED, INTERNAL_ERROR |
| POST /auth/register | 201 | `{ success: true, message, data: { user: { uuid, email, isVerified }, emailSent }, timestamp, requestId }` | VALIDATION_ERROR, CONFLICT, RATE_LIMITED, INTERNAL_ERROR |
| POST /auth/logout | 200 | `{ success: true, message, timestamp, requestId }` | UNAUTHORIZED (no cookie), RATE_LIMITED, INTERNAL_ERROR |
| POST /auth/logout-all | 200 | `{ success: true, message, timestamp, requestId }` | UNAUTHORIZED, RATE_LIMITED, INTERNAL_ERROR |
| POST /auth/refresh | 200 | `{ success: true, message, data: { accessToken, user }, timestamp, requestId }` | MISSING_REFRESH_TOKEN, TOKEN_EXPIRED, TOKEN_INVALID, TOKEN_REUSE_DETECTED, RATE_LIMITED, INTERNAL_ERROR |
| POST /auth/verify-email | 200 | `{ success: true, message, timestamp, requestId }` | INVALID_TOKEN, VERIFICATION_TOKEN_EXPIRED, ALREADY_VERIFIED, RATE_LIMITED, INTERNAL_ERROR |
| POST /auth/resend-verification | 200 | `{ success: true, message, timestamp, requestId }` | VALIDATION_ERROR, RATE_LIMITED, EMAIL_DISPATCH_FAILED, INTERNAL_ERROR |
| POST /auth/forgot-password | 200 | `{ success: true, message, timestamp, requestId }` | VALIDATION_ERROR, RATE_LIMITED, INTERNAL_ERROR |
| POST /auth/reset-password | 200 | `{ success: true, message, timestamp, requestId }` | INVALID_TOKEN, TOKEN_EXPIRED, VALIDATION_ERROR, RATE_LIMITED, INTERNAL_ERROR |
| GET /health | 200/503 | `{ status, timestamp, uptime, responseTimeMs, services: { mongodb, redis }, system: { nodeVersion, memoryUsage } }` | RATE_LIMITED |
| GET /user/me | 200 | `{ success: true, message, data: { user }, timestamp, requestId }` | UNAUTHORIZED, RATE_LIMITED, INTERNAL_ERROR |
| PATCH /user/me | 200 | `{ success: true, message, data: { user }, timestamp, requestId }` | UNAUTHORIZED, VALIDATION_ERROR, RATE_LIMITED, INTERNAL_ERROR |
| POST /user/profile/avatar | 200 | `{ success: true, message, data: { avatarUrl }, timestamp, requestId }` | UNAUTHORIZED, RATE_LIMITED, INTERNAL_ERROR |
| POST /user/email/request | 200 | `{ success: true, message, timestamp, requestId }` | UNAUTHORIZED, VALIDATION_ERROR, RATE_LIMITED, INTERNAL_ERROR |
| GET /user/email/confirm/:token | 200/302 | Redirect or success JSON | INVALID_TOKEN, TOKEN_EXPIRED, INTERNAL_ERROR |
| POST /user/security/password | 200 | `{ success: true, message, timestamp, requestId }` | UNAUTHORIZED, INVALID_CREDENTIALS, PASSWORD_SAME_AS_CURRENT, VALIDATION_ERROR, RATE_LIMITED, INTERNAL_ERROR |
| PATCH /user/security/2fa | 200 | `{ success: true, message, data: { twofaEnabled, backupCodes? }, timestamp, requestId }` | UNAUTHORIZED, INVALID_CREDENTIALS, VALIDATION_ERROR, RATE_LIMITED, INTERNAL_ERROR |
| Test routes | 200/400/500 | Varies | Varies |

---

## Table 4: Swagger/OpenAPI Documentation Status

| Check | Status | Details |
|-------|--------|---------|
| Swagger dependency installed? | ✅ | `swagger-jsdoc@^6.2.8`, `swagger-ui-express@^5.0.1` |
| Swagger config file exists? | ✅ | `backend/docs/swagger/index.js` |
| Swagger route mounted? | ✅ | `/api/docs` mounted in `app.js` via `mountSwagger(app)` |
| How many endpoints documented? | 11 | `/auth/login`, `/auth/register`, `/auth/logout`, `/auth/logout-all`, `/auth/refresh`, `/auth/verify-email`, `/auth/resend-verification`, `/auth/forgot-password`, `/auth/reset-password`, `/health`, `/user/me` |
| How many endpoints missing from spec? | 8 production endpoints | `POST /auth/verify-2fa`, `POST /auth/resend-2fa`, `PATCH /user/me`, `POST /user/profile/avatar`, `POST /user/email/request`, `GET /user/email/confirm/:token`, `POST /user/security/password`, `PATCH /user/security/2fa` |

---

## Table 5: Postman Collection Status

| Check | Status | Details |
|-------|--------|---------|
| Postman collection file exists? | ✅ | `backend/postman/New-Starter-Kit.postman_collection.json` |
| File size / last modified | 1300 lines / ~6KB | Last modified: unknown from git |
| How many requests in collection? | 17+ | 5 Auth + 2 Email Verification + 2 Password Recovery + 1 User + 1 Health + 6+ Security/Test |
| How many endpoints missing from collection? | 8 production endpoints | `POST /auth/verify-2fa`, `POST /auth/resend-2fa`, `PATCH /user/me`, `POST /user/profile/avatar`, `POST /user/email/request`, `GET /user/email/confirm/:token`, `POST /user/security/password`, `PATCH /user/security/2fa` |

---

## Table 6: Documentation Drift Summary

| Endpoint | In Code? | In Swagger? | In Postman? | Drift Type |
|----------|----------|-------------|-------------|------------|
| GET /api/v1/health | ✅ | ✅ | ✅ | NONE |
| POST /api/v1/auth/login | ✅ | ✅ | ✅ | NONE |
| POST /api/v1/auth/register | ✅ | ✅ | ✅ | NONE |
| POST /api/v1/auth/logout | ✅ | ✅ | ✅ | NONE |
| POST /api/v1/auth/logout-all | ✅ | ✅ | ✅ | NONE |
| POST /api/v1/auth/refresh | ✅ | ✅ | ✅ | NONE |
| POST /api/v1/auth/verify-email | ✅ | ✅ | ✅ | NONE |
| POST /api/v1/auth/resend-verification | ✅ | ✅ | ✅ | NONE |
| POST /api/v1/auth/forgot-password | ✅ | ✅ | ✅ | NONE |
| POST /api/v1/auth/reset-password | ✅ | ✅ | ✅ | NONE |
| POST /api/v1/auth/verify-2fa | ✅ | ❌ | ❌ | **CODE_ONLY** — Missing from both Swagger and Postman |
| POST /api/v1/auth/resend-2fa | ✅ | ❌ | ❌ | **CODE_ONLY** — Missing from both Swagger and Postman |
| GET /api/v1/user/me | ✅ | ✅ | ✅ | NONE |
| PATCH /api/v1/user/me | ✅ | ❌ | ❌ | **CODE_ONLY** — Missing from both Swagger and Postman |
| POST /api/v1/user/profile/avatar | ✅ | ❌ | ❌ | **CODE_ONLY** — Missing from both Swagger and Postman |
| POST /api/v1/user/email/request | ✅ | ❌ | ❌ | **CODE_ONLY** — Missing from both Swagger and Postman |
| GET /api/v1/user/email/confirm/:token | ✅ | ❌ | ❌ | **CODE_ONLY** — Missing from both Swagger and Postman |
| POST /api/v1/user/security/password | ✅ | ❌ | ❌ | **CODE_ONLY** — Missing from both Swagger and Postman |
| PATCH /api/v1/user/security/2fa | ✅ | ❌ | ❌ | **CODE_ONLY** — Missing from both Swagger and Postman |
| Test routes (/test/*) | ✅ [DEV] | ❌ | ✅ | TEST_ONLY — Documented in Postman only (dev endpoints) |

---

## Table 7: Error Code Registry

| errorCode | Used By (endpoints) | Documented in Swagger? | Documented in Postman? |
|-----------|--------------------|------------------------|------------------------|
| MISSING_CREDENTIALS | Login | ✅ | ✅ |
| INVALID_CREDENTIALS | Login, Change Password | ✅ | ✅ |
| ACCOUNT_DEACTIVATED | Login | ✅ (implied) | ❌ |
| ACCOUNT_LOCKED | Login | ❌ | ❌ |
| MISSING_REFRESH_TOKEN | Refresh | ✅ | ✅ |
| REFRESH_TOKEN_EXPIRED | Refresh | ✅ | ✅ |
| INVALID_TOKEN | Refresh, Verify Email, Email Confirm | ✅ | ✅ |
| TOKEN_NOT_ACTIVE | Refresh | ❌ | ❌ |
| TOKEN_VERSION_MISMATCH | Refresh | ❌ | ❌ |
| TOKEN_REUSE_DETECTED | Refresh | ✅ | ✅ |
| SESSION_INVALID | Logout, Logout-All | ❌ | ❌ |
| USER_NOT_FOUND | Multiple | ✅ (implied) | ❌ |
| BAD_REQUEST | Validation | ✅ | ✅ |
| MISSING_FIELDS | Validation | ❌ | ❌ |
| PASSWORDS_MISMATCH | Register, Reset Password, Change Password | ❌ | ❌ |
| INVALID_EMAIL | Validation | ✅ | ✅ |
| MISSING_PASSWORD | Login | ❌ | ❌ |
| PASSWORD_SAME_AS_CURRENT | Change Password | ❌ | ❌ |
| MISSING_VERIFICATION_CODE | Verify Email | ❌ | ❌ |
| INVALID_VERIFICATION_CODE | Verify Email | ❌ | ❌ |
| INVALID_RESET_TOKEN | Reset Password | ✅ | ✅ |
| NOT_FOUND | 404 Handler | ✅ | ✅ |
| CONFLICT | Register (duplicate email) | ✅ | ✅ |
| USER_EXISTS | Register | ❌ | ❌ |
| TOO_MANY_REQUESTS | Rate Limiting | ✅ | ✅ |
| REGISTRATION_RATE_LIMITED | Register | ❌ | ❌ |
| PASSWORD_RESET_RATE_LIMITED | Forgot/Reset Password | ❌ | ❌ |
| RATE_LIMITED | All rate-limited endpoints | ✅ | ✅ |
| INTERNAL_ERROR | Server errors | ✅ | ✅ |
| DATABASE_ERROR | DB failures | ❌ | ❌ |
| VERIFICATION_FAILED | Verify Email | ❌ | ❌ |
| RESET_FAILED | Reset Password | ❌ | ❌ |
| EMAIL_NOT_VERIFIED | Login | ✅ | ✅ |
| EMAIL_DISPATCH_FAILED | Resend Verification | ✅ | ✅ |
| ALREADY_VERIFIED | Verify Email | ✅ | ✅ |
| VERIFICATION_TOKEN_EXPIRED | Verify Email | ✅ | ✅ |
| TOKEN_EXPIRED | Refresh, Reset Password, Email Confirm | ✅ | ✅ |
| TOKEN_INVALID | Refresh | ✅ | ✅ |
| NO_ACCESS_TOKEN | Auth middleware | ✅ | ✅ |
| VALIDATION_ERROR | Validation failures | ✅ | ✅ |

---

## Table 8: Dependencies Audit

| Package | Installed? | Version | Purpose | Action Needed |
|---------|-----------|---------|---------|---------------|
| swagger-ui-express | ✅ | ^5.0.1 | Serve Swagger UI | None |
| swagger-jsdoc | ✅ | ^6.2.8 | Generate spec from JSDoc | None |
| @asteag/swagger-jsdoc | ❌ | N/A | Alternative JSDoc generator | N/A |
| express-openapi-validator | ❌ | N/A | Request validation from spec | Optional: Add for spec-first validation |
| postman-collection | ❌ | N/A | Programmatic Postman access | N/A |

---

## Summary & Recommendations

### Critical Findings

1. **8 Production Endpoints Undocumented** — The following implemented endpoints have ZERO documentation in both Swagger and Postman:
   - `POST /api/v1/auth/verify-2fa` — 2FA verification during login
   - `POST /api/v1/auth/resend-2fa` — Resend 2FA code
   - `PATCH /api/v1/user/me` — Update user profile
   - `POST /api/v1/user/profile/avatar` — Upload avatar
   - `POST /api/v1/user/email/request` — Request email change
   - `GET /api/v1/user/email/confirm/:token` — Confirm email change
   - `POST /api/v1/user/security/password` — Change password
   - `PATCH /api/v1/user/security/2fa` — Toggle 2FA

### Drift Classification

| Drift Type | Count | Endpoints |
|------------|-------|-----------|
| CODE_ONLY | 8 | All user profile/security endpoints + 2FA endpoints |
| DOC_ONLY | 0 | N/A |
| FIELD_MISMATCH | 0 | N/A |
| STALE_PATH | 0 | N/A |
| TEST_ONLY | 6+ | Test routes documented in Postman only (dev endpoints) |

### Recommended Actions

1. **Create Swagger path files** for all 8 missing endpoints in `backend/docs/swagger/paths/`
2. **Add Postman requests** for all 8 missing endpoints to the collection
3. **Update Swagger tags** — Consider adding "2FA" and "User Profile" tags
4. **Document error codes** — Many error codes from `error-constants.js` are not explicitly documented in Swagger responses
5. **Consider express-openapi-validator** for runtime spec validation

### Constitution Compliance Check

All documented endpoints properly follow the constitution rules:
- ✅ All routes prefixed with `/api/v1/`
- ✅ JWT tokens in HttpOnly cookies
- ✅ Error responses use centralized error handler
- ✅ No raw `res.status().json()` in controllers
- ✅ ESM imports used throughout

---

## Files Referenced

- `backend/app.js` — Route mounting
- `backend/routes/auth/auth-routes.js` — Auth route definitions
- `backend/routes/user/user-routes.js` — User route definitions
- `backend/routes/health/health-routes.js` — Health route
- `backend/routes/test/test-routes.js` — Test routes
- `backend/middleware/security/rate-limiters.js` — Rate limiter definitions
- `backend/validators/validationRules.js` — Validation rules
- `backend/utilities/general/response-manager.js` — Response envelope format
- `backend/controllers/auth/auth-shared.js` — sendUseCaseResponse wrapper
- `backend/errors/error-constants.js` — Error code registry
- `backend/docs/swagger/index.js` — Swagger configuration
- `backend/docs/swagger/paths/**/*.js` — Swagger path documentation
- `backend/docs/swagger/components/**/*.js` — Swagger schemas and responses
- `backend/postman/New-Starter-Kit.postman_collection.json` — Postman collection
- `backend/package.json` — Dependencies
