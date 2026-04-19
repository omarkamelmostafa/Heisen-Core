// backend/__tests__/unit/AppError.test.js

import { describe, it, expect } from "vitest";
import { AppError } from "../../errors/AppError.js";

describe("AppError", () => {
  describe("Constructor defaults", () => {
    it("should create an error with default statusCode 500 and errorCode INTERNAL_ERROR", () => {
      const err = new AppError("Something broke");

      expect(err).toBeInstanceOf(Error);
      expect(err).toBeInstanceOf(AppError);
      expect(err.message).toBe("Something broke");
      expect(err.statusCode).toBe(500);
      expect(err.errorCode).toBe("INTERNAL_ERROR");
      expect(err.isOperational).toBe(true);
      expect(err.name).toBe("AppError");
    });
  });

  describe("Custom status codes", () => {
    it("should accept a custom statusCode", () => {
      const err = new AppError("Not found", 404);

      expect(err.statusCode).toBe(404);
      expect(err.errorCode).toBe("INTERNAL_ERROR"); // default
    });

    it("should accept a custom statusCode and errorCode", () => {
      const err = new AppError("Conflict", 409, "DUPLICATE_RESOURCE");

      expect(err.statusCode).toBe(409);
      expect(err.errorCode).toBe("DUPLICATE_RESOURCE");
    });
  });

  describe("Stack trace", () => {
    it("should capture a stack trace", () => {
      const err = new AppError("test error");

      expect(err.stack).toBeDefined();
      expect(err.stack).toContain("AppError");
    });

    it("should not include the constructor frame in the stack trace", () => {
      const err = new AppError("test error");

      // The first line of the stack should reference the test file, not AppError constructor
      const stackLines = err.stack.split("\n");
      expect(stackLines[0]).toContain("AppError: test error");
    });
  });

  describe("Inheritance", () => {
    it("should be catchable as a generic Error", () => {
      const err = new AppError("catchable", 400, "BAD_REQUEST");

      expect(() => {
        throw err;
      }).toThrow(Error);
    });

    it("should be catchable as an AppError", () => {
      const err = new AppError("catchable", 400, "BAD_REQUEST");

      expect(() => {
        throw err;
      }).toThrow(AppError);
    });

    it("should be identifiable via instanceof", () => {
      const err = new AppError("test");

      expect(err instanceof Error).toBe(true);
      expect(err instanceof AppError).toBe(true);
    });
  });

  describe("isOperational flag", () => {
    it("should always set isOperational to true", () => {
      const err1 = new AppError("op error", 400);
      const err2 = new AppError("server error", 500);

      expect(err1.isOperational).toBe(true);
      expect(err2.isOperational).toBe(true);
    });
  });

  describe("Default export", () => {
    it("should export AppError as default", async () => {
      const module = await import("../../errors/AppError.js");

      expect(module.default).toBe(AppError);
    });
  });
});
