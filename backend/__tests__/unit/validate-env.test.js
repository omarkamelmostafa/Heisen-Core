// backend/__tests__/unit/validate-env.test.js

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { validateEnv } from "../../config/validate-env.js";
import logger from "../../utilities/general/logger.js";

// Mock logger
vi.mock("../../utilities/general/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe("validateEnv", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Restore original env vars
    process.env = { ...originalEnv };
  });

  describe("Required variables", () => {
    it("should throw when ACCESS_TOKEN_SECRET is missing", () => {
      delete process.env.ACCESS_TOKEN_SECRET;
      delete process.env.REFRESH_TOKEN_SECRET;

      expect(() => validateEnv()).toThrow(
        "Server cannot start: missing required environment variables"
      );
      expect(logger.error).toHaveBeenCalled();
    });

    it("should throw when REFRESH_TOKEN_SECRET is missing", () => {
      process.env.ACCESS_TOKEN_SECRET = "test-secret";
      delete process.env.REFRESH_TOKEN_SECRET;

      expect(() => validateEnv()).toThrow(
        "Server cannot start: missing required environment variables"
      );
    });

    it("should not throw when all required variables are set", () => {
      process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
      process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";

      expect(() => validateEnv()).not.toThrow();
      expect(logger.info).toHaveBeenCalledWith("Environment validation passed");
    });
  });

  describe("Recommended variables", () => {
    it("should warn when recommended variables are missing", () => {
      process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
      process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
      delete process.env.ETHEREAL_HOST;
      delete process.env.ETHEREAL_PORT;
      delete process.env.ETHEREAL_USER;
      delete process.env.ETHEREAL_PASS;
      delete process.env.ALLOWED_ORIGINS;
      delete process.env.FRONTEND_URL;

      validateEnv();

      expect(logger.warn).toHaveBeenCalled();
      const warnMessage = logger.warn.mock.calls[0][0];
      expect(warnMessage).toContain("ETHEREAL_HOST");
    });

    it("should not warn when all recommended variables are set", () => {
      process.env.ACCESS_TOKEN_SECRET = "test-access-secret";
      process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret";
      process.env.ETHEREAL_HOST = "smtp.test.com";
      process.env.ETHEREAL_PORT = "587";
      process.env.ETHEREAL_USER = "testuser";
      process.env.ETHEREAL_PASS = "testpass";
      process.env.ALLOWED_ORIGINS = "http://localhost:3000";
      process.env.FRONTEND_URL = "http://localhost:3000";

      validateEnv();

      expect(logger.warn).not.toHaveBeenCalled();
      expect(logger.info).toHaveBeenCalledWith("Environment validation passed");
    });
  });

  describe("Combined scenarios", () => {
    it("should include all missing required vars in the error message", () => {
      delete process.env.ACCESS_TOKEN_SECRET;
      delete process.env.REFRESH_TOKEN_SECRET;

      expect(() => validateEnv()).toThrow();

      const errorMessage = logger.error.mock.calls[0][0];
      expect(errorMessage).toContain("ACCESS_TOKEN_SECRET");
      expect(errorMessage).toContain("REFRESH_TOKEN_SECRET");
    });
  });
});
