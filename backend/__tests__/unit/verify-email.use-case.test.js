// backend/__tests__/unit/verify-email.use-case.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { verifyEmailUseCase } from "../../use-cases/auth/verify-email.use-case.js";
import User from "../../model/User.js";
import logger from "../../utilities/general/logger.js";

// Mock all dependencies at top level with factory functions
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

describe("verifyEmailUseCase", () => {
  beforeEach(() => {
    // Reset all mocks
    vi.restoreAllMocks();

    // Re-initialize User.findOne mock
    User.findOne = vi.fn();

    // Re-initialize logger mocks
    logger.info = vi.fn();
    logger.error = vi.fn();
    logger.warn = vi.fn();

    // Default User.findOne returns chainable mock
    User.findOne.mockReturnValue({
      select: vi.fn().mockResolvedValue(null),
    });
  });

  describe("Input validation", () => {
    it("should return MISSING_VERIFICATION_TOKEN when token is missing", async () => {
      const result = await verifyEmailUseCase({ token: null });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Verification token is required",
        errorCode: "MISSING_VERIFICATION_TOKEN",
      });
    });

    it("should return MISSING_VERIFICATION_TOKEN when token is not a string", async () => {
      const result = await verifyEmailUseCase({ token: 123 });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Verification token is required",
        errorCode: "MISSING_VERIFICATION_TOKEN",
      });
    });

    it("should return MISSING_VERIFICATION_TOKEN when token is empty string", async () => {
      const result = await verifyEmailUseCase({ token: "" });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Verification token is required",
        errorCode: "MISSING_VERIFICATION_TOKEN",
      });
    });

    it("should return MISSING_VERIFICATION_TOKEN when token is only whitespace", async () => {
      const result = await verifyEmailUseCase({ token: "   " });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Verification token is required",
        errorCode: "MISSING_VERIFICATION_TOKEN",
      });
    });
  });

  describe("Token lookup and validation", () => {
    it("should return INVALID_VERIFICATION_TOKEN when token not found in DB", async () => {
      const mockSelect = vi.fn().mockResolvedValue(null);
      User.findOne.mockReturnValue({ select: mockSelect });

      const result = await verifyEmailUseCase({ token: "invalid-token" });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Invalid or already used verification token",
        errorCode: "INVALID_VERIFICATION_TOKEN",
      });

      expect(logger.warn).toHaveBeenCalledWith(
        { token: "invalid-..." },
        "Failed email verification attempt — token not found"
      );
    });

    it("should return ALREADY_VERIFIED when user is already verified", async () => {
      const mockUser = {
        _id: "user123",
        isVerified: true,
        verificationTokenExpiresAt: new Date(Date.now() + 3600000),
        save: vi.fn().mockResolvedValue(true),
      };
      const mockSelect = vi.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });

      const result = await verifyEmailUseCase({ token: "valid-token" });

      expect(result).toEqual({
        success: false,
        statusCode: 409,
        message: "Email has already been verified.",
        errorCode: "ALREADY_VERIFIED",
      });
    });

    it("should return VERIFICATION_TOKEN_EXPIRED when token is expired", async () => {
      const mockUser = {
        _id: "user123",
        isVerified: false,
        verificationTokenExpiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        save: vi.fn().mockResolvedValue(true),
      };
      const mockSelect = vi.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });

      const result = await verifyEmailUseCase({ token: "expired-token" });

      expect(result).toEqual({
        success: false,
        statusCode: 410,
        message: "Verification token has expired. Please request a new verification email.",
        errorCode: "VERIFICATION_TOKEN_EXPIRED",
      });
    });
  });

  describe("Error handling", () => {
    it("should return DATABASE_ERROR when MongoServerError occurs", async () => {
      const mongoError = new Error("Connection failed");
      mongoError.name = "MongoServerError";
      const mockSelect = vi.fn().mockRejectedValue(mongoError);
      User.findOne.mockReturnValue({ select: mockSelect });

      const result = await verifyEmailUseCase({ token: "valid-token" });

      expect(result).toEqual({
        success: false,
        statusCode: 503,
        message: "Service temporarily unavailable. Please try again.",
        errorCode: "DATABASE_ERROR",
      });

      expect(logger.error).toHaveBeenCalledWith(
        { err: mongoError },
        "Email verification use-case error"
      );
    });

    it("should return DATABASE_ERROR when MongoError occurs", async () => {
      const mongoError = new Error("Connection failed");
      mongoError.name = "MongoError";
      const mockSelect = vi.fn().mockRejectedValue(mongoError);
      User.findOne.mockReturnValue({ select: mockSelect });

      const result = await verifyEmailUseCase({ token: "valid-token" });

      expect(result).toEqual({
        success: false,
        statusCode: 503,
        message: "Service temporarily unavailable. Please try again.",
        errorCode: "DATABASE_ERROR",
      });
    });

    it("should return 500 when unknown error occurs", async () => {
      const unknownError = new Error("Unexpected error");
      unknownError.name = "GenericError";
      const mockSelect = vi.fn().mockRejectedValue(unknownError);
      User.findOne.mockReturnValue({ select: mockSelect });

      const result = await verifyEmailUseCase({ token: "valid-token" });

      expect(result).toEqual({
        success: false,
        statusCode: 500,
        message: "Email verification failed due to unexpected error",
        errorCode: "VERIFICATION_FAILED",
      });

      expect(logger.error).toHaveBeenCalledWith(
        { err: unknownError },
        "Email verification use-case error"
      );
    });
  });

  describe("Happy path", () => {
    it("should return success when token is valid and user is not verified", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        isVerified: false,
        verificationTokenExpiresAt: new Date(Date.now() + 3600000), // 1 hour from now
        save: vi.fn().mockResolvedValue(true),
      };
      const mockSelect = vi.fn().mockResolvedValue(mockUser);
      User.findOne.mockReturnValue({ select: mockSelect });

      const result = await verifyEmailUseCase({ token: "valid-token" });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Email verified successfully. You can now log in.",
      });

      // Verify user was updated
      expect(mockUser.isVerified).toBe(true);
      expect(mockUser.verificationToken).toBeUndefined();
      expect(mockUser.verificationTokenExpiresAt).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();

      expect(logger.info).toHaveBeenCalledWith(
        { email: "test@example.com" },
        "Email verified successfully"
      );
    });
  });
});
