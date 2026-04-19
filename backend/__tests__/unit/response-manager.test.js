// backend/__tests__/unit/response-manager.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiResponseManager } from "../../utilities/general/response-manager.js";

describe("apiResponseManager", () => {
  let req, res;

  beforeEach(() => {
    req = { requestId: "req-123" };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      headersSent: false,
    };
  });

  it("should send a success response", () => {
    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
      data: { foo: "bar" }
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: true,
      message: "OK",
      data: { foo: "bar" },
      requestId: "req-123"
    }));
  });

  it("should send an error response with details and code", () => {
    apiResponseManager(req, res, {
      statusCode: 400,
      success: false,
      message: "Fail",
      errorDetails: "Some detail",
      errorCode: "ERR_CODE"
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      success: false,
      message: "Fail",
      details: "Some detail",
      errorCode: "ERR_CODE"
    }));
  });

  it("should include pagination if provided", () => {
    const pagination = { total: 100 };
    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
      pagination
    });

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      pagination
    }));
  });

  it("should use provided requestId if req.requestId is missing", () => {
    req.requestId = null;
    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
      requestId: "provided-id"
    });

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      requestId: "provided-id"
    }));
  });

  it("returns null requestId when both req.requestId and requestId param are absent", () => {
    req = {};
    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
    });

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: null,
      })
    );
  });

  it("should not send response if headers already sent", () => {
    res.headersSent = true;
    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK"
    });

    expect(res.status).not.toHaveBeenCalled();
  });
});
