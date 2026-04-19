// backend/__tests__/unit/resend-verification.use-case.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { resendVerificationUseCase } from "../../use-cases/auth/resend-verification.use-case.js";
import crypto from "crypto";
import { generateVerificationCode } from "../../utilities/auth/crypto-utils.js";
import User from "../../model/User.js";
import logger from "../../utilities/general/logger.js";
import { EmailService } from "../../services/email/email.service.js";

// Mock all dependencies at top level with factory functions
vi.mock("../../utilities/auth/crypto-utils.js", () => ({
  generateVerificationCode: vi.fn(),
}));

vi.mock("../../model/User.js", () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock("../../utilities/general/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

// Create mock email service instance using vi.hoisted (runs before vi.mock)
const mockEmailServiceInstance = vi.hoisted(() => ({}));

vi.mock("../../services/email/email.service.js", () => ({
  EmailService: vi.fn(function () { return mockEmailServiceInstance; }),
}));

describe("resendVerificationUseCase", () => {
  const mockEmailService = {
    sendVerificationEmail: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup email mock on the instance that EmailService constructor returns
    mockEmailServiceInstance.sendVerificationEmail = vi.fn().mockResolvedValue(true);

    // Setup other mocks
    generateVerificationCode.mockReturnValue("ABC123");
    User.findOne.mockResolvedValue(null);
  });

  describe("Input validation", () => {
    it("should return INVALID_EMAIL when email is missing", async () => {
      const result = await resendVerificationUseCase({ email: undefined });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Valid email is required",
        errorCode: "INVALID_EMAIL",
      });
    });

    it("should return INVALID_EMAIL when email is not a string", async () => {
      const result = await resendVerificationUseCase({ email: 12345 });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Valid email is required",
        errorCode: "INVALID_EMAIL",
      });
    });
  });

  describe("User enumeration prevention (FR-008)", () => {
    it("should return generic success when no unverified user found", async () => {
      User.findOne.mockResolvedValue(null);

      const result = await resendVerificationUseCase({ email: "nonexistent@example.com" });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "If an unverified account exists for this email, a new verification link has been sent.",
      });
    });

    it("should return generic success when user is already verified", async () => {
      User.findOne.mockResolvedValue(null);

      const result = await resendVerificationUseCase({ email: "verified@example.com" });

      expect(User.findOne).toHaveBeenCalledWith({
        email: "verified@example.com",
        isActive: true,
        isVerified: false,
      });
      expect(result.success).toBe(true);
    });
  });

  describe("Token generation and storage", () => {
    it("should generate and hash verification token", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        isActive: true,
        isVerified: false,
        save: vi.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);
      generateVerificationCode.mockReturnValue("ABC123");

      await resendVerificationUseCase({ email: "test@example.com" });

      // Compute the expected hash the same way the source does
      const expectedHash = crypto
        .createHash("sha256")
        .update("ABC123")
        .digest("hex");

      expect(generateVerificationCode).toHaveBeenCalled();
      expect(mockUser.verificationToken).toBe(expectedHash);
      expect(mockUser.verificationTokenExpiresAt).toBeInstanceOf(Date);
      const expectedExpiry = Date.now() + 24 * 60 * 60 * 1000;
      expect(mockUser.verificationTokenExpiresAt.getTime()).toBeCloseTo(expectedExpiry, -3);
      expect(mockUser.save).toHaveBeenCalled();
    });
  });

  describe("Happy path", () => {
    it("should successfully resend verification email", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        isActive: true,
        isVerified: false,
        save: vi.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);
      generateVerificationCode.mockReturnValue("ABC123");

      const result = await resendVerificationUseCase({ email: "test@example.com" });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Verification code sent successfully.",
      });

      expect(mockEmailServiceInstance.sendVerificationEmail).toHaveBeenCalledWith(mockUser, "ABC123");
      expect(logger.info).toHaveBeenCalledWith(
        { email: "test@example.com" },
        "Resent verification email"
      );
    });
  });

  describe("Email service error handling", () => {
    it("should return EMAIL_DISPATCH_FAILED when email sending fails", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        isActive: true,
        isVerified: false,
        save: vi.fn().mockResolvedValue(true),
      };
      User.findOne.mockResolvedValue(mockUser);
      generateVerificationCode.mockReturnValue("ABC123");

      const emailError = new Error("SMTP connection failed");
      mockEmailServiceInstance.sendVerificationEmail.mockRejectedValue(emailError);

      const result = await resendVerificationUseCase({ email: "test@example.com" });

      expect(result).toEqual({
        success: false,
        statusCode: 500,
        message: "Failed to send verification email. Please try again later.",
        errorCode: "EMAIL_DISPATCH_FAILED",
      });

      expect(logger.error).toHaveBeenCalledWith(
        { err: emailError, email: "test@example.com" },
        "Failed to resend verification email"
      );
    });
  });

  describe("Error handling", () => {
    it("should return generic success on unknown errors (security)", async () => {
      User.findOne.mockRejectedValue(new Error("Database connection lost"));

      const result = await resendVerificationUseCase({ email: "test@example.com" });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "If an unverified account exists for this email, a new verification link has been sent.",
      });

      expect(logger.error).toHaveBeenCalledWith(
        { err: expect.any(Error) },
        "Resend verification use-case error"
      );
    });
  });

  describe("Email normalization", () => {
    it("should normalize email to lowercase and trim", async () => {
      User.findOne.mockResolvedValue(null);

      await resendVerificationUseCase({ email: "  Test@Example.COM  " });

      expect(User.findOne).toHaveBeenCalledWith({
        email: "test@example.com",
        isActive: true,
        isVerified: false,
      });
    });
  });
});
