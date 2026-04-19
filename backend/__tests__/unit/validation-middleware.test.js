// backend/__tests__/unit/validation-middleware.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleValidationErrors, validateFields } from "../../middleware/validation/validation-middleware.js";
import { validationResult } from "express-validator";
import { apiResponseManager } from "../../utilities/general/response-manager.js";

vi.mock("express-validator", () => ({
  validationResult: vi.fn(),
  check: vi.fn(() => ({
    exists: vi.fn().mockReturnThis(),
    notEmpty: vi.fn().mockReturnThis(),
    isLength: vi.fn().mockReturnThis(),
    isEmail: vi.fn().mockReturnThis(),
    isUUID: vi.fn().mockReturnThis(),
    isNumeric: vi.fn().mockReturnThis(),
    isFloat: vi.fn().mockReturnThis(),
    isString: vi.fn().mockReturnThis(),
    isURL: vi.fn().mockReturnThis(),
    isArray: vi.fn().mockReturnThis(),
    withMessage: vi.fn().mockReturnThis(),
  })),
}));

vi.mock("../../utilities/general/response-manager.js");

describe("validation-middleware", () => {
  let req, res, next;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {};
    res = {};
    next = vi.fn();
  });

  describe("handleValidationErrors", () => {
    it("should call next if no errors", () => {
      validationResult.mockReturnValue({
        isEmpty: () => true,
      });

      handleValidationErrors(req, res, next);
      expect(next).toHaveBeenCalled();
      expect(apiResponseManager).not.toHaveBeenCalled();
    });

    it("should return 400 if errors exist", () => {
      const mockErrors = [
        { msg: "Email is invalid", param: "email" },
        { msg: "Password too short", param: "password" },
      ];
      validationResult.mockReturnValue({
        isEmpty: () => false,
        array: () => mockErrors,
      });

      handleValidationErrors(req, res, next);

      expect(next).not.toHaveBeenCalled();
      expect(apiResponseManager).toHaveBeenCalledWith(req, res, expect.objectContaining({
        statusCode: 400,
        message: expect.stringContaining("Email is invalid"),
        errorDetails: mockErrors
      }));
    });
  });

  describe("validateFields", () => {
    it("should return an array of validations", () => {
      const fields = [
        { name: "email", dataType: "email", allowed: true },
        { name: "age", dataType: "number", minValue: 18 },
      ];
      const rules = validateFields(fields);
      expect(Array.isArray(rules)).toBe(true);
      expect(rules.length).toBeGreaterThan(0);
    });
  });
});
