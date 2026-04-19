// backend/__tests__/unit/resend-2fa.use-case.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { resend2faUseCase } from "../../use-cases/auth/resend-2fa.use-case.js";
import jwt from "jsonwebtoken";
import User from "../../model/User.js";
import { generateVerificationCode } from "../../utilities/auth/crypto-utils.js";
import emailService from "../../services/email/email.service.js";
import logger from "../../utilities/general/logger.js";

// Mock dependencies (keeping real JWT and crypto)
vi.mock("../../model/User.js");
vi.mock("../../utilities/auth/crypto-utils.js");
vi.mock("../../services/email/email.service.js");
vi.mock("../../utilities/general/logger.js");

const TEST_SECRET = "test-access-secret-32chars-minimum";

function mint2faTempToken(userId = "user123") {
  return jwt.sign(
    { UserInfo: { userId, type: "2fa" } },
    TEST_SECRET,
    { expiresIn: "10m" }
  );
}

function mintWrongTypeToken(userId = "user123") {
  return jwt.sign(
    { UserInfo: { userId, type: "access" } },
    TEST_SECRET,
    { expiresIn: "10m" }
  );
}

function mintNoUserInfoToken() {
  return jwt.sign(
    { otherData: "some-value" },
    TEST_SECRET,
    { expiresIn: "10m" }
  );
}

describe("resend2faUseCase", () => {
  beforeEach(() => {
    process.env.ACCESS_TOKEN_SECRET = TEST_SECRET;
    vi.clearAllMocks();
  });

  afterEach(() => {
    delete process.env.ACCESS_TOKEN_SECRET;
  });

  describe("JWT verification", () => {
    it("should return TWO_FACTOR_SESSION_EXPIRED when temp token is expired", async () => {
      const expiredToken = jwt.sign(
        { UserInfo: { userId: "user123", type: "2fa" } },
        TEST_SECRET,
        { expiresIn: "1ms" }
      );
      await new Promise((r) => setTimeout(r, 10));

      const result = await resend2faUseCase({
        tempToken: expiredToken,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Verification session has expired. Please log in again.",
        errorCode: "TWO_FACTOR_SESSION_EXPIRED",
      });
    });

    it("should return TWO_FACTOR_SESSION_INVALID for invalid JWT", async () => {
      const invalidToken = "not.a.valid.jwt.token";

      const result = await resend2faUseCase({
        tempToken: invalidToken,
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

      const result = await resend2faUseCase({
        tempToken: wrongTypeToken,
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

      const result = await resend2faUseCase({
        tempToken: noUserInfoToken,
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
      User.findById.mockResolvedValue(null);

      const result = await resend2faUseCase({
        tempToken: tempToken,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Verification failed. Please log in again.",
        errorCode: "TWO_FACTOR_SESSION_INVALID",
      });
    });
  });

  describe("2FA enabled check", () => {
    it("should return TWO_FACTOR_NOT_ENABLED when 2FA is not enabled for user", async () => {
      const tempToken = mint2faTempToken();

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        twoFactorEnabled: false,
        save: vi.fn(),
      };
      User.findById.mockResolvedValue(mockUser);

      const result = await resend2faUseCase({
        tempToken: tempToken,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 400,
        message: "Two-factor authentication is not enabled.",
        errorCode: "TWO_FACTOR_NOT_ENABLED",
      });
    });
  });

  describe("Happy path", () => {
    it("should successfully resend 2FA code", async () => {
      const tempToken = mint2faTempToken();

      const mockUser = {
        _id: "user123",
        email: "test@example.com",
        twoFactorEnabled: true,
        save: vi.fn().mockResolvedValue(true),
      };
      User.findById.mockResolvedValue(mockUser);
      generateVerificationCode.mockReturnValue("654321");

      emailService.send2faCodeEmail.mockResolvedValue(true);

      const result = await resend2faUseCase({
        tempToken: tempToken,
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "A new verification code has been sent to your email.",
      });

      expect(generateVerificationCode).toHaveBeenCalled();
      expect(mockUser.twoFactorCode).toBe("481f6cc0511143ccdd7e2d1b1b94faf0a700a8b49cd13922a70b5ae28acaa8c5");
      expect(mockUser.twoFactorExpiry).toBeInstanceOf(Date);
      expect(mockUser.twoFactorExpiry.getTime()).toBeGreaterThan(Date.now());
      expect(mockUser.save).toHaveBeenCalled();

      expect(emailService.send2faCodeEmail).toHaveBeenCalledWith(mockUser, "654321");
      expect(logger.info).toHaveBeenCalledWith(
        { userId: "user123" },
        "2FA code resent successfully"
      );
    });
  });

  describe("Error handling", () => {
    it("should return DATABASE_ERROR when MongoServerError occurs", async () => {
      const tempToken = mint2faTempToken();

      const mongoError = new Error("Mongo connection failed");
      mongoError.name = "MongoServerError";
      User.findById.mockRejectedValue(mongoError);

      const result = await resend2faUseCase({
        tempToken: tempToken,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 503,
        message: "Service temporarily unavailable",
        errorCode: "DATABASE_ERROR",
      });
    });

    it("should return RESEND_2FA_FAILED for unknown errors after JWT verification", async () => {
      const tempToken = mint2faTempToken();

      const unknownError = new Error("Unexpected error");
      unknownError.name = "UnknownError";
      User.findById.mockRejectedValue(unknownError);

      const result = await resend2faUseCase({
        tempToken: tempToken,
      });

      expect(result).toEqual({
        success: false,
        statusCode: 500,
        message: "Failed to resend verification code",
        errorCode: "RESEND_2FA_FAILED",
      });
    });
  });
});
