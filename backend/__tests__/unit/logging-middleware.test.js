// backend/__tests__/unit/logging-middleware.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createLoggingMiddleware, logMessage } from "../../middleware/core/logging-middleware.js";
import logger from "../../utilities/general/logger.js";
import fs from "fs/promises";

vi.mock("../../utilities/general/logger.js", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("fs/promises");
vi.mock("../../utilities/utils.js", () => ({
  ensureDirectoryExists: vi.fn(),
  ensureFileExists: vi.fn(),
}));

describe("logging-middleware", () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = { 
      requestId: "123", 
      method: "GET", 
      originalUrl: "/test", 
      headers: { origin: "localhost" } 
    };
    res = { 
      statusCode: 200, 
      statusMessage: "OK",
      on: vi.fn((event, cb) => {
        if (event === "finish") res._finishCb = cb;
      })
    };
    next = vi.fn();
  });

  describe("createLoggingMiddleware", () => {
    it("should log request start and finish", () => {
      createLoggingMiddleware(req, res, next);
      expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ method: "GET" }), "Request started");
      expect(next).toHaveBeenCalled();

      // Trigger finish
      res._finishCb();
      expect(logger.info).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 200 }), "Request finished");
    });

    it("should log error level for 5xx status codes", () => {
      createLoggingMiddleware(req, res, next);
      res.statusCode = 500;
      res._finishCb();
      expect(logger.error).toHaveBeenCalledWith(expect.objectContaining({ statusCode: 500 }), "Request finished");
    });
  });

  describe("logMessage (legacy)", () => {
    it("should append to file", async () => {
      await logMessage("msg", "test.log", "info");
      expect(fs.appendFile).toHaveBeenCalled();
    });

    it("should throw for invalid level", async () => {
      await expect(logMessage("msg", "test.log", "invalid")).rejects.toThrow("Invalid log level");
    });
  });
});
