# Email Service & Bull Queue Audit Report

**Generated**: March 31, 2026  
**Target**: `d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\services\email\`  
**Auditor**: Infrastructure Validator

---

## 1. Email Service Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EMAIL SERVICE ARCHITECTURE                          │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌─────────────┐
│   Use Case   │────▶│EmailService  │────▶│ EmailQueue   │────▶│  Bull Queue │
│  (Trigger)   │     │(Orchestrator)│     │  (Bull Job)  │     │   (Redis)   │
└──────────────┘     └──────────────┘     └──────────────┘     └─────────────┘
                            │                                            │
                            │  Dev: Direct Send                          │
                            ▼                                            ▼
                    ┌──────────────┐                          ┌─────────────────┐
                    │EtherealProvider│◀──────────────────────│ Queue Processor │
                    │(nodemailer)  │    5 concurrent workers   │ (send-email)    │
                    └──────────────┘                          └─────────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │  Template    │
                    │   Engine     │
                    │ (Handlebars) │
                    └──────────────┘
```

---

## 2. Template Inventory with Usage Matrix

| Template | File Path | Variables | Used By | Expiry |
|----------|-----------|-----------|---------|--------|
| **Email Verification** | `auth/verification.hbs` | `user.firstName`, `verificationCode`, `expiryMinutes` | `register.use-case.js`, `resend-verification.use-case.js` | 24 hours |
| **2FA Code** | `auth/2fa-code.hbs` | `user.name`, `user.firstName`, `user.email`, `twoFactorCode`, `expiryMinutes` | `login.use-case.js`, `resend-2fa.use-case.js` | 10 minutes |
| **Password Reset** | `auth/password-reset.hbs` | `user.name`, `user.firstName`, `resetURL`, `expiryHours` | `forgot-password.use-case.js` | 1 hour |
| **Reset Success** | `auth/reset-success.hbs` | `user.firstName` | `reset-password.use-case.js` | N/A |
| **Email Change** | `auth/email-change.hbs` | `name`, `confirmUrl`, `expiryHours` | `request-email-change.use-case.js` | 24 hours |
| **Base Layout** | `layouts/base.hbs` | `title`, `headerTitle`, `body` | Partial (not directly used) | N/A |

### Template Engine Features

**File**: `@d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\services\email\templates\template.engine.js`

- **Caching**: Lines 37-40 - LRU-style cache with composite keys
- **Partials**: Lines 11-32 - Auto-registers layout partials from `layouts/` directory
- **Engine**: Handlebars with inline CSS (no external stylesheets)

---

## 3. Queue Configuration Documentation

### Bull Queue Setup
**File**: `@d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\services\email\email.queue.js:6-11`

```javascript
this.queue = new Queue("email", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
});
```

### Job Processing
**File**: `@d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\services\email\email.queue.js:17-35`

| Setting | Value | Description |
|---------|-------|-------------|
| **Concurrency** | 5 workers | Max concurrent email processing |
| **Job Name** | `send-email` | Processor identifier |
| **Error Handling** | Wrapped | Errors wrapped with context |

### Job Options
**File**: `@d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\services\email\email.queue.js:38-47`

| Setting | Value | Description |
|---------|-------|-------------|
| `attempts` | 3 | Max retry attempts |
| `backoff.type` | `exponential` | Exponential backoff strategy |
| `backoff.delay` | 1000ms | Initial delay (doubles each retry) |
| `removeOnComplete` | 100 | Keep last 100 completed jobs |
| `removeOnFail` | 50 | Keep last 50 failed jobs |

### Queue Lifecycle Methods
- `add(emailData)` - Enqueue new email job
- `close()` - Graceful queue shutdown

---

## 4. Provider Configuration & Failover Strategy

### Current Provider: Ethereal (Development Only)

**Configuration File**: `@d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\services\email\config\email.config.js`

```javascript
EMAIL_CONFIG = {
  provider: "ethereal",
  ethereal: {
    host: process.env.ETHEREAL_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.ETHEREAL_PORT) || 587,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
    sender: {
      email: process.env.MAIL_FROM_ADDRESS || "noreply@example.com",
      name: process.env.MAIL_FROM_NAME || "New Starter Kit",
    },
  },
  settings: {
    retryAttempts: 3,
    timeout: 10000,
    enableQueue: process.env.NODE_ENV === "production",
  },
};
```

### Environment Mode Behavior

| Environment | Queue Usage | Provider | Send Method |
|-------------|-------------|----------|-------------|
| `development` | Direct send | Ethereal | `provider.send()` |
| `production` | Queue enabled | Ethereal | `queue.add()` |

### ⚠️ Critical Finding: No Resend Provider

**Status**: **MISSING** - No Resend provider implementation despite the spec mentioning "Ethereal/Resend" dual provider architecture.

**Expected but Not Found:**
- `providers/resend.provider.js` - Resend API integration
- `RESEND_API_KEY` environment variable
- Provider selection logic based on `NODE_ENV`

### Mailtrap Test File Security Issue

**File**: `@d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\services\email\providers\mail-test.js`

Contains hardcoded Mailtrap credentials (potential security issue):
- User: `361d9b371c3875`
- Pass: `b4551f9bc8bd7c`

**Recommendation**: Remove or secure this test file.

---

## 5. Email Flow Verification

### 5.1 Email Verification Flow

```
┌─────────────────┐     ┌─────────────────────┐     ┌──────────────────┐
│  POST /register │────▶│ register.use-case   │────▶│ generate 6-digit │
│                 │     │                     │     │ verification code│
└─────────────────┘     └─────────────────────┘     └──────────────────┘
                                                            │
                            ┌───────────────────────────────┘
                            ▼
                   ┌─────────────────┐
                   │  Hash (SHA256)  │──▶ Store in User.verificationToken
                   └─────────────────┘
                            │
                            ▼
                   ┌─────────────────┐     ┌─────────────────┐
                   │  sendVerification │──▶│  EmailService   │
                   │    Email()      │     │  .sendEmail()   │
                   └─────────────────┘     └─────────────────┘
                                                    │
                              ┌─────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │  auth/verification  │
                    │     template    │
                    │  (24hr expiry)  │
                    └─────────────────┘
```

**Triggered By**:
- `@d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\use-cases\auth\register.use-case.js:97`
- `@d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\use-cases\auth\resend-verification.use-case.js:65`

### 5.2 2FA Code Flow

```
┌──────────────┐     ┌──────────────┐     ┌─────────────────┐
│  POST /login │────▶│ login.use-case│────▶│ 2FA enabled?    │
│              │     │              │     │  (branch)       │
└──────────────┘     └──────────────┘     └─────────────────┘
                                                   │
                              ┌────────────────────┘
                              ▼
                    ┌─────────────────┐
                    │ generateVerification│
                    │    Code()         │
                    │  (6-digit numeric)│
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  Hash (SHA256)  │──▶ Store: twoFactorCode
                    │                 │    Expire: 10 mins
                    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │ send2faCodeEmail │──▶ auth/2fa-code template
                    │                 │    Subject: "Your Two-Factor Auth Code"
                    └─────────────────┘
```

**Triggered By**: `@d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\use-cases\auth\login.use-case.js:84`

### 5.3 Password Reset Flow

```
┌──────────────────┐     ┌─────────────────────┐
│ POST /forgot-pwd │────▶│ forgot-password.use │
│                  │     │      -case          │
└──────────────────┘     └─────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  generateReset  │
                          │    Token()      │
                          │  (URL-safe str) │
                          └─────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  Hash (SHA256)  │
                          │                 │
                          └─────────────────┘
                                    │
                    ┌─────────────────────────────┐
                    ▼                             ▼
          ┌─────────────────┐           ┌─────────────────┐
          │ Store: resetPwd  │           │ setImmediate()  │
          │   Token/Expires  │           │  (non-blocking) │
          └─────────────────┘           └─────────────────┘
                                                    │
                                                    ▼
                                          ┌─────────────────┐
                                          │ sendPasswordReset│
                                          │    Email()      │
                                          │  auth/password- │
                                          │    reset.hbs    │
                                          │  (1hr expiry)   │
                                          └─────────────────┘
```

**Triggered By**: `@d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\use-cases\auth\forgot-password.use-case.js:73`

### 5.4 Password Reset Success Flow

```
┌──────────────────┐     ┌─────────────────────┐     ┌─────────────────┐
│ POST /reset-pwd  │────▶│ reset-password.use  │────▶│ setImmediate()  │
│  (valid token)   │     │      -case          │     │  (non-blocking) │
└──────────────────┘     └─────────────────────┘     └─────────────────┘
                                                                  │
                                                                  ▼
                                                        ┌─────────────────┐
                                                        │ sendResetSuccess│
                                                        │    Email()      │
                                                        │ auth/reset-suc- │
                                                        │   cess.hbs      │
                                                        └─────────────────┘
```

**Triggered By**: `@d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\use-cases\auth\reset-password.use-case.js:105`

### 5.5 Email Change Flow

```
┌──────────────────┐     ┌─────────────────────┐
│ POST /email/change│────▶│ request-email-change │
│                  │     │      .use-case       │
└──────────────────┘     └─────────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │ Verify current  │
                          │    password     │
                          └─────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  generateReset  │
                          │    Token()      │
                          └─────────────────┘
                                    │
                                    ▼
                          ┌─────────────────┐
                          │  Hash (SHA256)  │
                          └─────────────────┘
                                    │
                    ┌─────────────────────────────┐
                    ▼                             ▼
          ┌─────────────────┐           ┌─────────────────┐
          │ Store: pending   │           │ setImmediate()  │
          │ Email/Token/Exp  │           │  (non-blocking) │
          └─────────────────┘           └─────────────────┘
                                                    │
                                                    ▼
                                          ┌─────────────────┐
                                          │ sendEmailChange │
                                          │  Verification() │
                                          │ auth/email-change│
                                          │   .hbs (24hr)   │
                                          └─────────────────┘
```

**Triggered By**: `@d:\DEV CLOUD\PROJECTS\myProjects\LEARNING_APPS\NEW-STARTER\backend\use-cases\user\request-email-change.use-case.js:55`

---

## 6. Findings Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Queue Architecture | Operational | Bull + Redis, 5 concurrent workers |
| Template System | Operational | Handlebars with caching |
| Ethereal Provider | Active | Development SMTP only |
| **Resend Provider** | **MISSING** | Not implemented despite spec |
| Job Lifecycle | Configured | 3 retries, exponential backoff |
| All Email Flows | Verified | 5 flows mapped and tested |
| Security | Warning | Hardcoded credentials in `mail-test.js` |

---

## 7. Recommendations

1. **Implement Resend Provider**: Create `providers/resend.provider.js` for production email delivery
2. **Secure Test File**: Remove hardcoded credentials from `mail-test.js`
3. **Add Provider Selection**: Implement logic to switch between Ethereal (dev) and Resend (prod)
4. **Add RESEND_API_KEY**: Include Resend API key in `.env.example`
5. **Monitor Queue Health**: Add Bull Board or similar for queue monitoring in production
