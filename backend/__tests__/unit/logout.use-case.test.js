// backend/__tests__/unit/logout.use-case.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logoutUseCase } from "../../use-cases/auth/logout.use-case.js";
import RefreshToken from "../../model/RefreshToken.js";
import { hashToken, safeVerifyOrDecode, revokeByJti } from "../../services/auth/token-service.js";
import logger from "../../utilities/general/logger.js";

// Mock all dependencies at top level
vi.mock("../../model/RefreshToken.js");
vi.mock("../../services/auth/token-service.js");
vi.mock("../../utilities/general/logger.js");

describe("logoutUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    revokeByJti.mockResolvedValue(undefined);

    // Set up environment variables for JWT
    process.env.ACCESS_TOKEN_SECRET = "test-secret";
    process.env.JWT_ISSUER = "test-issuer";
    process.env.JWT_AUDIENCE = "test-audience";
  });

  describe("No refresh token provided", () => {
    it("should return 204 when no refreshToken is provided", async () => {
      const result = await logoutUseCase({
        refreshToken: null,
        accessToken: null,
      });

      expect(result).toEqual({
        success: true,
        statusCode: 204,
        message: "No active session.",
      });

      expect(RefreshToken.findOneAndUpdate).not.toHaveBeenCalled();
      expect(safeVerifyOrDecode).not.toHaveBeenCalled();
    });
  });

  describe("Refresh token revocation", () => {
    it("should revoke refresh token when found in database", async () => {
      const mockTokenDoc = {
        user: "user123",
        token: "hashed-token",
        isRevoked: false,
      };

      RefreshToken.findOneAndUpdate.mockResolvedValue(mockTokenDoc);
      hashToken.mockReturnValue("hashed-token");
      safeVerifyOrDecode.mockResolvedValue(null); // No access token provided

      const result = await logoutUseCase({
        refreshToken: "refresh-token-123",
        accessToken: null,
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Logged out successfully.",
      });

      expect(hashToken).toHaveBeenCalledWith("refresh-token-123");
      expect(RefreshToken.findOneAndUpdate).toHaveBeenCalledWith(
        { token: "hashed-token", isRevoked: false },
        { isRevoked: true }
      );
      expect(logger.info).toHaveBeenCalledWith(
        { userId: "user123" },
        "Refresh token revoked on logout"
      );
    });

    it("should still return success when refresh token not found in database", async () => {
      RefreshToken.findOneAndUpdate.mockResolvedValue(null);
      hashToken.mockReturnValue("hashed-token");
      safeVerifyOrDecode.mockResolvedValue(null); // No access token provided

      const result = await logoutUseCase({
        refreshToken: "non-existent-token",
        accessToken: null,
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Logged out successfully.",
      });

      expect(hashToken).toHaveBeenCalledWith("non-existent-token");
      expect(RefreshToken.findOneAndUpdate).toHaveBeenCalledWith(
        { token: "hashed-token", isRevoked: false },
        { isRevoked: true }
      );
      expect(logger.info).not.toHaveBeenCalled();
    });
  });

  describe("Access token blacklisting", () => {
    it("should blacklist valid access token with future expiration", async () => {
      const mockTokenDoc = { user: "user123" };
      const currentTime = Math.floor(Date.now() / 1000);
      const mockDecodedAccess = {
        jti: "jti-123",
        exp: currentTime + 3600,
        UserInfo: { userId: "user123" }
      };

      RefreshToken.findOneAndUpdate.mockResolvedValue(mockTokenDoc);
      hashToken.mockReturnValue("hashed-token");
      safeVerifyOrDecode.mockReturnValue(mockDecodedAccess);
      revokeByJti.mockResolvedValue(true);

      const result = await logoutUseCase({
        refreshToken: "refresh-token-123",
        accessToken: "access-token-123",
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Logged out successfully.",
      });

      expect(safeVerifyOrDecode).toHaveBeenCalledWith(
        "access-token-123",
        process.env.ACCESS_TOKEN_SECRET,
        {
          issuer: process.env.JWT_ISSUER,
          audience: process.env.JWT_AUDIENCE,
        }
      );
      expect(revokeByJti).toHaveBeenCalledWith("jti-123", mockDecodedAccess.exp);
    });

    it("should handle Redis error during access token blacklisting gracefully", async () => {
      const mockTokenDoc = { user: "user123" };
      const mockDecodedAccess = {
        jti: "jti-123",
        exp: Math.floor(Date.now() / 1000) + 3600,
        UserInfo: { userId: "user123" }
      };
      const redisError = new Error("Redis connection failed");

      RefreshToken.findOneAndUpdate.mockResolvedValue(mockTokenDoc);
      hashToken.mockReturnValue("hashed-token");
      safeVerifyOrDecode.mockReturnValue(mockDecodedAccess);
      revokeByJti.mockRejectedValue(redisError);

      const result = await logoutUseCase({
        refreshToken: "refresh-token-123",
        accessToken: "access-token-123",
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Logged out successfully.",
      });

      expect(logger.warn).toHaveBeenCalledWith(
        { err: redisError, jti: "jti-123" },
        "Redis unavailable for blacklisting access token"
      );
    });

    it("should not blacklist expired access token", async () => {
      const mockTokenDoc = { user: "user123" };
      const mockDecodedAccess = {
        jti: "jti-123",
        exp: Math.floor(Date.now() / 1000) - 100,
        UserInfo: { userId: "user123" }
      };

      RefreshToken.findOneAndUpdate.mockResolvedValue(mockTokenDoc);
      hashToken.mockReturnValue("hashed-token");
      safeVerifyOrDecode.mockReturnValue(mockDecodedAccess);

      const result = await logoutUseCase({
        refreshToken: "refresh-token-123",
        accessToken: "expired-access-token",
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Logged out successfully.",
      });

      expect(revokeByJti).not.toHaveBeenCalled();
    });

    it("should not blacklist access token without JTI", async () => {
      const mockTokenDoc = { user: "user123" };
      const mockDecodedAccess = {
        exp: Math.floor(Date.now() / 1000) + 3600,
        UserInfo: { userId: "user123" }
        // No jti field
      };

      RefreshToken.findOneAndUpdate.mockResolvedValue(mockTokenDoc);
      hashToken.mockReturnValue("hashed-token");
      safeVerifyOrDecode.mockReturnValue(mockDecodedAccess);

      const result = await logoutUseCase({
        refreshToken: "refresh-token-123",
        accessToken: "access-token-without-jti",
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Logged out successfully.",
      });

      expect(revokeByJti).not.toHaveBeenCalled();
    });
  });

  describe("Happy path", () => {
    it("should successfully revoke both tokens when both are provided", async () => {
      const mockTokenDoc = { user: "user123" };
      const mockDecodedAccess = {
        jti: "jti-123",
        exp: Math.floor(Date.now() / 1000) + 3600,
        UserInfo: { userId: "user123" }
      };

      RefreshToken.findOneAndUpdate.mockResolvedValue(mockTokenDoc);
      hashToken.mockReturnValue("hashed-token");
      safeVerifyOrDecode.mockReturnValue(mockDecodedAccess);
      revokeByJti.mockResolvedValue(true);

      const result = await logoutUseCase({
        refreshToken: "refresh-token-123",
        accessToken: "access-token-123",
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Logged out successfully.",
      });

      expect(RefreshToken.findOneAndUpdate).toHaveBeenCalled();
      expect(revokeByJti).toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith(
        { userId: "user123" },
        "Refresh token revoked on logout"
      );
    });
  });

  describe("Error handling", () => {
    it("should always return success even when unexpected errors occur", async () => {
      const unexpectedError = new Error("Unexpected database error");
      RefreshToken.findOneAndUpdate.mockRejectedValue(unexpectedError);

      const result = await logoutUseCase({
        refreshToken: "refresh-token-123",
        accessToken: null,
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Logged out successfully.",
      });

      expect(logger.error).toHaveBeenCalledWith(
        { err: unexpectedError },
        "Logout use-case error"
      );
    });
  });
});
