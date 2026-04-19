// backend/__tests__/unit/core-middleware.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRequestIdMiddleware } from "../../middleware/core/request-id-middleware.js";
import { createApiVersionMiddleware } from "../../middleware/core/api-version-middleware.js";
import { credentialsMiddleware } from "../../middleware/core/credentials-middleware.js";

describe("core middleware", () => {
  let req, res, next;

  beforeEach(() => {
    req = { headers: {}, get: vi.fn(), ip: "127.0.0.1", url: "/api/v1/test", path: "/api/v1/test" };
    res = { set: vi.fn(), header: vi.fn(), setHeader: vi.fn() };
    next = vi.fn();
  });

  describe("requestIdMiddleware", () => {
    it("should assign a uuid to req.requestId and set header", () => {
      const requestIdMiddleware = createRequestIdMiddleware();
      requestIdMiddleware(req, res, next);
      expect(req.requestId).toBeDefined();
      expect(res.set).toHaveBeenCalledWith("x-request-id", req.requestId);
      expect(next).toHaveBeenCalled();
    });
  });

  describe("apiVersionMiddleware", () => {
    it("should set X-API-Version header", () => {
      const apiVersionMiddleware = createApiVersionMiddleware();
      apiVersionMiddleware(req, res, next);
      expect(res.setHeader).toHaveBeenCalledWith("X-API-Version", "1");
      expect(next).toHaveBeenCalled();
    });
  });

  describe("credentialsMiddleware", () => {
    it("should set Access-Control-Allow-Credentials if origin is allowed", () => {
      req.headers.origin = "http://localhost:3000";
      req.get.mockReturnValue("Browser");
      credentialsMiddleware(req, res, next);
      expect(res.header).toHaveBeenCalledWith("Access-Control-Allow-Credentials", "true");
      expect(next).toHaveBeenCalled();
    });
  });
});
