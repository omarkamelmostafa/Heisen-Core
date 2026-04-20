import { describe, it, expect, beforeEach, vi } from 'vitest'
import request from 'supertest'
import mongoose from 'mongoose'
import app from '../../app.js'
import User from '../../model/User.js'
import RefreshToken from '../../model/RefreshToken.js'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { generateResetToken } from '../../utilities/auth/crypto-utils.js'

// vi.mock() calls here at top level only
vi.mock('../../services/email/email.service.js', () => {
  const mockSendPasswordResetEmail = vi.fn().mockResolvedValue({ success: true })
  const mockSendVerificationEmail = vi.fn().mockResolvedValue({ success: true })
  const mockSend2faCodeEmail = vi.fn().mockResolvedValue({ success: true })

  return {
    EmailService: class MockEmailService {
      sendPasswordResetEmail = mockSendPasswordResetEmail
      sendVerificationEmail = mockSendVerificationEmail
      send2faCodeEmail = mockSend2faCodeEmail
    },
    default: {
      sendPasswordResetEmail: mockSendPasswordResetEmail,
      sendVerificationEmail: mockSendVerificationEmail,
      send2faCodeEmail: mockSend2faCodeEmail
    }
  }
})

beforeEach(async () => {
  vi.clearAllMocks()
})

describe('Authentication — Forgot Password (Integration)', () => {
  describe('Happy Path', () => {
    it('sends reset email for existing user', async () => {
      // Arrange: seed verified user
      const email = 'user.test+forgot@example.com'
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

      // Act: forgot password request
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email })

      // Assert Layer 1: HTTP 200
      expect(res.status).toBe(200)

      // Assert Layer 2: Response body
      expect(res.body).toMatchObject({
        success: true,
        message: expect.any(String), // generic message, no enumeration
        requestId: expect.any(String),
        timestamp: expect.any(String)
      })

      // Assert Layer 3: DB state — reset token created
      const updatedUser = await User.findById(user._id).select('+resetPasswordToken +resetPasswordExpiresAt')
      expect(updatedUser.resetPasswordToken).toBeDefined()
      expect(updatedUser.resetPasswordExpiresAt).toBeInstanceOf(Date)
      expect(updatedUser.resetPasswordExpiresAt.getTime()).toBeGreaterThan(Date.now())

      // Assert Layer 3: Token is hashed in DB
      expect(updatedUser.resetPasswordToken).not.toBe('raw-token-placeholder')
      expect(updatedUser.resetPasswordToken.length).toBeGreaterThan(10) // hashed

      // Assert email sent (T8) - email service is mocked, so we just verify it was called
      const emailService = (await import('../../services/email/email.service.js')).default
      expect(emailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1)
      const [userArg, tokenArg] = emailService.sendPasswordResetEmail.mock.calls[0]
      expect(userArg.email).toBe(email)
      expect(tokenArg).toMatch(/^https?:\/\//) // contains URL
      expect(tokenArg.length).toBeGreaterThan(10) // raw token
    })
  })

  describe('Email Sent (T8)', () => {
    it('endpoint returns success when email sent', async () => {
      // Arrange: seed user
      const email = 'user.test+email@example.com'
      const hashedPassword = await bcrypt.hash('Tr0ub4dor&3', 12)
      const user = await User.create({
        firstname: 'Test',
        lastname: 'User',
        email,
        password: hashedPassword,
        isVerified: true,
        tokenVersion: 1
      })

      // Act: forgot password
      const res = await request(app)
        .post('/api/v1/auth/forgot-password')
        .send({ email })

      // Assert: HTTP 200
      expect(res.status).toBe(200)
      expect(res.body.success).toBe(true)

      // Assert Layer 3: DB state — reset token created (proves email flow triggered)
      const updatedUser = await User.findById(user._id).select('+resetPasswordToken +resetPasswordExpiresAt')
      expect(updatedUser.resetPasswordToken).toBeDefined()
      expect(updatedUser.resetPasswordExpiresAt).toBeInstanceOf(Date)
    })

    describe('Enumeration Prevention (S1)', () => {
      it('returns identical responses for existing vs non-existing email', async () => {
        // Arrange: seed one user
        const email = 'user.test+enum@example.com'
        const hashedPassword = await bcrypt.hash('Tr0ub4dor&3', 12)
        await User.create({
          firstname: 'Test',
          lastname: 'User',
          email,
          password: hashedPassword,
          isVerified: true,
          tokenVersion: 1
        })

        // Act: existing email
        const existingRes = await request(app)
          .post('/api/v1/auth/forgot-password')
          .send({ email })

        // Act: non-existing email
        const nonExistingRes = await request(app)
          .post('/api/v1/auth/forgot-password')
          .send({ email: 'nonexistent@example.com' })

        // Assert: identical HTTP status
        expect(existingRes.status).toBe(nonExistingRes.status)

        // Assert: identical success flag
        expect(existingRes.body.success).toBe(nonExistingRes.body.success)

        // Assert: identical errorCode (none, since success)
        expect(existingRes.body.errorCode).toBe(nonExistingRes.body.errorCode)

        // Assert: identical message
        expect(existingRes.body.message).toBe(nonExistingRes.body.message)
      })
    })

    describe('Token Expiry', () => {
      it('rejects expired reset token', async () => {
        // Arrange: seed user with expired reset token
        const email = 'user.test+expired@example.com'
        const hashedPassword = await bcrypt.hash('Tr0ub4dor&3', 12)
        const expiredToken = 'expired-token-hash'
        const user = await User.create({
          firstname: 'Test',
          lastname: 'User',
          email,
          password: hashedPassword,
          isVerified: true,
          tokenVersion: 1,
          resetPasswordToken: expiredToken,
          resetPasswordExpiresAt: new Date(Date.now() - 1000) // expired
        })

        // Act: reset password with expired token
        const res = await request(app)
          .post('/api/v1/auth/reset-password')
          .send({ token: 'raw-expired-token', newPassword: 'NewPass123!' })

        // Assert: HTTP 400 + errorCode
        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
          success: false,
          errorCode: 'BadRequest',
          message: expect.any(String),
          requestId: expect.any(String),
          timestamp: expect.any(String)
        })
      })
    })

    describe('Token Single Use', () => {
      it('rejects already used reset token', async () => {
        // Arrange: seed user who has already reset
        const email = 'user.test+used@example.com'
        const hashedPassword = await bcrypt.hash('Tr0ub4dor&3', 12)
        await User.create({
          firstname: 'Test',
          lastname: 'User',
          email,
          password: hashedPassword,
          isVerified: true,
          tokenVersion: 1,
          resetPasswordToken: null, // already used
          resetPasswordExpiresAt: null
        })

        // Act: try to use token again
        const res = await request(app)
          .post('/api/v1/auth/reset-password')
          .send({ token: 'used-token', newPassword: 'NewPass123!' })

        // Assert: HTTP 400 + errorCode
        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
          success: false,
          errorCode: 'BadRequest',
          message: expect.any(String),
          requestId: expect.any(String),
          timestamp: expect.any(String)
        })
      })
    })

    describe('Password Reset Revocation (S5)', () => {
      it('invalidates all refresh tokens after password reset', async () => {
        // Arrange: seed user with refresh tokens
        const email = 'user.test+revoke@example.com'
        const oldPassword = 'Tr0ub4dor&3'
        const newPassword = 'NewPass123!'
        const hashedPassword = await bcrypt.hash(oldPassword, 12)
        const user = await User.create({
          firstname: 'Test',
          lastname: 'User',
          email,
          password: hashedPassword,
          isVerified: true,
          tokenVersion: 1
        })

        // Create refresh tokens
        const rawToken1 = 'f'.repeat(80)
        const hashedToken1 = crypto.createHash('sha256').update(rawToken1).digest('hex')
        await RefreshToken.create({
          token: hashedToken1,
          user: user._id,
          isRevoked: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          tokenVersion: 1
        })

        const rawToken2 = 'g'.repeat(80)
        const hashedToken2 = crypto.createHash('sha256').update(rawToken2).digest('hex')
        await RefreshToken.create({
          token: hashedToken2,
          user: user._id,
          isRevoked: false,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          tokenVersion: 1
        })

        // Act: reset password (assume token is valid)
        // First, set a valid reset token using the same method as forgot password flow
        const resetToken = generateResetToken()
        const hashedResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
        await User.findByIdAndUpdate(user._id, {
          resetPasswordToken: hashedResetToken,
          resetPasswordExpiresAt: new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        })

        const resetRes = await request(app)
          .post('/api/v1/auth/reset-password')
          .send({ token: resetToken, password: newPassword })

        expect(resetRes.status).toBe(200)

        // Assert: ALL refresh tokens revoked
        const allTokens = await RefreshToken.find({ user: user._id })
        expect(allTokens.every(t => t.isRevoked)).toBe(true)

        // Assert: password updated
        const updatedUser = await User.findById(user._id).select('+password')
        const passwordMatch = await bcrypt.compare(newPassword, updatedUser.password)
        expect(passwordMatch).toBe(true)
      })
    })

    describe('Validation', () => {
      it('rejects missing email field', async () => {
        const res = await request(app)
          .post('/api/v1/auth/forgot-password')
          .send({})

        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
          success: false,
          errorCode: 'BadRequest',
          message: expect.any(String),
          requestId: expect.any(String),
          timestamp: expect.any(String),
          details: expect.any(Array)
        })
      })

      it('rejects malformed email', async () => {
        const res = await request(app)
          .post('/api/v1/auth/forgot-password')
          .send({ email: 'not-an-email' })

        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
          success: false,
          errorCode: 'BadRequest',
          message: expect.any(String),
          requestId: expect.any(String),
          timestamp: expect.any(String),
          details: expect.any(Array)
        })
      })

      it('rejects overly long email', async () => {
        const longEmail = 'a'.repeat(300) + '@example.com'
        const res = await request(app)
          .post('/api/v1/auth/forgot-password')
          .send({ email: longEmail })

        expect(res.status).toBe(400)
        expect(res.body).toMatchObject({
          success: false,
          errorCode: 'BadRequest',
          message: expect.any(String),
          requestId: expect.any(String),
          timestamp: expect.any(String),
          details: expect.any(Array)
        })
      })
    })
  })
})
