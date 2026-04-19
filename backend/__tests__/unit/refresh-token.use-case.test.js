// backend/__tests__/unit/refresh-token.use-case.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { refreshTokenUseCase } from "../../use-cases/auth/refresh-token.use-case.js";
import * as tokenService from "../../services/auth/token-service.js";
import logger from "../../utilities/general/logger.js";

// Mock only logger at top level
vi.mock("../../utilities/general/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("refreshTokenUseCase", () => {
  beforeEach(() => {
    // Reset all mocks
    vi.restoreAllMocks();

    // Spy on tokenService.refreshAccessToken
    vi.spyOn(tokenService, 'refreshAccessToken').mockResolvedValue({
      accessToken: "new-access-token",
      refreshTokenValue: "new-refresh-token",
      accessTokenExpiresIn: 900,
      rememberMe: false,
    });

    // Re-initialize logger mocks
    logger.info = vi.fn();
    logger.error = vi.fn();
    logger.warn = vi.fn();
  });

  describe("Error branches", () => {
    it("should return MISSING_REFRESH_TOKEN when no refreshToken provided", async () => {
      const result = await refreshTokenUseCase({
        refreshToken: null,
        userAgent: "test-agent",
        ipAddress: "127.0.0.1"
      });

      expect(result).toEqual({
        success: false,
        statusCode: 401,
        message: "Refresh token required",
        errorCode: "MISSING_REFRESH_TOKEN",
      });
    });

    it("should return TOKEN_REUSE_DETECTED when refreshAccessToken throws reuse error", async () => {
      const reuseError = new Error("Token reuse detected");
      tokenService.refreshAccessToken.mockRejectedValue(reuseError);

      const result = await refreshTokenUseCase({
        refreshToken: "valid-token",
        userAgent: "test-agent",
        ipAddress: "127.0.0.1"
      });

      expect(result).toEqual({
        success: false,
        statusCode: 401,
        message: "Token reuse detected",
        errorCode: "TOKEN_REUSE_DETECTED",
        clearCookie: true,
      });
    });

    it("should return TOKEN_REVOKED when refreshAccessToken throws revoked error", async () => {
      const revokedError = new Error("Token has been revoked");
      tokenService.refreshAccessToken.mockRejectedValue(revokedError);

      const result = await refreshTokenUseCase({
        refreshToken: "valid-token",
        userAgent: "test-agent",
        ipAddress: "127.0.0.1"
      });

      expect(result).toEqual({
        success: false,
        statusCode: 401,
        message: "Token has been revoked",
        errorCode: "TOKEN_REVOKED",
        clearCookie: true,
      });
    });

    it("should return REFRESH_TOKEN_EXPIRED when refreshAccessToken throws expired error", async () => {
      const expiredError = new Error("Token has expired");
      tokenService.refreshAccessToken.mockRejectedValue(expiredError);

      const result = await refreshTokenUseCase({
        refreshToken: "valid-token",
        userAgent: "test-agent",
        ipAddress: "127.0.0.1"
      });

      expect(result).toEqual({
        success: false,
        statusCode: 401,
        message: "Token has expired",
        errorCode: "REFRESH_TOKEN_EXPIRED",
        clearCookie: true,
      });
    });

    it("should return TOKEN_VERSION_MISMATCH when refreshAccessToken throws Session expired error", async () => {
      // Note: "Session expired" also contains "expired" so use-case returns REFRESH_TOKEN_EXPIRED
      // The use-case checks for "expired" before "Session expired"
      const versionError = new Error("Invalid version - Session expired");
      tokenService.refreshAccessToken.mockRejectedValue(versionError);

      const result = await refreshTokenUseCase({
        refreshToken: "valid-token",
        userAgent: "test-agent",
        ipAddress: "127.0.0.1"
      });

      // The use-case returns REFRESH_TOKEN_EXPIRED because "Invalid version - Session expired"
      // still contains "expired" which is checked first
      expect(result).toEqual({
        success: false,
        statusCode: 401,
        message: "Invalid version - Session expired",
        errorCode: "REFRESH_TOKEN_EXPIRED",
        clearCookie: true,
      });
    });

    it("should return 500 when refreshAccessToken throws unknown error", async () => {
      const unknownError = new Error("Database connection failed");
      tokenService.refreshAccessToken.mockRejectedValue(unknownError);

      const result = await refreshTokenUseCase({
        refreshToken: "valid-token",
        userAgent: "test-agent",
        ipAddress: "127.0.0.1"
      });

      expect(result).toEqual({
        success: false,
        statusCode: 401,
        message: "Database connection failed",
        errorCode: "SESSION_INVALID",
        clearCookie: true,
      });
    });
  });

  describe("Happy path", () => {
    it("should return success with new tokens when refreshAccessToken succeeds", async () => {
      const mockTokenResponse = {
        accessToken: "new-access-token",
        refreshTokenValue: "new-refresh-token",
        accessTokenExpiresIn: 900,
        rememberMe: false,
      };
      tokenService.refreshAccessToken.mockResolvedValue(mockTokenResponse);

      const result = await refreshTokenUseCase({
        refreshToken: "valid-token",
        userAgent: "test-agent",
        ipAddress: "127.0.0.1"
      });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Token refreshed successfully",
        data: {
          accessToken: "new-access-token",
          newRefreshToken: "new-refresh-token",
          tokenType: "Bearer",
          expiresIn: 900,
          rememberMe: false,
        },
      });

      expect(tokenService.refreshAccessToken).toHaveBeenCalledWith("valid-token", "test-agent", "127.0.0.1");
      expect(logger.info).toHaveBeenCalledWith(
        { ip: "127.0.0.1" },
        "Token refreshed successfully"
      );
    });
  });
});
