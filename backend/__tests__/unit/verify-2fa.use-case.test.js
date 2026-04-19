// backend/__tests__/unit/verify-2fa.use-case.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { verify2faUseCase } from "../../use-cases/auth/verify-2fa.use-case.js";
import jwt from "jsonwebtoken";
import User from "../../model/User.js";
import { hashToken, generateTokens } from "../../services/auth/token-service.js";
import { sanitizeUserForResponse } from "../../utilities/auth/user-data-utils.js";
import logger from "../../utilities/general/logger.js";

// Mock all dependencies (NOT jsonwebtoken - we use real tokens)
vi.mock("../../model/User.js");
vi.mock("../../services/auth/token-service.js");
vi.mock("../../utilities/auth/user-data-utils.js");
vi.mock("../../utilities/general/logger.js");

const TEST_SECRET = "test-access-secret-32chars-minimum";

// Mints a real 2FA temp token (matches what the source uses)
function mint2faTempToken(userId = "user123", options = {}) {
  return jwt.sign(
    {
      UserInfo: {
        userId,
        type: "2fa",
      },
    },
    TEST_SECRET,
    { expiresIn: "10m", ...options }
  );
}

// Mints a token with a wrong type (not "2fa")
function mintWrongTypeToken(userId = "user123") {
  return jwt.sign(
    {
      UserInfo: {
        userId,
        type: "access",
      },
    },
    TEST_SECRET,
    { expiresIn: "10m" }
  );
}

// Mints a token with no UserInfo field
function mintNoUserInfoToken() {
  return jwt.sign(
    { otherData: "some-value" },
    TEST_SECRET,
    { expiresIn: "10m" }
  );
}

describe("verify2faUseCase", () => {
  beforeEach(() => {
    process.env.ACCESS_TOKEN_SECRET = TEST_SECRET;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.ACCESS_TOKEN_SECRET;
  });

  describe("JWT verification", () => {
    it("should return TWO_FACTOR_SESSION_EXPIRED when temp token is expired", async () => {
      // Mint a real token that expires in 1ms
      const expiredToken = jwt.sign(
        { UserInfo: { userId: "user123", type: "2fa" } },
        TEST_SECRET,
        { expiresIn: "1ms" }
      );
      // Wait for it to expire
      await new Promise((r) => setTimeout(r, 10));

      const result = await verify2faUseCase({
        token: "123456",
        tempToken: expiredToken,
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Verification session has expired. Please log in again to receive a new code.",
        errorCode: "TWO_FACTOR_SESSION_EXPIRED",
      });
    });

    it("should return TWO_FACTOR_SESSION_INVALID for invalid JWT", async () => {
      const invalidToken = "not.a.valid.jwt.token";

      const result = await verify2faUseCase({
        token: "123456",
        tempToken: invalidToken,
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Invalid verification session. Please log in again.",
        errorCode: "TWO_FACTOR_SESSION_INVALID",
      });
    });
  });

  describe("Token type validation", () => {
    it("should return TWO_FACTOR_SESSION_INVALID when token type is not 2fa", async () => {
      const wrongTypeToken = mintWrongTypeToken();

      const result = await verify2faUseCase({
        token: "123456",
        tempToken: wrongTypeToken,
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Invalid verification session. Please log in again.",
        errorCode: "TWO_FACTOR_SESSION_INVALID",
      });
    });

    it("should return TWO_FACTOR_SESSION_INVALID when UserInfo is missing", async () => {
      const noUserInfoToken = mintNoUserInfoToken();

      const result = await verify2faUseCase({
        token: "123456",
        tempToken: noUserInfoToken,
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Invalid verification session. Please log in again.",
        errorCode: "TWO_FACTOR_SESSION_INVALID",
      });
    });
  });

  describe("User lookup", () => {
    it("should return TWO_FACTOR_SESSION_INVALID when user not found", async () => {
      const tempToken = mint2faTempToken("nonexistent-user");
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(null),
      });

      const result = await verify2faUseCase({
        token: "123456",
        tempToken: tempToken,
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Verification failed. Please log in again.",
        errorCode: "TWO_FACTOR_SESSION_INVALID",
      });
    });
  });

  describe("2FA code expiry", () => {
    it("should return TWO_FACTOR_EXPIRED when code has expired", async () => {
      const tempToken = mint2faTempToken("user123");

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        twoFactorCode: "hashedCode",
        twoFactorExpiry: new Date(Date.now() - 1000), // Expired
        save: vi.fn(),
      };
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const result = await verify2faUseCase({
        token: "123456",
        tempToken: tempToken,
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Verification code has expired. Please login again.",
        errorCode: "TWO_FACTOR_EXPIRED",
      });
    });

    it("should return TWO_FACTOR_EXPIRED when twoFactorCode is missing", async () => {
      const tempToken = mint2faTempToken("user123");

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        twoFactorCode: undefined,
        twoFactorExpiry: new Date(Date.now() + 60000),
        save: vi.fn(),
      };
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const result = await verify2faUseCase({
        token: "123456",
        tempToken: tempToken,
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Verification code has expired. Please login again.",
        errorCode: "TWO_FACTOR_EXPIRED",
      });
    });

    it("should return TWO_FACTOR_EXPIRED when twoFactorExpiry is missing", async () => {
      const tempToken = mint2faTempToken("user123");

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        twoFactorCode: "hashedCode",
        twoFactorExpiry: undefined,
        save: vi.fn(),
      };
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });

      const result = await verify2faUseCase({
        token: "123456",
        tempToken: tempToken,
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Verification code has expired. Please login again.",
        errorCode: "TWO_FACTOR_EXPIRED",
      });
    });
  });

  describe("OTP verification", () => {
    it("should return TWO_FACTOR_INVALID when OTP does not match", async () => {
      const tempToken = mint2faTempToken("user123");

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        twoFactorCode: "correctHashedCode",
        twoFactorExpiry: new Date(Date.now() + 60000),
        save: vi.fn(),
      };
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });
      hashToken.mockReturnValue("wrongHashedCode");

      const result = await verify2faUseCase({
        token: "123456",
        tempToken: tempToken,
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Invalid verification code",
        errorCode: "TWO_FACTOR_INVALID",
      });
    });
  });

  describe("Happy path", () => {
    it("should return success with tokens when 2FA verification is successful", async () => {
      const tempToken = mint2faTempToken("user123");

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        twoFactorCode: "hashedCode123",
        twoFactorExpiry: new Date(Date.now() + 60000),
        save: vi.fn().mockResolvedValue(true),
      };
      User.findById.mockReturnValue({
        select: vi.fn().mockResolvedValue(mockUser),
      });
      hashToken.mockReturnValue("hashedCode123");
      generateTokens.mockResolvedValue({
        accessToken: "mock-access-token",
        refreshTokenValue: "mock-refresh-value",
        accessTokenExpiresIn: 900,
      });
      sanitizeUserForResponse.mockReturnValue({
        id: "user123",
        email: "test@example.com",
      });

      const result = await verify2faUseCase({
        token: "123456",
        tempToken: tempToken,
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
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

      expect(mockUser.twoFactorCode).toBeUndefined();
      expect(mockUser.twoFactorExpiry).toBeUndefined();
      expect(mockUser.save).toHaveBeenCalled();
      expect(generateTokens).toHaveBeenCalledWith(mockUser, "Mozilla/5.0", "127.0.0.1", false);
      expect(logger.info).toHaveBeenCalledWith(
        { userId: "user123" },
        "2FA verification successful"
      );
    });
  });

  describe("Error handling", () => {
    it("should return DATABASE_ERROR when MongoServerError occurs", async () => {
      const tempToken = mint2faTempToken("user123");

      const mongoError = new Error("Mongo connection failed");
      mongoError.name = "MongoServerError";
      User.findById.mockReturnValue({
        select: vi.fn().mockRejectedValue(mongoError),
      });

      const result = await verify2faUseCase({
        token: "123456",
        tempToken: tempToken,
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 503,
        message: "Service temporarily unavailable",
        errorCode: "DATABASE_ERROR",
      });
    });

    it("should return TWO_FACTOR_VERIFICATION_FAILED for unknown errors after JWT verification", async () => {
      const tempToken = mint2faTempToken("user123");

      const unknownError = new Error("Unexpected error");
      unknownError.name = "UnknownError";
      User.findById.mockReturnValue({
        select: vi.fn().mockRejectedValue(unknownError),
      });

      const result = await verify2faUseCase({
        token: "123456",
        tempToken: tempToken,
        userAgent: "Mozilla/5.0",
        ipAddress: "127.0.0.1",
      });

      expect(result).toEqual({
        success: false,
        statusCode: 500,
        message: "Verification failed",
        errorCode: "TWO_FACTOR_VERIFICATION_FAILED",
      });
    });
  });
});
