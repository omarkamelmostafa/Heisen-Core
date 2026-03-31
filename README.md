# HeisenCore — Enterprise-Grade Authentication Starter Kit

<p align="center">
  <strong>Production-ready full-stack authentication system with JWT, 2FA, and enterprise security patterns.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js" alt="Next.js 15">
  <img src="https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react" alt="React 19">
  <img src="https://img.shields.io/badge/Express.js-4.x-000000?style=flat-square&logo=express" alt="Express.js">
  <img src="https://img.shields.io/badge/MongoDB-8.x-47A248?style=flat-square&logo=mongodb" alt="MongoDB">
  <img src="https://img.shields.io/badge/Redis-7.x-DC382D?style=flat-square&logo=redis" alt="Redis">
  <img src="https://img.shields.io/badge/Redux_Toolkit-2.x-764ABC?style=flat-square&logo=redux" alt="Redux Toolkit">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=flat-square&logo=tailwindcss" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/Vitest-Coverage_100%25-6E9F18?style=flat-square&logo=vitest" alt="Vitest">
</p>

---

## 🎯 Quick Start

```bash
# 1. Clone and enter the project
git clone <repo-url> NEW-STARTER
cd NEW-STARTER

# 2. Install dependencies
cd backend && npm install
cd ../frontend && npm install

# 3. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with your secrets

# 4. Start infrastructure (MongoDB + Redis)
# Ensure MongoDB is running on localhost:27017
# Ensure Redis is running on localhost:6379

# 5. Launch development servers
cd backend && npm run server
cd ../frontend && npm run client
```

**Access points:**
- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:4000/api/v1
- 📚 API Docs: http://localhost:4000/api/docs
- 🔍 Health Check: http://localhost:4000/api/v1/health

---

## 🏗️ System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                        Next.js 15 Frontend                             │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐ │  │
│  │  │  (public)   │  │   (auth)    │  │ (protected) │  │   API Layer    │ │  │
│  │  │   /about    │  │   /login    │  │     /       │  │  /api/v1/*    │ │  │
│  │  │  /features  │  │  /signup    │  │  /settings  │  │  (proxied)     │ │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └───────────────┘ │  │
│  │                                                                        │  │
│  │  Redux Toolkit + RTK Query  →  HttpOnly Cookies  →  JWT Access Token   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API GATEWAY                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐    │
│  │                      Express.js Backend (ESM)                        │    │
│  │                                                                        │    │
│  │  ┌────────────────────────────────────────────────────────────────┐   │    │
│  │  │                    Security Middleware Layer                    │   │    │
│  │  │  • Helmet (security headers)  • Rate Limiting (tiered)        │   │    │
│  │  │  • CORS (credentials)           • XSS Sanitization (DOMPurify)  │   │    │
│  │  │  • Input Validation (express-validator)                         │   │    │
│  │  └────────────────────────────────────────────────────────────────┘   │    │
│  │                                    │                                  │    │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │    │
│  │  │                    API Version 1 (/api/v1)                     │  │    │
│  │  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │  │    │
│  │  │  │  /auth/*    │  │  /user/*    │  │      /health            │ │  │    │
│  │  │  │  • login    │  │  • /me      │  │    Health checks        │ │  │    │
│  │  │  │  • register │  │  • /profile │  └─────────────────────────┘ │  │    │
│  │  │  │  • refresh  │  │  • /avatar  │                              │  │    │
│  │  │  │  • 2fa      │  │  • /email   │                              │  │    │
│  │  │  │  • password │  │  • /security│                              │  │    │
│  │  │  └─────────────┘  └─────────────┘                              │  │    │
│  │  └─────────────────────────────────────────────────────────────────┘  │    │
│  │                                    │                                  │    │
│  │  ┌────────────────────────────────────────────────────────────────┐   │    │
│  │  │                    Application Layer                            │   │    │
│  │  │  Controllers → Use Cases → Services → Models                    │   │    │
│  │  └────────────────────────────────────────────────────────────────┘   │    │
│  └───────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                      ┌───────────────┴───────────────┐
                      ▼                               ▼
┌─────────────────────────────┐     ┌─────────────────────────────┐
│      PERSISTENCE LAYER       │     │       MESSAGE QUEUE          │
│  ┌───────────────────────┐  │     │  ┌───────────────────────┐  │
│  │      MongoDB          │  │     │  │        Redis            │  │
│  │  ┌─────────────────┐  │  │     │  │  ┌─────────────────┐  │  │
│  │  │   Users Collection│  │  │     │  │  │  Email Queue    │  │  │
│  │  │  • Profile data   │  │  │     │  │  │  (Bull)         │  │  │
│  │  │  • Password hash  │  │  │     │  │  └─────────────────┘  │  │
│  │  │  • 2FA secrets    │  │  │     │  │  ┌─────────────────┐  │  │
│  │  │  • Token version  │  │  │     │  │  │ Token Blacklist │  │  │
│  │  └─────────────────┘  │  │     │  │  │  (JTI → revoked)│  │  │
│  │  ┌─────────────────┐  │  │     │  │  └─────────────────┘  │  │
│  │  │RefreshToken Coll│  │  │     │  └───────────────────────────┘  │
│  │  │  • Hashed tokens│  │  │     └─────────────────────────────┘
│  │  │  • Expiry dates │  │  │
│  │  │  • Device info  │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
└─────────────────────────────┘
```

---

## 📁 Project Structure

```
NEW-STARTER/
├── 📁 backend/                     # Express.js API (ESM)
│   ├── 📁 config/                  # Database, Redis, Cloudinary, CORS
│   ├── 📁 controllers/             # HTTP request handlers
│   │   ├── 📁 auth/                # 11 auth controllers
│   │   └── 📁 user/                # 6 user controllers
│   ├── 📁 middleware/              # Express middleware
│   │   ├── 📁 auth/                # JWT verification
│   │   ├── 📁 core/                # Logging, body-parser, request-id
│   │   ├── 📁 security/            # Helmet, rate-limiters, XSS sanitize
│   │   ├── 📁 upload/              # Multer file upload
│   │   └── 📁 validation/          # express-validator handlers
│   ├── 📁 model/                   # Mongoose schemas
│   │   ├── User.js                 # User entity with security fields
│   │   └── RefreshToken.js         # Token rotation storage
│   ├── 📁 routes/                  # API route definitions
│   │   ├── 📁 auth/                # 11 public auth endpoints
│   │   ├── 📁 user/                # 7 protected user endpoints
│   │   └── 📁 health/              # System health checks
│   ├── 📁 services/                # Business logic services
│   │   ├── 📁 auth/                # Token & cookie services
│   │   └── 📁 email/               # Queue, templates, providers
│   ├── 📁 use-cases/               # Domain use cases
│   │   ├── 📁 auth/                # 12 auth use cases
│   │   └── 📁 user/                # 6 user use cases
│   ├── 📁 utilities/               # Shared utilities
│   │   ├── 📁 auth/                # Crypto, hash, user-data utils
│   │   └── 📁 general/               # Logger, response manager
│   ├── 📁 __tests__/               # Vitest test suites
│   │   ├── 📁 unit/                # 100% coverage utilities
│   │   └── 📁 integration/         # API integration tests
│   ├── 📁 docs/swagger/            # OpenAPI documentation
│   ├── app.js                      # Express app configuration
│   ├── index.js                    # Server bootstrap
│   ├── vitest.config.js            # 100% coverage thresholds
│   └── .env.example                # Environment template
│
├── 📁 frontend/                    # Next.js 15 Application
│   ├── 📁 src/
│   │   ├── 📁 app/                 # App Router
│   │   │   ├── 📁 (auth)/          # Public auth pages
│   │   │   │   ├── login/
│   │   │   │   ├── signup/
│   │   │   │   ├── forgot-password/
│   │   │   │   ├── reset-password/
│   │   │   │   └── verify-email/
│   │   │   ├── 📁 (protected)/     # Protected dashboard pages
│   │   │   │   ├── page.jsx        # Dashboard
│   │   │   │   └── 📁 settings/    # User settings
│   │   │   ├── 📁 (public)/        # Public marketing pages
│   │   │   ├── layout.jsx          # Root layout
│   │   │   └── globals.css         # Tailwind v4 + theme
│   │   ├── 📁 components/          # Shared UI components
│   │   ├── 📁 features/            # Feature-based modules
│   │   │   ├── 📁 auth/            # 64 auth components + 5 hooks
│   │   │   └── 📁 user/            # User feature modules
│   │   ├── 📁 hooks/               # Global custom hooks
│   │   ├── 📁 i18n/                # next-intl configuration
│   │   ├── 📁 lib/                 # Utility libraries
│   │   ├── 📁 providers/           # React context providers
│   │   ├── 📁 services/            # API service layer
│   │   ├── 📁 store/               # Redux Toolkit configuration
│   │   │   ├── index.js            # Store + persistence
│   │   │   ├── root-reducer.js     # Combined reducers
│   │   │   └── 📁 slices/          # Auth & user slices
│   │   └── middleware.js           # Route protection middleware
│   ├── next.config.mjs             # Next.js + security headers
│   └── package.json
│
├── 📁 specs/                       # Speckit specifications
│   └── 001-auth-session-starter/
│       ├── spec.md                 # Feature specification
│       ├── plan.md                 # Implementation plan
│       ├── tasks.md                # Task breakdown
│       └── docs/                   # Architecture docs
│
└── 📁 docs/architecture/           # System documentation
    ├── 01-SYSTEM-OVERVIEW.md
    ├── 02-BACKEND-ARCHITECTURE.md
    ├── 03-FRONTEND-ARCHITECTURE.md
    ├── 04-AUTH-SYSTEM.md
    ├── 05-DATABASE-DESIGN.md
    └── 06-INFRASTRUCTURE.md
```

---

## 🔐 Security Architecture

### Authentication Flow (JWT + HttpOnly Cookies)

```
┌─────────┐     ┌─────────────────────────────────────────────────────────────┐
│  Client │     │                         Server                              │
└────┬────┘     └─────────────────────────────────────────────────────────────┘
     │                                                                          
     │  POST /api/v1/auth/login                                                
     │  { email, password }                                                    
     │ ───────────────────────────────────────────────────────────────────────▶
     │                              ┌─────────────────┐                         
     │                              │   Validate creds  │                        
     │                              │   Check 2FA flag  │                        
     │                              └────────┬────────┘                         
     │                                       │                                  
     │  ◀────────────────────────────────────┼──────────────────────────────────
     │  { tempToken } (if 2FA enabled)      │                                  
     │                                       ▼                                  
     │                              ┌─────────────────┐                         
     │                              │  Generate tokens │                        
     │                              │  • Access (15m)  │                        
     │                              │  • Refresh (7d)  │                        
     │                              └────────┬────────┘                         
     │                                       │                                  
     │  ◀────────────────────────────────────┼──────────────────────────────────
     │  Set-Cookie: refresh_token=xxx      │                                  
     │  { accessToken, user }                │                                  
     │                                                                          
     │  POST /api/v1/auth/refresh                                              
     │  Cookie: refresh_token=xxx                                              
     │ ───────────────────────────────────────────────────────────────────────▶
     │                              ┌─────────────────┐                         
     │                              │  Verify + Rotate │                        
     │                              │  • Check Redis   │                        
     │                              │  • Check version │                        
     │                              └────────┬────────┘                         
     │                                       │                                  
     │  ◀────────────────────────────────────┼──────────────────────────────────
     │  New accessToken + rotated cookie     │                                  
     │                                                                          
     │  POST /api/v1/auth/logout                                               
     │  Authorization: Bearer {access}                                         
     │  Cookie: refresh_token=xxx                                              
     │ ───────────────────────────────────────────────────────────────────────▶
     │                              ┌─────────────────┐                         
     │                              │  Blacklist JTI   │                        
     │                              │  Clear cookies   │                        
     │                              │  Revoke tokens   │                        
     │                              └─────────────────┘                         
```

### Security Measures Implemented

| Layer | Protection | Implementation |
|-------|-----------|----------------|
| **Transport** | HTTPS enforcement | Production-only, HSTS headers |
| **Headers** | Security headers | Helmet.js + CSP in Next.js |
| **Auth** | JWT security | HttpOnly cookies, iss/aud/exp/jti claims, token versioning |
| **Session** | Token rotation | Refresh tokens rotated on every use, stored hashed |
| **Validation** | Input sanitization | DOMPurify XSS, express-validator, zod schemas |
| **Rate Limiting** | Tiered limits | Login: 5/15min, Register: 3/hr, Reset: 3/hr |
| **Passwords** | Secure storage | bcrypt (salt rounds: 12), strength via zxcvbn |
| **2FA** | TOTP codes | Time-based codes, 10min expiry, rate limited |
| **CORS** | Origin control | Credentials enabled, whitelist validation |
| **Secrets** | Key management | Environment-only, validation at startup |

---

## 🧪 Testing Strategy

```
┌─────────────────────────────────────────────────────────────────┐
│                     TEST PYRAMID                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│     ┌─────────────┐                                             │
│     │   E2E       │  Playwright (future)                        │
│     │  (UI flow)  │  Critical user journeys                      │
│     └──────┬──────┘                                             │
│            │                                                    │
│     ┌──────┴──────┐                                             │
│     │ Integration │  Supertest + MongoDB Memory Server          │
│     │   (API)     │  30s timeout, full request/response cycle    │
│     └──────┬──────┘                                             │
│            │                                                    │
│  ┌─────────┴──────────┐  100% Coverage Thresholds:               │
│  │       Unit         │  • Statements: 100%                      │
│  │  (Utilities/Svc)   │  • Branches: 100%                        │
│  │                    │  • Functions: 100%                       │
│  └────────────────────┘  • Lines: 100%                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Test Commands:
  cd backend && npm run test:unit         # Unit tests only
  cd backend && npm run test:integration  # Integration tests only  
  cd backend && npm run test:coverage     # Coverage report with thresholds
  cd backend && npm run test              # All tests
```

---

## 📦 Technology Stack

### Backend Dependencies

| Category | Package | Purpose |
|----------|---------|---------|
| **Core** | express ^4.18.2 | Web framework |
| **Database** | mongoose ^8.0.1 | MongoDB ODM |
| **Cache/Queue** | ioredis ^5.4.1, bull ^4.16.5 | Redis + job queues |
| **Auth** | jsonwebtoken ^9.0.2, bcrypt ^5.1.1 | JWT + password hashing |
| **Security** | helmet ^7.1.0, express-rate-limit ^7.1.5, xss ^1.0.14 | Security middleware |
| **Validation** | express-validator ^7.1.0 | Input validation |
| **Email** | nodemailer ^7.0.13, resend ^6.9.3, mailtrap ^4.4.0 | Email delivery |
| **Upload** | multer ^1.4.4, cloudinary ^2.7.0 | File uploads |
| **Testing** | vitest ^4.1.0, supertest ^7.2.2, mongodb-memory-server ^11.0.1 | Test framework |
| **Docs** | swagger-jsdoc ^6.2.8, swagger-ui-express ^5.0.1 | API documentation |

### Frontend Dependencies

| Category | Package | Purpose |
|----------|---------|---------|
| **Core** | next ^15.5.4, react ^19.1.0 | Framework |
| **State** | @reduxjs/toolkit ^2.9.2, react-redux ^9.2.0, redux-persist ^6.0.0 | State management |
| **Forms** | react-hook-form ^7.64.0, @hookform/resolvers ^5.2.2, zod ^4.1.12 | Form handling |
| **UI** | @radix-ui/*, tailwindcss ^4, framer-motion ^12.23.22 | Components + styling |
| **i18n** | next-intl ^4.8.3 | Internationalization |
| **HTTP** | axios ^1.12.2 | API client |
| **Icons** | lucide-react ^0.545.0 | Icon library |

---

## 📚 Documentation

| Document | Description | Location |
|----------|-------------|----------|
| **System Overview** | High-level architecture | `docs/architecture/01-SYSTEM-OVERVIEW.md` |
| **Backend Architecture** | API design patterns | `docs/architecture/02-BACKEND-ARCHITECTURE.md` |
| **Frontend Architecture** | Next.js app structure | `docs/architecture/03-FRONTEND-ARCHITECTURE.md` |
| **Auth System** | Security implementation | `docs/architecture/04-AUTH-SYSTEM.md` |
| **Database Design** | Schema documentation | `docs/architecture/05-DATABASE-DESIGN.md` |
| **Infrastructure** | Deployment guide | `docs/architecture/06-INFRASTRUCTURE.md` |
| **Feature Spec** | 001-auth-session-starter spec | `specs/001-auth-session-starter/spec.md` |
| **API Documentation** | Swagger/OpenAPI | `http://localhost:4000/api/docs` |

---

## 🤝 Contributing

This project follows the **Speckit Workflow**:

```
specify → clarify → plan → checklist → tasks → analyze → implement → validate → document
```

See `.speckit/` directory for workflow definitions and `.windsurfrules` for coding standards.

---

## 📄 License

ISC © Heisenberg

---

<p align="center">
  <strong>Built with enterprise-grade security patterns and modern development practices.</strong>
</p>
