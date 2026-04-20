import { describe, it, expect, beforeEach, vi }
  from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../../app.js'
import User from '../../model/User.js'
import RefreshToken from '../../model/RefreshToken.js'
import bcrypt from 'bcrypt'

// vi.mock() calls here at top level only
vi.mock('../../services/email/email.service.js', () => ({
  EmailService: class {
    sendVerificationEmail() {
      return Promise.resolve({ success: true })
    }
    send2faCodeEmail() {
      return Promise.resolve({ success: true })
    }
  }
}))

// Test constants and helpers
const TEST_USER = {
  email: 'user.test+login@example.com',
  password: 'Tr0ub4dor&3'
}

// Helper: Create a verified user for testing
const createVerifiedUser = async (overrides = {}) => {
  const email = overrides.email || TEST_USER.email
  const password = overrides.password || TEST_USER.password
  const hashedPassword = await bcrypt.hash(password, 12)

  await User.create({
    firstname: 'Test',
    lastname: 'User',
    email,
    password: hashedPassword,
    isVerified: true,
    tokenVersion: 1,
    ...overrides
  })

  return { email, password }
}


beforeEach(async () => {
  vi.clearAllMocks()
})

describe('Authentication — Login (Integration)', () => {
  describe('Happy Path', () => {
    it('logs in verified user with valid credentials', async () => {
      // Arrange: seed verified user with real bcrypt hash
      const email = 'user.test+login@example.com'
      const password = 'Tr0ub4dor&3'
      const hashedPassword = await bcrypt.hash(password, 12)
      const user = await User.create({
        firstname: 'Test',
        lastname: 'User',
        email,
        password: hashedPassword,
        isVerified: true,
        tokenVersion: 1
      })

      // Act: login request
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password })

      // Assert Layer 1: HTTP status
      expect(res.status).toBe(200)

      // Assert Layer 2: Response body shape and values
      expect(res.body).toMatchObject({
        success: true,
        data: {
          accessToken: expect.any(String),
          user: {
            id: user._id.toString(),
            email: user.email,
          }
        }
      })

      // Assert Layer 2: Response does NOT contain password or passwordHash
      expect(res.body.data).not.toHaveProperty('password')
      expect(res.body.data).not.toHaveProperty('passwordHash')

      // Assert Layer 2: HttpOnly cookie is set with refresh token
      const cookies = res.headers['set-cookie']
      expect(cookies).toBeDefined()
      const refreshCookie = cookies.find(c => c.startsWith('refresh_token='))
      expect(refreshCookie).toBeDefined()
      expect(refreshCookie).toMatch(/HttpOnly/)
      // SameSite may be Lax or Strict depending on environment

      // Assert Layer 3: DB state — new session/token record created
      const tokens = await RefreshToken.find({ user: user._id })
      expect(tokens).toHaveLength(1)
      const token = tokens[0]
      expect(token.isRevoked).toBe(false)
      expect(token.expiresAt).toBeInstanceOf(Date)
      expect(token.expiresAt.getTime()).toBeGreaterThan(Date.now())

      // Assert Layer 3: lastLogin updated
      const updatedUser = await User.findById(user._id)
      expect(updatedUser.lastLogin).toBeInstanceOf(Date)
      expect(updatedUser.lastLogin.getTime()).toBeGreaterThanOrEqual(user.createdAt.getTime())
    })
  })

  describe('Negative Paths', () => {
    it('rejects wrong password with AUTH_INVALID_CREDENTIALS', async () => {
      // Arrange: seed verified user
      const email = 'user.test+login@example.com'
      const password = 'Tr0ub4dor&3'
      const hashedPassword = await bcrypt.hash(password, 12)
      await User.create({
        firstname: 'Test',
        lastname: 'User',
        email,
        password: hashedPassword,
        isVerified: true,
        tokenVersion: 1
      })

      // Act: wrong password
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'WrongPass123!' })

      // Assert: HTTP 401 + error code
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(['INVALID_CREDENTIALS', 'AUTH_INVALID_CREDENTIALS']).toContain(res.body.errorCode)
      expect(res.body).toHaveProperty('message')
    })

    it('rejects wrong email with INVALID_CREDENTIALS', async () => {
      // Arrange: seed verified user
      const email = 'user.test+login@example.com'
      const password = 'Tr0ub4dor&3'
      const hashedPassword = await bcrypt.hash(password, 12)
      await User.create({
        firstname: 'Test',
        lastname: 'User',
        email,
        password: hashedPassword,
        isVerified: true,
        tokenVersion: 1
      })

      // Act: wrong email
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@example.com', password })

      // Assert: HTTP 401 + SAME errorCode
      expect(res.status).toBe(401)
      expect(res.body.success).toBe(false)
      expect(res.body.errorCode).toBe('INVALID_CREDENTIALS')
      expect(res.body).toHaveProperty('message')
    })

    it('rejects missing email field', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ password: 'Tr0ub4dor&3' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.errorCode).toBe('BadRequest')
      expect(res.body).toHaveProperty('message')
    })

    it('rejects missing password field', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'user.test+login@example.com' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body.errorCode).toBe('BadRequest')
      expect(res.body).toHaveProperty('message')
    })

    it('rejects malformed email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'not-an-email', password: 'Tr0ub4dor&3' })

      expect(res.status).toBe(400)
      expect(res.body.success).toBe(false)
      expect(res.body).toHaveProperty('message')
    })

    it('rejects unverified account', async () => {
      // Arrange: seed unverified user
      const email = 'user.test+login@example.com'
      const password = 'Tr0ub4dor&3'
      const hashedPassword = await bcrypt.hash(password, 12)
      await User.create({
        firstname: 'Test',
        lastname: 'User',
        email,
        password: hashedPassword,
        isVerified: false,
        tokenVersion: 1
      })

      // Act: login attempt
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password })

      // Assert: HTTP 403 + errorCode
      expect(res.status).toBe(403)
      expect(res.body.success).toBe(false)
      expect(res.body.errorCode).toBe('ACCOUNT_NOT_VERIFIED')
      expect(res.body).toHaveProperty('message')
    })
  })

  describe('Security — Enumeration Prevention', () => {
    it('returns identical responses for wrong email vs wrong password', async () => {
      // Arrange: seed verified user
      const email = 'user.test+login@example.com'
      const password = 'Tr0ub4dor&3'
      const hashedPassword = await bcrypt.hash(password, 12)
      await User.create({
        firstname: 'Test',
        lastname: 'User',
        email,
        password: hashedPassword,
        isVerified: true,
        tokenVersion: 1
      })

      // Act: wrong password
      const wrongPassRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email, password: 'WrongPass123!' })

      // Act: wrong email
      const wrongEmailRes = await request(app)
        .post('/api/v1/auth/login')
        .send({ email: 'wrong@example.com', password })

      // Assert: identical HTTP status
      expect(wrongPassRes.status).toBe(wrongEmailRes.status)

      // Assert: identical errorCode
      expect(wrongPassRes.body.errorCode).toBe(wrongEmailRes.body.errorCode)

      // Assert: identical success flag
      expect(wrongPassRes.body.success).toBe(wrongEmailRes.body.success)
    })
  })

  it("B4: Enumeration prevention — identical responses for wrong password vs wrong email", async () => {
    // Setup: verified user
    const { email, password } = await createVerifiedUser()

    // Act: wrong password
    const wrongPassRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email, password: 'WrongPass123!' })

    // Act: no account exists
    const noAccountRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'nonexistent@example.com', password })

    // Assert: identical HTTP status
    expect(wrongPassRes.status).toBe(noAccountRes.status)

    // Assert: identical errorCode
    expect(wrongPassRes.body.errorCode).toBe(noAccountRes.body.errorCode)

    // Assert: identical success flag
    expect(wrongPassRes.body.success).toBe(noAccountRes.body.success)

    // Assert: identical message
    expect(wrongPassRes.body.message).toBe(noAccountRes.body.message)
  })

  it("B5: Missing email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ password: "SecurePassword123!" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("B6: Missing password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
})
