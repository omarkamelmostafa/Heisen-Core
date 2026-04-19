// backend/__tests__/unit/auth-shared.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendUseCaseResponse } from "../../controllers/auth/auth-shared.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";

vi.mock("../../utilities/general/response-manager.js");

describe("auth-shared utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sendUseCaseResponse", () => {
    it("should call apiResponseManager with correct mapping", () => {
      const req = { id: 1 };
      const res = { id: 2 };
      const result = {
        statusCode: 200,
        success: true,
        message: "Success",
        data: { some: "data" },
        errorCode: "NONE"
      };

      sendUseCaseResponse(req, res, result);

      expect(apiResponseManager).toHaveBeenCalledWith(req, res, {
        statusCode: 200,
        success: true,
        message: "Success",
        data: { some: "data" },
        errorCode: "NONE"
      });
    });

    it("should omit data and errorCode if missing in result", () => {
      const result = {
        statusCode: 400,
        success: false,
        message: "Fail"
      };

      sendUseCaseResponse({}, {}, result);

      expect(apiResponseManager).toHaveBeenCalledWith({}, {}, {
        statusCode: 400,
        success: false,
        message: "Fail"
      });
    });
  });
});
