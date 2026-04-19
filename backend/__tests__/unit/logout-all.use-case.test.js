// backend/__tests__/unit/logout-all.use-case.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { logoutAllUseCase } from "../../use-cases/auth/logout-all.use-case.js";
import User from "../../model/User.js";
import RefreshToken from "../../model/RefreshToken.js";
import logger from "../../utilities/general/logger.js";

// Mock all dependencies at top level
vi.mock("../../model/User.js");
vi.mock("../../model/RefreshToken.js");
vi.mock("../../utilities/general/logger.js");

describe("logoutAllUseCase", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Input validation", () => {
    it("should return NOT_AUTHENTICATED when userId is not provided", async () => {
      const result = await logoutAllUseCase({ userId: null });

      expect(result).toEqual({
        success: false,
        statusCode: 401,
        message: "Authentication required.",
        errorCode: "NOT_AUTHENTICATED",
      });

      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(RefreshToken.updateMany).not.toHaveBeenCalled();
    });

    it("should return NOT_AUTHENTICATED when userId is empty string", async () => {
      const result = await logoutAllUseCase({ userId: "" });

      expect(result).toEqual({
        success: false,
        statusCode: 401,
        message: "Authentication required.",
        errorCode: "NOT_AUTHENTICATED",
      });

      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(RefreshToken.updateMany).not.toHaveBeenCalled();
    });

    it("should return NOT_AUTHENTICATED when userId is undefined", async () => {
      const result = await logoutAllUseCase({});

      expect(result).toEqual({
        success: false,
        statusCode: 401,
        message: "Authentication required.",
        errorCode: "NOT_AUTHENTICATED",
      });

      expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
      expect(RefreshToken.updateMany).not.toHaveBeenCalled();
    });
  });

  describe("Happy path", () => {
    it("should successfully logout from all devices when userId is provided", async () => {
      const userId = "user123";
      const mockUpdateResult = { modifiedCount: 5 };

      User.findByIdAndUpdate = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ tokenVersion: 2 })
      });
      RefreshToken.updateMany.mockResolvedValue(mockUpdateResult);

      const result = await logoutAllUseCase({ userId });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Logged out from all devices.",
      });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $inc: { tokenVersion: 1 } }
      );
      expect(RefreshToken.updateMany).toHaveBeenCalledWith(
        { user: userId, isRevoked: false },
        { isRevoked: true }
      );
      expect(logger.info).toHaveBeenCalledWith(
        { userId, revokedCount: 5 },
        "All sessions revoked via logout-all"
      );
    });

    it("should handle case where no refresh tokens exist for user", async () => {
      const userId = "user123";
      const mockUpdateResult = { modifiedCount: 0 };

      User.findByIdAndUpdate = vi.fn().mockReturnValue({
        exec: vi.fn().mockResolvedValue({ tokenVersion: 2 })
      });
      RefreshToken.updateMany.mockResolvedValue(mockUpdateResult);

      const result = await logoutAllUseCase({ userId });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Logged out from all devices.",
      });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $inc: { tokenVersion: 1 } }
      );
      expect(RefreshToken.updateMany).toHaveBeenCalledWith(
        { user: userId, isRevoked: false },
        { isRevoked: true }
      );
      expect(logger.info).toHaveBeenCalledWith(
        { userId, revokedCount: 0 },
        "All sessions revoked via logout-all"
      );
    });

    it("should use exec() with User.findByIdAndUpdate", async () => {
      const userId = "user123";
      const mockUpdateResult = { modifiedCount: 3 };
      const mockExec = vi.fn().mockResolvedValue(true);

      User.findByIdAndUpdate.mockReturnValue({ exec: mockExec });
      RefreshToken.updateMany.mockResolvedValue(mockUpdateResult);

      const result = await logoutAllUseCase({ userId });

      expect(result).toEqual({
        success: true,
        statusCode: 200,
        message: "Logged out from all devices.",
      });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        userId,
        { $inc: { tokenVersion: 1 } }
      );
      expect(mockExec).toHaveBeenCalled();
    });
  });

  describe("Error handling", () => {
    it("should return INTERNAL_ERROR when User.findByIdAndUpdate fails", async () => {
      const userId = "user123";
      const userError = new Error("Database connection failed");

      User.findByIdAndUpdate.mockImplementation(() => {
        throw userError;
      });

      const result = await logoutAllUseCase({ userId });

      expect(result).toEqual({
        success: false,
        statusCode: 500,
        message: "Failed to logout from all devices. Please try again.",
        errorCode: "INTERNAL_ERROR",
      });

      expect(logger.error).toHaveBeenCalledWith(
        { err: userError, userId },
        "Logout-all use-case error"
      );
    });

    it("should return INTERNAL_ERROR when RefreshToken.updateMany fails", async () => {
      const userId = "user123";
      const refreshTokenError = new Error("Refresh token update failed");

      User.findByIdAndUpdate = vi.fn().mockImplementation(() => ({
        exec: vi.fn().mockResolvedValue({ tokenVersion: 2 })
      }));
      RefreshToken.updateMany.mockRejectedValue(refreshTokenError);

      const result = await logoutAllUseCase({ userId });

      expect(result).toEqual({
        success: false,
        statusCode: 500,
        message: "Failed to logout from all devices. Please try again.",
        errorCode: "INTERNAL_ERROR",
      });

      expect(logger.error).toHaveBeenCalledWith(
        { err: refreshTokenError, userId },
        "Logout-all use-case error"
      );
    });

    it("should return INTERNAL_ERROR for unexpected errors", async () => {
      const userId = "user123";
      const unexpectedError = new Error("Something unexpected went wrong");

      User.findByIdAndUpdate.mockImplementation(() => {
        throw unexpectedError;
      });

      const result = await logoutAllUseCase({ userId });

      expect(result).toEqual({
        success: false,
        statusCode: 500,
        message: "Failed to logout from all devices. Please try again.",
        errorCode: "INTERNAL_ERROR",
      });

      expect(logger.error).toHaveBeenCalledWith(
        { err: unexpectedError, userId },
        "Logout-all use-case error"
      );
    });
  });
});
