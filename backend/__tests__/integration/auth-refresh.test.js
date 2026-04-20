import { describe, it, expect, beforeEach, vi }
  from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import app from '../../app.js'
import User from '../../model/User.js'
import RefreshToken from '../../model/RefreshToken.js'
import bcrypt from 'bcrypt'

// Helper function to match the real hashToken implementation
const hashToken = (rawToken) => crypto.createHash('sha256').update(rawToken).digest('hex')

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


beforeEach(async () => {
  vi.clearAllMocks()
})

describe('Authentication — Refresh Token (Integration)', () => {
  describe('Happy Path', () => {
    it('refreshes access token with valid refresh cookie', async () => {
      // Arrange: login to get valid refresh token
      const email = 'user.test+refresh@example.com'
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

      // Login to get refresh token
      const agent = request.agent(app)
      const loginRes = await agent
        .post('/api/v1/auth/login')
        .send({ email, password })

      expect(loginRes.status).toBe(200)
      const initialAccessToken = loginRes.body.data.accessToken

      // Get the initial refresh token count
      const initialTokens = await RefreshToken.find({ user: await User.findOne({ email }) })
      expect(initialTokens).toHaveLength(1)
      const initialTokenId = initialTokens[0]._id

      // Act: refresh request
      const refreshRes = await agent.post('/api/v1/auth/refresh')

      // Assert Layer 1: HTTP 200
      expect(refreshRes.status).toBe(200)

      // Assert Layer 2: Response body
      expect(refreshRes.body).toMatchObject({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: expect.any(String),
          tokenType: 'Bearer',
          expiresIn: expect.any(String),
          rememberMe: false
        },
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })

      // Assert new access token is different
      expect(refreshRes.body.data.accessToken).not.toBe(initialAccessToken)

      // Assert Layer 3: DB state — old token revoked, new token created
      const oldToken = await RefreshToken.findById(initialTokenId)
      expect(oldToken.isRevoked).toBe(true)
      expect(oldToken.replacedBy).toBeTruthy()

      const user = await User.findOne({ email })
      const newTokens = await RefreshToken.find({ user: user._id, isRevoked: false })
      expect(newTokens).toHaveLength(1)
      expect(newTokens[0]._id.toString()).not.toBe(initialTokenId.toString())
    })
  })

  describe('Token Reuse Detection (S4)', () => {
    it('replays revoked refresh token → revokes ALL tokens + returns 401', async () => {
      // Arrange: create user and login twice to get two refresh tokens
      const email = 'user.test+reuse@example.com'
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

      // Login first device
      const agent1 = request.agent(app)
      const login1Res = await agent1
        .post('/api/v1/auth/login')
        .send({ email, password })
      expect(login1Res.status).toBe(200)

      // Login second device
      const agent2 = request.agent(app)
      const login2Res = await agent2
        .post('/api/v1/auth/login')
        .send({ email, password })
      expect(login2Res.status).toBe(200)

      // Verify we have 2 active tokens
      const user = await User.findOne({ email })
      const initialTokens = await RefreshToken.find({ user: user._id, isRevoked: false })
      expect(initialTokens).toHaveLength(2)

      // Capture the current refresh token before rotation
      // We need to extract it from the login response cookies
      const loginCookies1 = login1Res.headers['set-cookie']
      const originalRefreshCookie = loginCookies1.find(cookie => cookie.startsWith('refresh_token='))
      const originalRefreshToken = originalRefreshCookie.split('refresh_token=')[1].split(';')[0]

      // Act 1: Valid refresh with device 1 → creates new token, revokes old token1
      const refresh1Res = await agent1.post('/api/v1/auth/refresh')
      expect(refresh1Res.status).toBe(200)

      // Act 2: Replay the OLD token with a new agent → should detect reuse
      const agent3 = request.agent(app)
      agent3.set('Cookie', `refresh_token=${originalRefreshToken}`)
      const replayRes = await agent3.post('/api/v1/auth/refresh')

      // Assert: HTTP 401 with reuse detection
      expect(replayRes.status).toBe(401)
      expect(replayRes.body).toMatchObject({
        success: false,
        errorCode: 'TOKEN_REUSE_DETECTED',
        message: expect.any(String),
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })

      // Assert: ALL tokens for user are now revoked (nuclear option)
      const allTokens = await RefreshToken.find({ user: user._id })
      expect(allTokens.every(t => t.isRevoked)).toBe(true)
    })
  })

  describe('Negative Paths', () => {
    it('rejects expired refresh token', async () => {
      // Arrange: seed user and expired refresh token
      const email = 'user.test+expired@example.com'
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

      const rawToken = crypto.randomBytes(40).toString('hex')
      const hashedToken = hashToken(rawToken)
      await RefreshToken.create({
        token: hashedToken,
        user: user._id,
        isRevoked: false,
        expiresAt: new Date(Date.now() - 1000), // expired
        tokenVersion: 1
      })

      // Act: refresh with expired token
      const agent = request.agent(app)
      agent.set('Cookie', `refresh_token=${rawToken}`)
      const res = await agent.post('/api/v1/auth/refresh')

      // Assert: HTTP 401 + errorCode
      expect(res.status).toBe(401)
      expect(res.body).toMatchObject({
        success: false,
        errorCode: 'REFRESH_TOKEN_EXPIRED',
        message: expect.any(String),
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })
    })

    it('rejects revoked refresh token', async () => {
      // Arrange: seed user and revoked refresh token
      const email = 'user.test+revoked@example.com'
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

      const rawToken = crypto.randomBytes(40).toString('hex')
      const hashedToken = hashToken(rawToken)
      await RefreshToken.create({
        token: hashedToken,
        user: user._id,
        isRevoked: true, // already revoked
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tokenVersion: 1
      })

      // Act: refresh with revoked token
      const agent = request.agent(app)
      agent.set('Cookie', `refresh_token=${rawToken}`)
      const res = await agent.post('/api/v1/auth/refresh')

      // Assert: HTTP 401 + errorCode
      expect(res.status).toBe(401)
      expect(res.body).toMatchObject({
        success: false,
        errorCode: 'TOKEN_REVOKED',
        message: expect.any(String),
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })
    })

    it('rejects missing cookie', async () => {
      // Act: refresh without cookie
      const res = await request(app).post('/api/v1/auth/refresh')

      // Assert: HTTP 401 + errorCode
      expect(res.status).toBe(401)
      expect(res.body).toMatchObject({
        success: false,
        errorCode: 'MISSING_REFRESH_TOKEN',
        message: expect.any(String),
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })
    })

    it('rejects tampered cookie', async () => {
      // Act: refresh with invalid token
      const agent = request.agent(app)
      agent.set('Cookie', 'refresh_token=not-a-real-token')
      const res = await agent.post('/api/v1/auth/refresh')

      // Assert: HTTP 401 + errorCode
      expect(res.status).toBe(401)
      expect(res.body).toMatchObject({
        success: false,
        errorCode: 'SESSION_INVALID',
        message: expect.any(String),
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })
    })
  })
})
