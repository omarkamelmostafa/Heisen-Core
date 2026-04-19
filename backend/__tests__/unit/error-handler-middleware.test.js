// backend/__tests__/unit/error-handler-middleware.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { errorHandlerMiddleware } from "../../middleware/errors/error-handler-middleware.js";
import { AppError } from "../../errors/AppError.js";

// Mock dependencies
vi.mock("../../utilities/general/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("../../utilities/general/emit-log.js", () => ({
  emitLogMessage: vi.fn(),
}));

describe("errorHandlerMiddleware", () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      originalUrl: "/api/v1/test",
      requestId: "req-123",
    };

    res = {
      headersSent: false,
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    next = vi.fn();
  });

  describe("Operational errors (AppError)", () => {
    it("should return structured response for AppError instances", () => {
      const err = new AppError("Resource not found", 404, "NOT_FOUND");

      errorHandlerMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Resource not found",
          errorCode: "NOT_FOUND",
        })
      );
    });

    it("should include retry info for RateLimitError-like errors", () => {
      const err = new AppError("Too many requests", 429, "RATE_LIMITED");
      err.retryAfterSeconds = 60;
      err.reason = "Too many login attempts";

      errorHandlerMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(429);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          message: "Too many requests",
          errorCode: "RATE_LIMITED",
          data: {
            retryAfter: 60,
            reason: "Too many login attempts",
          },
        })
      );
    });

    it("should handle various status codes", () => {
      const err = new AppError("Bad request", 400, "BAD_REQUEST");

      errorHandlerMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("Unexpected errors", () => {
    it("should return 500 for non-AppError errors", () => {
      const err = new Error("Something unexpected happened");

      errorHandlerMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          errorCode: "INTERNAL_ERROR",
        })
      );
    });

    it("should expose error message in non-production environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const err = new Error("Detailed error info");

      errorHandlerMiddleware(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Detailed error info",
        })
      );

      process.env.NODE_ENV = originalEnv;
    });

    it("should hide error message in production environment", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const err = new Error("Sensitive internal error details");

      errorHandlerMiddleware(err, req, res, next);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "An internal server error occurred.",
        })
      );

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Headers already sent", () => {
    it("should delegate to next() when headers are already sent", () => {
      res.headersSent = true;
      const err = new Error("After headers sent");

      errorHandlerMiddleware(err, req, res, next);

      expect(next).toHaveBeenCalledWith(err);
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });
  });

  describe("Error without statusCode", () => {
    it("should default to 500 when error has no statusCode", () => {
      const err = new Error("No status code");

      errorHandlerMiddleware(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
