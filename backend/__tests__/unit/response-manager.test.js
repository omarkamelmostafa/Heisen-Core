// backend/__tests__/unit/response-manager.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiResponseManager } from "../../utilities/general/response-manager.js";

vi.mock("../../utilities/general/emit-log.js", () => ({
  emitLogMessage: vi.fn(),
}));

import { emitLogMessage } from "../../utilities/general/emit-log.js";

function makeResMock() {
  const res = {
    headersSent: false,
    statusCode: null,
    body: null,
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockImplementation(function (body) {
      this.body = body;
    }),
  };
  return res;
}

function makeReqMock(requestId = null) {
  return { requestId };
}

describe("apiResponseManager — Success Responses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct success envelope shape", () => {
    const req = makeReqMock();
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
    });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe("OK");
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(res.body.requestId).toBeNull();
    expect(res.json.mock.calls[0][0]).not.toHaveProperty("data");
    expect(res.json.mock.calls[0][0]).not.toHaveProperty("pagination");
    expect(res.json.mock.calls[0][0]).not.toHaveProperty("details");
    expect(res.json.mock.calls[0][0]).not.toHaveProperty("errorCode");
  });

  it("includes data field only when data is provided", () => {
    const req = makeReqMock();
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
      data: { userId: "123" },
    });

    expect(res.body.data).toEqual({ userId: "123" });
  });

  it("does NOT include data field when data is null", () => {
    const req = makeReqMock();
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
      data: null,
    });

    expect(res.json.mock.calls[0][0]).not.toHaveProperty("data");
  });

  it("includes pagination field only when pagination is provided", () => {
    const req = makeReqMock();
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
      pagination: { page: 1, total: 50 },
    });

    expect(res.body.pagination).toEqual({ page: 1, total: 50 });
  });

  it("does NOT include pagination when pagination is null", () => {
    const req = makeReqMock();
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
      pagination: null,
    });

    expect(res.json.mock.calls[0][0]).not.toHaveProperty("pagination");
  });

  it("sets correct HTTP status code", () => {
    const req = makeReqMock();
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 201,
      success: true,
      message: "Created",
    });

    expect(res.status.mock.calls[0][0]).toBe(201);
  });
});

describe("apiResponseManager — Error Responses", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns correct error envelope shape", () => {
    const req = makeReqMock();
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 400,
      success: false,
      message: "Bad input",
      errorCode: "VALIDATION_ERROR",
    });

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Bad input");
    expect(res.body.errorCode).toBe("VALIDATION_ERROR");
    expect(res.body.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(res.json.mock.calls[0][0]).not.toHaveProperty("data");
  });

  it("errorCode field is present when provided", () => {
    const req = makeReqMock();
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 400,
      success: false,
      message: "Error",
      errorCode: "TOKEN_EXPIRED",
    });

    expect(res.body.errorCode).toBe("TOKEN_EXPIRED");
  });

  it("errorCode field is absent when not provided", () => {
    const req = makeReqMock();
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 400,
      success: false,
      message: "Error",
    });

    expect(res.json.mock.calls[0][0]).not.toHaveProperty("errorCode");
  });

  it("includes errorDetails as details field when provided", () => {
    const req = makeReqMock();
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 500,
      success: false,
      message: "Server error",
      errorDetails: "Stack trace here",
    });

    expect(res.body.details).toBe("Stack trace here");
  });

  it("does NOT include details field when errorDetails is null", () => {
    const req = makeReqMock();
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 500,
      success: false,
      message: "Server error",
      errorDetails: null,
    });

    expect(res.json.mock.calls[0][0]).not.toHaveProperty("details");
  });

  it("timestamp is always a valid ISO-8601 string", () => {
    const req = makeReqMock();
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
    });

    const ts = res.body.timestamp;
    expect(new Date(ts).toISOString()).toBe(ts);
  });
});

describe("apiResponseManager — requestId Resolution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses req.requestId when present", () => {
    const req = makeReqMock("req-id-abc");
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
    });

    expect(res.body.requestId).toBe("req-id-abc");
  });

  it("falls back to options.requestId when req.requestId is null", () => {
    const req = makeReqMock(null);
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
      requestId: "opt-id-xyz",
    });

    expect(res.body.requestId).toBe("opt-id-xyz");
  });

  it("sets requestId to null when neither req nor options provide one", () => {
    const req = makeReqMock(null);
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
    });

    expect(res.body.requestId).toBeNull();
  });

  it("prefers req.requestId over options.requestId", () => {
    const req = makeReqMock("from-req");
    const res = makeResMock();

    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
      requestId: "from-options",
    });

    expect(res.body.requestId).toBe("from-req");
  });
});

describe("apiResponseManager — headersSent Guard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns early and calls emitLogMessage when headers already sent", () => {
    const req = makeReqMock();
    const res = makeResMock();
    res.headersSent = true;

    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
    });

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(emitLogMessage).toHaveBeenCalledTimes(1);
  });

  it("does NOT call emitLogMessage on normal response", () => {
    const req = makeReqMock();
    const res = makeResMock();
    res.headersSent = false;

    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "OK",
    });

    expect(emitLogMessage).not.toHaveBeenCalled();
  });
});
