# Setup Guide — HeisenCore Authentication Starter

> **Prerequisites:** Node.js 18+, Git, and basic knowledge of MongoDB/Redis

---

## Table of Contents

1. [Quick Start (5 minutes)](#quick-start-5-minutes)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Development Workflow](#development-workflow)
7. [Testing](#testing)
8. [Production Deployment](#production-deployment)
9. [Troubleshooting](#troubleshooting)
10. [Architecture Validation Commands](#architecture-validation-commands)

---

## Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone <repository-url> NEW-STARTER
cd NEW-STARTER

# 2. Install all dependencies
cd backend && npm install
cd frontend && npm install
# Or manually:
cd backend && npm install
cd ../frontend && npm install

# 3. Start MongoDB and Redis
# Windows: Start MongoDB service + Redis server
# macOS: brew services start mongodb-community && redis-server
# Docker: docker-compose up -d mongo redis

# 4. Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env (see Environment Configuration section)

# 5. Start development servers
# Terminal 1: cd backend && npm run server
# Terminal 2: cd frontend && npm run client
# Or start separately:
# Terminal 1: cd backend && npm run server
# Terminal 2: cd frontend && npm run client
```

**Access Points:**
- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:4000/api/v1
- 📚 API Docs: http://localhost:4000/api/docs

---

## Prerequisites

### Required Software

| Software | Minimum Version | Installation |
|----------|-----------------|--------------|
| Node.js | 18.x LTS | [nodejs.org](https://nodejs.org) |
| npm | 9.x | Included with Node.js |
| MongoDB | 6.x | [mongodb.com](https://mongodb.com) |
| Redis | 7.x | [redis.io](https://redis.io) |
| Git | 2.x | [git-scm.com](https://git-scm.com) |

### Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be v18.x.x or higher

# Check npm version
npm --version   # Should be 9.x.x or higher

# Check MongoDB
mongod --version  # Should be 6.x.x or higher

# Check Redis
redis-server --version  # Should be v=7.x.x or higher
```

---

## Installation

### Step 1: Clone Repository

```bash
git clone <your-repo-url> NEW-STARTER
cd NEW-STARTER
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

**What gets installed:**
- Express.js framework and middleware
- MongoDB/Mongoose ODM
- Redis client (ioredis)
- JWT authentication libraries
- Security middleware (helmet, rate-limiting, XSS)
- Email services (nodemailer, resend)
- Testing framework (vitest, supertest)
- API documentation (swagger)

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

**What gets installed:**
- Next.js 15 framework
- React 19 and React DOM
- Redux Toolkit + React Redux
- Tailwind CSS v4
- Radix UI components
- Form handling (react-hook-form, zod)
- i18n (next-intl)
- Animation (framer-motion)

### Step 4: Verify Installation

```bash
# Check backend
ls backend/node_modules | head -10

# Check frontend
ls frontend/node_modules | head -10
```

---

## Environment Configuration

### Step 1: Copy Environment Template

```bash
cp backend/.env.example backend/.env
```

### Step 2: Generate JWT Secrets

```bash
# Open Node.js REPL
node

# Generate secure secrets
require('crypto').randomBytes(64).toString('hex')  # ACCESS_TOKEN_SECRET
require('crypto').randomBytes(64).toString('hex')  # REFRESH_TOKEN_SECRET

# Exit REPL
.exit
```

### Step 3: Configure Environment Variables

Edit `backend/.env`:

```env
# ━━━ Server ━━━
NODE_ENV=development
PORT=4000

# ━━━ Database ━━━
DB_CONNECTION_MODE=local
DB_LOCAL_HOST=localhost
DB_LOCAL_PORT=27017
DB_LOCAL_NAME=new-starter

# ━━━ Authentication (REQUIRED) ━━━
ACCESS_TOKEN_SECRET=your-generated-access-secret-here
REFRESH_TOKEN_SECRET=your-generated-refresh-secret-here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d
JWT_ISSUER=new-starter-backend-v1
JWT_AUDIENCE=new-starter-web-client

# ━━━ Email — Ethereal (https://ethereal.email) ━━━
# 1. Visit https://ethereal.email/create
# 2. Copy credentials below
ETHEREAL_HOST=smtp.ethereal.email
ETHEREAL_PORT=587
ETHEREAL_USER=your-ethereal-username
ETHEREAL_PASS=your-ethereal-password
MAIL_FROM_ADDRESS=noreply@example.com
MAIL_FROM_NAME=New Starter Kit

# ━━━ CORS ━━━
ALLOWED_ORIGINS=http://localhost:3000
FRONTEND_URL=http://localhost:3000

# ━━━ Redis ━━━
REDIS_HOST=localhost
REDIS_PORT=6379

# ━━━ Logging ━━━
LOG_LEVEL=info

# ━━━ Rate Limiting ━━━
RATE_LIMIT_LOGIN_MAX=5
RATE_LIMIT_LOGIN_WINDOW_MS=900000
RATE_LIMIT_REGISTER_MAX=3
RATE_LIMIT_REGISTER_WINDOW_MS=3600000
```

### Environment Variable Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NODE_ENV` | Yes | `development` | Environment mode |
| `PORT` | Yes | `4000` | Backend server port |
| `DB_CONNECTION_MODE` | Yes | `local` | `local` or `atlas` |
| `DATABASE_URI` | If `atlas` | - | MongoDB Atlas connection string |
| `ACCESS_TOKEN_SECRET` | **CRITICAL** | - | 64-byte hex secret |
| `REFRESH_TOKEN_SECRET` | **CRITICAL** | - | 64-byte hex secret |
| `ETHEREAL_USER` | Recommended | - | Ethereal.email username |
| `ETHEREAL_PASS` | Recommended | - | Ethereal.email password |
| `REDIS_HOST` | Yes | `localhost` | Redis server host |
| `ALLOWED_ORIGINS` | Recommended | `http://localhost:3000` | CORS whitelist |

### Frontend Environment Variables

Create `frontend/.env.local`:

```bash
cp frontend/.env.example frontend/.env.local
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_PORT` | Recommended | `3000` | Next.js dev server port |
| `NEXT_PUBLIC_API_URL` | Recommended | `http://localhost:4000` | Backend API base URL |
| `NEXT_PUBLIC_APP_URL` | Recommended | `http://localhost:3000` | Full frontend URL for metadata |

---

## Database Setup

### Option A: Local MongoDB

**Windows:**
```powershell
# Start MongoDB service
net start MongoDB

# Or run manually
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" --dbpath "C:\data\db"
```

**macOS:**
```bash
# Using Homebrew
brew services start mongodb-community

# Or run manually
mongod --config /usr/local/etc/mongod.conf
```

**Linux:**
```bash
# Using systemd
sudo systemctl start mongod

# Or run manually
sudo mongod --fork --logpath /var/log/mongodb.log
```

### Option B: MongoDB Atlas (Cloud)

1. Create account at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create new cluster (free tier available)
3. Get connection string from Dashboard → Connect → Drivers → Node.js
4. Set `DB_CONNECTION_MODE=atlas` in `.env`
5. Set `DATABASE_URI=mongodb+srv://username:password@cluster.mongodb.net/`

### Option C: Docker (Recommended for Teams)

```bash
# Create docker-compose.yml
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db
    environment:
      MONGO_INITDB_ROOT_USERNAME: admin
      MONGO_INITDB_ROOT_PASSWORD: password

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  mongo_data:
  redis_data:
EOF

# Start services
docker-compose up -d

# Verify
docker-compose ps
```

### Redis Setup

**Windows:**
```powershell
# Using Memurai (Redis for Windows)
# Download from https://memurai.com

# Or WSL
wsl redis-server
```

**macOS/Linux:**
```bash
# Start Redis
redis-server

# Or as service
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### Verify Database Connections

```bash
cd backend

# Test MongoDB connection
node -e "
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/new-starter')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));
"

# Test Redis connection
node -e "
const Redis = require('ioredis');
const redis = new Redis({ host: 'localhost', port: 6379 });
redis.ping().then(() => {
  console.log('✅ Redis connected');
  redis.disconnect();
}).catch(err => console.error('❌ Redis error:', err));
"
```

---

## Development Workflow

### Start Development Servers

**Option 1: Concurrent (Recommended)**
```bash
# From project root — open two terminals
# Terminal 1: Backend
cd backend && npm run server

# Terminal 2: Frontend
cd frontend && npm run client
```

**Option 2: Separate Terminals**
```bash
# Terminal 1: Backend
cd backend
npm run server
# Output: 🚀 Server started on port 4000

# Terminal 2: Frontend
cd frontend
npm run client
# Output: 🚀 Next.js ready on http://localhost:3000
```

### Development Scripts Reference

| Command | Location | Description |
|---------|----------|-------------|
| `npm run server` | backend/ | Start backend with nodemon |
| `npm run client` | frontend/ | Start Next.js dev server |
| `npm run lint` | frontend/ | Run ESLint |
| `npm run build` | frontend/ | Production build |

### First Run Verification Checklist

- [ ] Backend starts without errors: `✅ Database connection verified`
- [ ] Frontend compiles: `✓ Ready on http://localhost:3000`
- [ ] API health check: http://localhost:4000/api/v1/health returns `200 OK`
- [ ] API docs load: http://localhost:4000/api/docs shows Swagger UI
- [ ] Frontend loads: http://localhost:3000 shows login page
- [ ] Can register a test user
- [ ] Can login with created user
- [ ] Can access protected route (dashboard)

---

## Testing

### Run All Tests

```bash
cd backend

# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Run with coverage (100% thresholds enforced)
npm run test:coverage
```

### Test Structure

```
backend/__tests__/
├── unit/                    # Unit tests (100% coverage required)
│   ├── utilities/           # Utility function tests
│   ├── services/            # Service layer tests
│   └── auth/                # Auth utility tests
└── integration/             # API integration tests
    ├── auth/                # Auth endpoint tests
    ├── user/                # User endpoint tests
    └── setup.js             # Test environment setup
```

### Writing Tests

**Unit Test Example:**
```javascript
// backend/__tests__/unit/utilities/hash-utils.test.js
import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword } from '../../../utilities/auth/hash-utils.js';

describe('hashPassword', () => {
  it('should hash password with bcrypt', async () => {
    const password = 'SecurePass123!';
    const hashed = await hashPassword(password);
    
    expect(hashed).toBeDefined();
    expect(hashed).not.toBe(password);
    expect(await comparePassword(password, hashed)).toBe(true);
  });
});
```

**Integration Test Example:**
```javascript
// backend/__tests__/integration/auth/login.test.js
import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../../../app.js';

describe('POST /api/v1/auth/login', () => {
  it('should return 401 for invalid credentials', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'wrong@example.com', password: 'wrong' });
    
    expect(response.status).toBe(401);
    expect(response.body.errorCode).toBe('INVALID_CREDENTIALS');
  });
});
```

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Generate new JWT secrets (different from development)
- [ ] Configure production MongoDB (Atlas recommended)
- [ ] Configure production Redis (Redis Cloud/AWS ElastiCache)
- [ ] Set up production email provider (Resend/Postmark/SendGrid)
- [ ] Configure HTTPS/TLS certificates
- [ ] Set secure `COOKIE_DOMAIN`
- [ ] Review rate limiting settings
- [ ] Enable production logging
- [ ] Run full test suite

### Environment Variables (Production)

```env
NODE_ENV=production
PORT=4000

# Production Database (Atlas)
DB_CONNECTION_MODE=atlas
DATABASE_URI=mongodb+srv://prod-user:password@cluster.mongodb.net/new-starter-prod
DB_ATLAS_NAME=new-starter-prod

# Production Secrets (GENERATE NEW ONES)
ACCESS_TOKEN_SECRET=prod-access-secret-64-char-hex
REFRESH_TOKEN_SECRET=prod-refresh-secret-64-char-hex

# Production Email (Resend)
RESEND_API_KEY=re_xxxxxxxx
MAIL_FROM_ADDRESS=noreply@yourdomain.com
MAIL_FROM_NAME=Your App Name

# Production Redis
REDIS_HOST=your-redis-host.redis-cloud.com
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password

# Security
COOKIE_DOMAIN=.yourdomain.com
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
FRONTEND_URL=https://yourdomain.com

# Logging
LOG_LEVEL=warn
```

### Build for Production

```bash
# Frontend build
cd frontend
npm run build

# Backend requires no build (ESM native)
# Just ensure dependencies installed
cd ../backend
npm ci --only=production
```

### Deployment Options

**Option 1: Traditional VPS (DigitalOcean, Linode, AWS EC2)**
```bash
# 1. SSH to server
ssh user@server-ip

# 2. Clone and setup
git clone <repo>
cd NEW-STARTER
cd backend && npm install
cd ../frontend && npm install

# 3. Configure environment
nano backend/.env

# 4. Start with PM2
npm install -g pm2
cd backend
pm2 start index.js --name "api"
cd ../frontend
pm2 start npm --name "web" -- run start

# 5. Configure Nginx reverse proxy
sudo nano /etc/nginx/sites-available/yourdomain
```

**Option 2: Docker Deployment**
```bash
# Build images
docker build -t new-starter-backend ./backend
docker build -t new-starter-frontend ./frontend

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

**Option 3: Serverless (Vercel + Railway/Render)**
- Frontend: Deploy to Vercel
- Backend: Deploy to Railway/Render/Fly.io
- Database: MongoDB Atlas
- Cache: Redis Cloud

---

## Troubleshooting

### Backend Issues

#### ❌ "Error: Cannot find module"

**Cause:** Dependencies not installed or ESM import issue

**Solution:**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

#### ❌ "MongoDB connection failed"

**Symptoms:**
```
❌ Error while connecting to database: connect ECONNREFUSED 127.0.0.1:27017
```

**Solutions:**

1. **Check MongoDB is running:**
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb-community

# Linux
sudo systemctl status mongod
```

2. **Verify connection string:**
```bash
# Test with MongoDB shell
mongosh "mongodb://localhost:27017/new-starter"
```

3. **Check firewall:**
```bash
# Windows - allow MongoDB through firewall
netsh advfirewall firewall add rule name="MongoDB" dir=in action=allow protocol=TCP localport=27017
```

#### ❌ "Redis connection failed"

**Symptoms:**
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solutions:**
```bash
# Start Redis
redis-server

# Or using Docker
docker run -d -p 6379:6379 redis:7-alpine

# Verify connection
redis-cli ping  # Should return PONG
```

#### ❌ "JWT verification failed"

**Cause:** Missing or incorrect JWT secrets

**Solution:**
```bash
# Generate new secrets
cd backend
node -e "console.log('ACCESS_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'));"
node -e "console.log('REFRESH_TOKEN_SECRET=' + require('crypto').randomBytes(64).toString('hex'));"

# Update .env file with generated values
```

#### ❌ "Port already in use"

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::4000
```

**Solutions:**
```bash
# Windows - find and kill process
netstat -ano | findstr :4000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:4000 | xargs kill -9

# Or change port in .env
PORT=4001
```

### Frontend Issues

#### ❌ "Module not found: Can't resolve '@radix-ui/react-slot'"

**Cause:** Dependencies not installed

**Solution:**
```bash
cd frontend
rm -rf node_modules .next
npm install
```

#### ❌ "Error: Cannot read properties of undefined (reading 'map')"

**Cause:** API not reachable

**Solution:**
1. Ensure backend is running on port 4000
2. Check `next.config.mjs` rewrites configuration
3. Verify `NEXT_PUBLIC_API_URL` environment variable

#### ❌ "Unhandled Runtime Error: Failed to fetch"

**Cause:** CORS or network issue

**Solution:**
```bash
# 1. Check backend CORS config
cat backend/config/cors-options.js

# 2. Verify ALLOWED_ORIGINS includes http://localhost:3000

# 3. Check network tab in browser devtools
```

#### ❌ "Redux persist error"

**Cause:** SSR/localStorage mismatch

**Solution:**
The issue is likely in `store/index.js`. Ensure proper SSR handling:
```javascript
// store/index.js - Already implemented correctly
const storage = typeof window !== "undefined" 
  ? createWebStorage("local") 
  : createNoopStorage();
```

### Testing Issues

#### ❌ "Tests fail with MongoDB connection timeout"

**Cause:** MongoDB Memory Server download issue

**Solution:**
```bash
# Set cache directory
export MONGOMS_DOWNLOAD_DIR=./.mongodb-binaries

# Or run with cached binary
cd backend
npm run test:unit  # Run unit tests only (faster)
```

#### ❌ "Coverage threshold not met"

**Solution:**
```bash
# See current coverage
cd backend
npm run test:coverage

# Check coverage report
cat coverage/index.html
```

### Email Issues

#### ❌ "Email not sending in development"

**Cause:** Ethereal credentials not configured

**Solution:**
1. Visit https://ethereal.email/create
2. Copy username and password
3. Update `backend/.env`:
```env
ETHEREAL_USER=your-generated-username@ethereal.email
ETHEREAL_PASS=your-generated-password
```

4. View sent emails at https://ethereal.email/messages

#### ❌ "Email queue not processing"

**Cause:** Redis not running or Bull queue stalled

**Solution:**
```bash
# 1. Ensure Redis is running
redis-cli ping

# 2. Clear stuck jobs (development only)
redis-cli FLUSHALL

# 3. Restart backend
```

---

## Architecture Validation Commands

### Verify Backend Architecture

```bash
cd backend

# 1. Verify all imports use .js extension (ESM requirement)
grep -r "from '\." --include="*.js" | grep -v "\.js'" | head -20

# 2. Check for constitution violations (no raw res.status)
grep -r "res\.status(" --include="*.js" controllers/ | grep -v apiResponseManager

# 3. Verify no console.log in production code
grep -r "console\.log" --include="*.js" . | grep -v node_modules | grep -v "\.test\."

# 4. Check all routes use /api/v1/ prefix
grep -r "app\.use(" --include="*.js" app.js

# 5. Validate middleware chain
grep -r "router\." --include="*.js" routes/ | head -30
```

### Verify Frontend Architecture

```bash
cd frontend

# 1. Check for Context API violations (should use Redux)
grep -r "createContext" --include="*.js" --include="*.jsx" src/ | grep -v node_modules

# 2. Verify no CSS-in-JS
grep -r "styled-components\|emotion\|css\`" --include="*.js" --include="*.jsx" src/ | grep -v node_modules

# 3. Check all API calls use RTK Query or /api/ prefix
grep -r "axios\|fetch(" --include="*.js" --include="*.jsx" src/ | grep -v node_modules | head -20

# 4. Verify JWT in cookies (not localStorage)
grep -r "localStorage.*token\|sessionStorage.*token" --include="*.js" --include="*.jsx" src/ | grep -v node_modules
```

### Verify Security Implementation

```bash
cd backend

# 1. Check helmet middleware is applied
grep -r "helmet" app.js

# 2. Verify rate limiting on auth routes
grep -r "Limiter" routes/auth/auth-routes.js

# 3. Check password hashing with bcrypt
grep -r "bcrypt" model/User.js

# 4. Verify JWT in HttpOnly cookies
grep -r "httpOnly" services/auth/

# 5. Check XSS sanitization
grep -r "sanitize\|DOMPurify" middleware/
```

---

## Support & Resources

### Documentation

- [System Overview](./docs/architecture/01-SYSTEM-OVERVIEW.md)
- [Backend Architecture](./docs/architecture/02-BACKEND-ARCHITECTURE.md)
- [Frontend Architecture](./docs/architecture/03-FRONTEND-ARCHITECTURE.md)
- [Auth System](./docs/architecture/04-AUTH-SYSTEM.md)
- [API Documentation](http://localhost:4000/api/docs) (when running)

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Express.js Documentation](https://expressjs.com/en/api.html)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Redis Documentation](https://redis.io/documentation)
- [JWT.io](https://jwt.io) - Decode and debug JWTs

---

<p align="center">
  <strong>Need help?</strong> Check the <a href="./docs/architecture/">architecture docs</a> or run the validation commands above.
</p>
