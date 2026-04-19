// backend/__tests__/unit/reset-password.use-case.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resetPasswordUseCase } from "../../use-cases/auth/reset-password.use-case.js";
import crypto from "crypto";
import User from "../../model/User.js";
import RefreshToken from "../../model/RefreshToken.js";
import { hashPassword, comparePassword } from "../../utilities/auth/hash-utils.js";
import logger from "../../utilities/general/logger.js";

// Hoisted mock instance - created before modules load
const { mockEmailInstance } = vi.hoisted(() => {
  const mockEmailInstance = {
    sendResetSuccessEmail: vi.fn(),
  }
  return { mockEmailInstance }
})

// Mock all dependencies at top level with factory functions
vi.mock("../../model/User.js", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock("../../model/RefreshToken.js", () => ({
  default: {
    deleteMany: vi.fn(),
    updateMany: vi.fn(),
  },
}));

vi.mock("../../utilities/auth/hash-utils.js", () => ({
  hashPassword: vi.fn(),
  comparePassword: vi.fn(),
}));

vi.mock("../../utilities/general/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("../../services/email/email.service.js", () => ({
  EmailService: function MockEmailService() {
    return mockEmailInstance
  }
}));

describe("resetPasswordUseCase", () => {
  beforeEach(() => {
    // Enable fake timers including setImmediate for email tests
    vi.useFakeTimers({ toFake: ['setImmediate', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval'] });

    // Clear all mocks to prevent cross-test contamination
    vi.clearAllMocks();

    // Re-stub email mock method after clearAllMocks
    mockEmailInstance.sendResetSuccessEmail.mockResolvedValue(true);

    // Set up hash utility defaults
    hashPassword.mockResolvedValue("hashedNewPassword");
    comparePassword.mockResolvedValue(false);
    RefreshToken.deleteMany.mockResolvedValue(true);
    RefreshToken.updateMany.mockResolvedValue({ modifiedCount: 1 });

    // Default User.findOne returns null (using .select chain)
    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Input validation", () => {
    it("should return INVALID_RESET_TOKEN when token is missing", async () => {
      const result = await resetPasswordUseCase({
        token: undefined,
        password: "newpassword123",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Valid reset token is required",
        errorCode: "INVALID_RESET_TOKEN",
      });
    });

    it("should return INVALID_RESET_TOKEN when token is not a string", async () => {
      const result = await resetPasswordUseCase({
        token: 12345,
        password: "newpassword123",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Valid reset token is required",
        errorCode: "INVALID_RESET_TOKEN",
      });
    });

    it("should return INVALID_RESET_TOKEN when token is too short", async () => {
      const result = await resetPasswordUseCase({
        token: "short",
        password: "newpassword123",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Valid reset token is required",
        errorCode: "INVALID_RESET_TOKEN",
      });
    });

    it("should return MISSING_PASSWORD when password is missing", async () => {
      const result = await resetPasswordUseCase({
        token: "valid-reset-token-xyz123",
        password: undefined,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "New password is required",
        errorCode: "MISSING_PASSWORD",
      });
    });

    it("should return MISSING_PASSWORD when password is not a string", async () => {
      const result = await resetPasswordUseCase({
        token: "valid-reset-token-xyz123",
        password: 12345,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "New password is required",
        errorCode: "MISSING_PASSWORD",
      });
    });
  });

  describe("Token validation", () => {
    it("should return INVALID_RESET_TOKEN when token hash doesn't match", async () => {
      User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });

      const result = await resetPasswordUseCase({
        token: "invalid-token-xyz123",
        password: "newpassword123",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Invalid, expired, or already used reset token",
        errorCode: "INVALID_RESET_TOKEN",
      });

      expect(logger.warn).toHaveBeenCalledWith(
        { token: "invalid-token-xy..." },
        "Invalid password reset token attempt"
      );
    });

    it("should return INVALID_RESET_TOKEN when token is expired", async () => {
      User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });

      const result = await resetPasswordUseCase({
        token: "expired-token-xyz123",
        password: "newpassword123",
      });

      expect(User.findOne).toHaveBeenCalledWith({
        resetPasswordToken: "805c0c0d5c34ad284e107ee042d9e4c44f0550360a6d53af2f321d1d8d8b8402",
        resetPasswordExpiresAt: { $gt: expect.any(Date) },
        isActive: true,
      });

      expect(result.errorCode).toBe("INVALID_RESET_TOKEN");
    });

    it("should return INVALID_RESET_TOKEN when user is inactive", async () => {
      User.findOne.mockReturnValue({ select: vi.fn().mockResolvedValue(null) });

      const result = await resetPasswordUseCase({
        token: "valid-token-xyz12345",
        password: "newpassword123",
      });

      expect(result.errorCode).toBe("INVALID_RESET_TOKEN");
    });
  });

  describe("Same password check", () => {
    it("should return PASSWORD_SAME_AS_CURRENT when new password matches current", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "currentHashedPassword",
        tokenVersion: 1,
        save: vi.fn().mockResolvedValue(true),
      };

      User.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      comparePassword.mockResolvedValue(true);

      const result = await resetPasswordUseCase({
        token: "valid-token-xyz12345",
        password: "currentPassword123",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "New password cannot be the same as your current password",
        errorCode: "PASSWORD_SAME_AS_CURRENT",
      });

      expect(comparePassword).toHaveBeenCalledWith("currentPassword123", "currentHashedPassword");
    });
  });

  describe("Happy path", () => {
    it("should successfully reset password with all security updates", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "oldHashedPassword",
        resetPasswordToken: "hashedToken123",
        resetPasswordExpiresAt: new Date(Date.now() + 3600000),
        tokenVersion: 1,
        lastPasswordChange: new Date("2024-01-01"),
        lastSecurityEvent: new Date("2024-01-01"),
        save: vi.fn().mockResolvedValue(true),
      };

      User.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      comparePassword.mockResolvedValue(false);
      hashPassword.mockResolvedValue("newHashedPassword");

      RefreshToken.updateMany.mockResolvedValue({ modifiedCount: 3 });

      const result = await resetPasswordUseCase({
        token: "valid-token-xyz12345",
        password: "newSecurePassword123",
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Password reset successful. Please log in with your new password.",
      });

      // Verify password update
      expect(hashPassword).toHaveBeenCalledWith("newSecurePassword123");
      expect(mockUser.password).toBe("newHashedPassword");

      // Verify reset token cleared
      expect(mockUser.resetPasswordToken).toBeUndefined();
      expect(mockUser.resetPasswordExpiresAt).toBeUndefined();

      // Verify token version incremented
      expect(mockUser.tokenVersion).toBe(2);

      // Verify timestamps updated
      expect(mockUser.lastPasswordChange).toBeInstanceOf(Date);
      expect(mockUser.lastSecurityEvent).toBeInstanceOf(Date);

      // Verify user saved
      expect(mockUser.save).toHaveBeenCalled();

      // Verify all refresh tokens revoked
      expect(RefreshToken.updateMany).toHaveBeenCalledWith(
        { user: "user123", isRevoked: false },
        { isRevoked: true }
      );

      expect(logger.info).toHaveBeenCalledWith(
        { email: "test@example.com", revokedSessions: 3 },
        "Password reset completed — all sessions revoked"
      );
    });

    it("should queue success email non-blocking", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "oldHashedPassword",
        tokenVersion: 1,
        save: vi.fn().mockResolvedValue(true),
      };

      User.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      comparePassword.mockResolvedValue(false);
      hashPassword.mockResolvedValue("newHashedPassword");
      RefreshToken.updateMany.mockResolvedValue({ modifiedCount: 1 });

      await resetPasswordUseCase({
        token: "valid-token-xyz12345",
        password: "newSecurePassword123",
      });

      // Run pending timers for setImmediate
      await vi.runAllTimersAsync();

      expect(mockEmailInstance.sendResetSuccessEmail).toHaveBeenCalledWith(mockUser);
      expect(logger.info).toHaveBeenCalledWith(
        { email: "test@example.com" },
        "Password reset success email sent"
      );
    });
  });

  describe("Token hashing", () => {
    it("should hash token using SHA-256 before querying DB", async () => {
      const testToken = "my-reset-token-xyz123";
      const expectedHash = crypto
        .createHash("sha256")
        .update(testToken)
        .digest("hex");

      User.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      await resetPasswordUseCase({
        token: testToken,
        password: "newpassword123",
      });

      expect(User.findOne).toHaveBeenCalledWith(
        expect.objectContaining({
          resetPasswordToken: expectedHash,
        })
      );
    });
  });

  describe("Error handling", () => {
    it("should return DATABASE_ERROR when MongoServerError occurs during user lookup", async () => {
      const mongoError = new Error("Mongo connection failed");
      mongoError.name = "MongoServerError";
      User.findOne.mockReturnValue({
        select: vi.fn().mockRejectedValue(mongoError),
      });

      const result = await resetPasswordUseCase({
        token: "valid-token-xyz12345",
        password: "newpassword123",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 503,
        message: "Service temporarily unavailable. Please try again.",
        errorCode: "DATABASE_ERROR",
      });
    });

    it("should return DATABASE_ERROR when MongoError occurs during token revocation", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "oldHashedPassword",
        tokenVersion: 1,
        save: vi.fn().mockResolvedValue(true),
      };

      User.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      comparePassword.mockResolvedValue(false);
      hashPassword.mockResolvedValue("newHashedPassword");

      const mongoError = new Error("Mongo write failed");
      mongoError.name = "MongoError";
      RefreshToken.updateMany.mockRejectedValue(mongoError);

      const result = await resetPasswordUseCase({
        token: "valid-token-xyz12345",
        password: "newSecurePassword123",
      });

      expect(result.errorCode).toBe("DATABASE_ERROR");
    });

    it("should return RESET_FAILED for unknown errors", async () => {
      User.findOne.mockImplementation(() => {
        throw new Error("Unexpected error");
      });

      const result = await resetPasswordUseCase({
        token: "valid-token-xyz12345",
        password: "newpassword123",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 500,
        message: "Password reset failed due to unexpected error",
        errorCode: "RESET_FAILED",
      });

      expect(logger.error).toHaveBeenCalledWith(
        { err: expect.any(Error) },
        "Reset password use-case error"
      );
    });
  });

  describe("Email service error handling", () => {
    it("should not fail when success email fails to send", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        password: "oldHashedPassword",
        tokenVersion: 1,
        save: vi.fn().mockResolvedValue(true),
      };

      User.findOne.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      comparePassword.mockResolvedValue(false);
      hashPassword.mockResolvedValue("newHashedPassword");
      RefreshToken.updateMany.mockResolvedValue({ modifiedCount: 1 });

      const emailError = new Error("SMTP error");
      mockEmailInstance.sendResetSuccessEmail.mockRejectedValue(emailError);

      const result = await resetPasswordUseCase({
        token: "valid-token-xyz12345",
        password: "newSecurePassword123",
      });

      // Should still succeed even if email fails
      expect(result.success).toBe(true);

      // Run pending timers
      await vi.runAllTimersAsync();

      // Should log the error
      expect(logger.error).toHaveBeenCalledWith(
        { err: emailError, email: "test@example.com" },
        "Failed to send password reset success email"
      );
    });
  });
});
