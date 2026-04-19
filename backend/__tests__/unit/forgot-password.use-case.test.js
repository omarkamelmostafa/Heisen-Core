// backend/__tests__/unit/forgot-password.use-case.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { forgotPasswordUseCase } from "../../use-cases/auth/forgot-password.use-case.js";
import User from "../../model/User.js";
import * as cryptoUtils from "../../utilities/auth/crypto-utils.js";
import logger from "../../utilities/general/logger.js";

// Hoisted mock instances - created before modules load
const { mockEmailInstance, mockUserFindOne } = vi.hoisted(() => {
  const mockEmailInstance = {
    sendPasswordResetEmail: vi.fn(),
  }
  const mockUserFindOne = vi.fn()
  return { mockEmailInstance, mockUserFindOne }
})

// Mock all dependencies at top level with factory functions


vi.mock("../../model/User.js", () => ({
  default: {
    findOne: mockUserFindOne,
  },
}));

vi.mock("../../services/email/email.service.js", () => ({
  EmailService: function MockEmailService() {
    return mockEmailInstance
  }
}));

vi.mock("../../utilities/general/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

/**
 * Helper: flush one round of setImmediate so deferred email
 * callbacks execute before assertions.
 */
const flushImmediate = () => new Promise((resolve) => setImmediate(resolve));

describe("forgotPasswordUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });

    // Setup other mocks with default return values
    vi.spyOn(cryptoUtils, 'generateResetToken').mockReturnValue("reset-token-123");
    mockEmailInstance.sendPasswordResetEmail.mockResolvedValue(true);
    mockUserFindOne.mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Input validation", () => {
    it("should return INVALID_EMAIL when email is missing", async () => {
      const result = await forgotPasswordUseCase({
        email: null,
        clientIP: "127.0.0.1",
        origin: "http://localhost:3000"
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Valid email is required",
        errorCode: "INVALID_EMAIL",
      });
    });

    it("should return INVALID_EMAIL when email is not a string", async () => {
      const result = await forgotPasswordUseCase({
        email: 123,
        clientIP: "127.0.0.1",
        origin: "http://localhost:3000"
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Valid email is required",
        errorCode: "INVALID_EMAIL",
      });
    });
  });

  describe("User enumeration prevention", () => {
    it("should return same success response when user not found (security)", async () => {
      mockUserFindOne.mockResolvedValue(null);

      const result = await forgotPasswordUseCase({
        email: "nonexistent@example.com",
        clientIP: "127.0.0.1",
        origin: "http://localhost:3000"
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "If an account exists for this email, a password reset link has been sent.",
      });

      expect(logger.warn).toHaveBeenCalledWith(
        { email: "nonexistent@example.com", ip: "127.0.0.1" },
        "Password reset attempt for non-existent email"
      );
    });

    it("should return identical success response when user found (enumeration prevention)", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        save: vi.fn().mockResolvedValue(true),
      };
      mockUserFindOne.mockResolvedValue(mockUser);

      const result = await forgotPasswordUseCase({
        email: "test@example.com",
        clientIP: "127.0.0.1",
        origin: "http://localhost:3000"
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "If an account exists for this email, a password reset link has been sent.",
      });
    });

    it("should explicitly test enumeration prevention - both responses identical", async () => {
      mockUserFindOne.mockResolvedValue(null);
      const notFoundResult = await forgotPasswordUseCase({
        email: "nonexistent@example.com",
        clientIP: "127.0.0.1",
        origin: "http://localhost:3000"
      });

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        save: vi.fn().mockResolvedValue(true),
      };
      mockUserFindOne.mockResolvedValue(mockUser);
      const foundResult = await forgotPasswordUseCase({
        email: "test@example.com",
        clientIP: "127.0.0.1",
        origin: "http://localhost:3000"
      });

      expect(notFoundResult).toEqual(foundResult);
      expect(notFoundResult.success).toBe(true);
      expect(notFoundResult.statusCode).toBe(200);
      expect(notFoundResult.message).toBe("If an account exists for this email, a password reset link has been sent.");
    });
  });

  describe("Email handling", () => {
    it("should handle successful email sending when user found", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        save: vi.fn().mockResolvedValue(true),
      };
      mockUserFindOne.mockResolvedValue(mockUser);

      const result = await forgotPasswordUseCase({
        email: "test@example.com",
        clientIP: "127.0.0.1",
        origin: "http://localhost:3000"
      });

      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
      expect(mockUser.save).toHaveBeenCalled();
      expect(cryptoUtils.generateResetToken).toHaveBeenCalled();

      // Flush setImmediate to let the email callback run
      await flushImmediate();

      expect(mockEmailInstance.sendPasswordResetEmail).toHaveBeenCalledWith(
        mockUser,
        expect.stringContaining("reset-token-123")
      );
    });

    it("should still return success when email sending fails (security)", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        save: vi.fn().mockResolvedValue(true),
      };
      mockUserFindOne.mockResolvedValue(mockUser);
      mockEmailInstance.sendPasswordResetEmail.mockRejectedValue(new Error("Email service down"));

      const result = await forgotPasswordUseCase({
        email: "test@example.com",
        clientIP: "127.0.0.1",
        origin: "http://localhost:3000"
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "If an account exists for this email, a password reset link has been sent.",
      });

      // Flush setImmediate to let the email callback (and its catch) run
      await flushImmediate();

      expect(logger.error).toHaveBeenCalledWith(
        { err: expect.any(Error), email: "test@example.com" },
        "Failed to send password reset email"
      );
    });
  });

  describe("Error handling", () => {
    it("should return success response on unknown error (security)", async () => {
      mockUserFindOne.mockRejectedValue(new Error("Database connection failed"));

      const result = await forgotPasswordUseCase({
        email: "test@example.com",
        clientIP: "127.0.0.1",
        origin: "http://localhost:3000"
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "If an account exists for this email, a password reset link has been sent.",
      });

      expect(logger.error).toHaveBeenCalledWith(
        { err: expect.any(Error) },
        "Forgot password use-case error"
      );
    });
  });
});
