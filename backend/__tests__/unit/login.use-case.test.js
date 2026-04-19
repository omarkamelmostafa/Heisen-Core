// backend/__tests__/unit/login.use-case.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { loginUseCase } from "../../use-cases/auth/login.use-case.js";
import User from "../../model/User.js";
import { comparePassword } from "../../utilities/auth/hash-utils.js";
import { generateTokens } from "../../services/auth/token-service.js";
import { sanitizeUserForResponse } from "../../utilities/auth/user-data-utils.js";
import logger from "../../utilities/general/logger.js";
import crypto from "crypto";
import emailService from "../../services/email/email.service.js";
import { generate2faTempToken } from "../../services/auth/token-service.js";
import { generateVerificationCode } from "../../utilities/auth/crypto-utils.js";

// Mock all dependencies at top level
vi.mock("../../model/User.js");
vi.mock("../../utilities/auth/hash-utils.js");
vi.mock("../../services/auth/token-service.js");
vi.mock("../../utilities/auth/user-data-utils.js");
vi.mock("../../utilities/general/logger.js");
vi.mock("crypto");
vi.mock("../../services/email/email.service.js");
vi.mock("../../utilities/auth/crypto-utils.js");

describe("loginUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Input validation", () => {
    it("should return MISSING_CREDENTIALS when email is missing", async () => {
      const result = await loginUseCase({
        password: "password123",
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
        rememberMe: false,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Email and password are required.",
        errorCode: "MISSING_CREDENTIALS",
      });
    });

    it("should return MISSING_CREDENTIALS when password is missing", async () => {
      const result = await loginUseCase({
        email: "test@example.com",
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
        rememberMe: false,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Email and password are required.",
        errorCode: "MISSING_CREDENTIALS",
      });
    });
  });

  describe("Authentication flow", () => {
    it("should return INVALID_CREDENTIALS when user not found", async () => {
      User.findByEmailWithSecurity.mockResolvedValue(null);

      const result = await loginUseCase({
        email: "nonexistent@example.com",
        password: "password123",
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
        rememberMe: false,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 401,
        message: "Invalid email or password.",
        errorCode: "INVALID_CREDENTIALS",
      });
    });

    it("should return ACCOUNT_DEACTIVATED when user is not active", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        isActive: false,
        isVerified: true,
      };
      User.findByEmailWithSecurity.mockResolvedValue(mockUser);

      const result = await loginUseCase({
        email: "test@example.com",
        password: "password123",
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
        rememberMe: false,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 403,
        message: "Account is deactivated. Please contact support.",
        errorCode: "ACCOUNT_DEACTIVATED",
      });
    });

    it("should return ACCOUNT_NOT_VERIFIED when user is not verified", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        isActive: true,
        isVerified: false,
      };
      User.findByEmailWithSecurity.mockResolvedValue(mockUser);

      const result = await loginUseCase({
        email: "test@example.com",
        password: "password123",
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
        rememberMe: false,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 403,
        message:
          "Please verify your email address before logging in. Check your inbox for the verification link.",
        errorCode: "ACCOUNT_NOT_VERIFIED",
      });
    });

    it("should return INVALID_CREDENTIALS when password does not match", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        isActive: true,
        isVerified: true,
        password: "hashedPassword",
      };
      User.findByEmailWithSecurity.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(false);

      const result = await loginUseCase({
        email: "test@example.com",
        password: "wrongpassword",
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
        rememberMe: false,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 401,
        message: "Invalid email or password.",
        errorCode: "INVALID_CREDENTIALS",
      });
    });

    it("should return identical INVALID_CREDENTIALS for wrong password and non-existent email (Rule S1)", async () => {
      // Test wrong password
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        isActive: true,
        isVerified: true,
        password: "hashedPassword",
      };
      User.findByEmailWithSecurity.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(false);

      const wrongPasswordResult = await loginUseCase({
        email: "test@example.com",
        password: "wrongpassword",
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
        rememberMe: false,
      });

      // Test non-existent email
      User.findByEmailWithSecurity.mockResolvedValue(null);

      const nonExistentEmailResult = await loginUseCase({
        email: "nonexistent@example.com",
        password: "password123",
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
        rememberMe: false,
      });

      // Both should return identical error responses
      expect(wrongPasswordResult).toEqual(nonExistentEmailResult);
      expect(wrongPasswordResult.statusCode).toBe(401);
      expect(wrongPasswordResult.errorCode).toBe("INVALID_CREDENTIALS");
    });
  });

  describe("Two-factor authentication", () => {
    it("should return requiresTwoFactor when 2FA is enabled", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        isActive: true,
        isVerified: true,
        password: "hashedPassword",
        twoFactorEnabled: true,
        save: vi.fn().mockResolvedValue(true),
      };
      User.findByEmailWithSecurity.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      generateVerificationCode.mockReturnValue("123456");
      crypto.createHash.mockReturnValue({
        update: vi.fn().mockReturnThis(),
        digest: vi.fn().mockReturnValue("hashedCode"),
      });
      generate2faTempToken.mockReturnValue("temp-token-123");
      emailService.send2faCodeEmail.mockResolvedValue(true);

      const result = await loginUseCase({
        email: "test@example.com",
        password: "password123",
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
        rememberMe: false,
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Two-factor authentication required",
        data: {
          requiresTwoFactor: true,
          tempToken: "temp-token-123",
          message: "A verification code has been sent to your email",
        },
      });

      expect(mockUser.save).toHaveBeenCalled();
      expect(emailService.send2faCodeEmail).toHaveBeenCalledWith(mockUser, "123456");
    });
  });

  describe("Happy path (no 2FA)", () => {
    it("should return success with tokens when login is successful", async () => {
      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        isActive: true,
        isVerified: true,
        password: "hashedPassword",
        twoFactorEnabled: false,
        save: vi.fn().mockResolvedValue(true),
      };
      User.findByEmailWithSecurity.mockResolvedValue(mockUser);
      comparePassword.mockResolvedValue(true);
      generateTokens.mockResolvedValue({
        accessToken: "mock-access-token",
        refreshTokenValue: "mock-refresh-value",
        accessTokenExpiresIn: 900,
      });
      sanitizeUserForResponse.mockReturnValue({
        id: "user123",
        email: "test@example.com",
      });

      const result = await loginUseCase({
        email: "test@example.com",
        password: "password123",
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
        rememberMe: false,
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Login successful",
        data: {
          user: {
            id: "user123",
            email: "test@example.com",
          },
          accessToken: "mock-access-token",
          refreshTokenValue: "mock-refresh-value",
          expiresIn: 900,
        },
      });

      expect(mockUser.save).toHaveBeenCalled();
      expect(generateTokens).toHaveBeenCalledWith(
        mockUser,
        "Mozilla/5.0",
        "127.0.0.1",
        false
      );
    });
  });

  describe("Error handling", () => {
    it("should return DATABASE_ERROR when MongoServerError occurs", async () => {
      const mongoError = new Error("Mongo connection failed");
      mongoError.name = "MongoServerError";
      User.findByEmailWithSecurity.mockRejectedValue(mongoError);

      const result = await loginUseCase({
        email: "test@example.com",
        password: "password123",
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
        rememberMe: false,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 503,
        message: "Service temporarily unavailable. Please try again later.",
        errorCode: "DATABASE_ERROR",
      });
    });

    it("should return INTERNAL_ERROR for unknown errors", async () => {
      const unknownError = new Error("Something went wrong");
      unknownError.name = "UnknownError";
      User.findByEmailWithSecurity.mockRejectedValue(unknownError);

      const result = await loginUseCase({
        email: "test@example.com",
        password: "password123",
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
        rememberMe: false,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 500,
        message: "Internal server error during login.",
        errorCode: "INTERNAL_ERROR",
      });
    });
  });
});
