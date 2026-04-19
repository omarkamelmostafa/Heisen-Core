// backend/__tests__/unit/not-found-middleware.test.js

import { describe, it, expect, vi, beforeEach } from "vitest";
import { notFoundMiddleware } from "../../middleware/errors/not-found-middleware.js";

// Mock dependencies
vi.mock("../../utilities/general/emit-log.js", () => ({
  emitLogMessage: vi.fn(),
}));

describe("notFoundMiddleware", () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();

    req = {
      originalUrl: "/api/v1/nonexistent",
      requestId: "req-456",
    };

    res = {
      headersSent: false,
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  it("should return 404 with ROUTE_NOT_FOUND error code", () => {
    notFoundMiddleware(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Route not found",
        errorCode: "ROUTE_NOT_FOUND",
      })
    );
  });

  it("should include a timestamp in the response", () => {
    notFoundMiddleware(req, res);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.timestamp).toBeDefined();
  });

  it("should set success to false", () => {
    notFoundMiddleware(req, res);

    const responseBody = res.json.mock.calls[0][0];
    expect(responseBody.success).toBe(false);
  });
});
