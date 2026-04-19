// backend/__tests__/unit/authTokenMiddleware.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import { authTokenMiddleware } from "../../middleware/auth/authTokenMiddleware.js";
import { isTokenRevoked } from "../../services/auth/token-service.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import logger from "../../utilities/general/logger.js";

const TEST_SECRET = "test-access-secret-32chars-minimum";

function mintToken(payload, options = {}) {
  return jwt.sign(payload, TEST_SECRET, options);
}

function mintValidAccessToken(overrides = {}) {
  return mintToken(
    {
      UserInfo: {
        userId: "507f1f77bcf86cd799439011",
        email: "test@example.com",
        type: "access",
        ...overrides,
      },
    },
    { expiresIn: "15m", jwtid: "test-jti-001" }
  );
}

// Keep mocks for external dependencies
vi.mock("../../services/auth/token-service.js", () => ({
  isTokenRevoked: vi.fn(),
}));

vi.mock("../../utilities/general/response-manager.js", () => ({
  apiResponseManager: vi.fn(),
}));

vi.mock("../../utilities/general/logger.js", () => ({
  default: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("authTokenMiddleware", () => {
  beforeEach(() => {
    process.env.ACCESS_TOKEN_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.ACCESS_TOKEN_SECRET;
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it("Case 1: Missing Authorization header", async () => {
    const req = { headers: {}, requestId: "test-req-id" };
    const res = {};
    const next = vi.fn();

    await authTokenMiddleware(req, res, next);

    expect(apiResponseManager).toHaveBeenCalledWith(req, res, expect.objectContaining({
      errorCode: "NO_ACCESS_TOKEN"
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it("Case 2: Header does not start with Bearer", async () => {
    const req = { headers: { authorization: "Token abc123" }, requestId: "test-req-id" };
    const res = {};
    const next = vi.fn();

    await authTokenMiddleware(req, res, next);

    expect(apiResponseManager).toHaveBeenCalledWith(req, res, expect.objectContaining({
      errorCode: "NO_ACCESS_TOKEN"
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it("Case 3: Empty token after Bearer prefix", async () => {
    const req = { headers: { authorization: "Bearer " }, requestId: "test-req-id" };
    const res = {};
    const next = vi.fn();

    await authTokenMiddleware(req, res, next);

    expect(apiResponseManager).toHaveBeenCalledWith(req, res, expect.objectContaining({
      errorCode: "NO_ACCESS_TOKEN"
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it("Case 4: Token type is not 'access' (is 'refresh')", async () => {
    const token = mintToken({ UserInfo: { userId: "507f1f77bcf86cd799439011", type: "refresh" } }, { expiresIn: "15m" });
    const req = { headers: { authorization: `Bearer ${token}` }, requestId: "test-req-id" };
    const res = {};
    const next = vi.fn();

    await authTokenMiddleware(req, res, next);

    expect(apiResponseManager).toHaveBeenCalledWith(req, res, expect.objectContaining({
      errorCode: "TOKEN_INVALID"
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it("Case 5: Token JTI is revoked in Redis", async () => {
    const token = mintValidAccessToken();
    isTokenRevoked.mockResolvedValue(true);
    const req = { headers: { authorization: `Bearer ${token}` }, requestId: "test-req-id" };
    const res = {};
    const next = vi.fn();

    await authTokenMiddleware(req, res, next);

    expect(isTokenRevoked).toHaveBeenCalledWith("test-jti-001");
    expect(apiResponseManager).toHaveBeenCalledWith(req, res, expect.objectContaining({
      errorCode: "TOKEN_INVALID"
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it("Case 6: Token has no JTI — skip revocation check, call next()", async () => {
    const token = mintToken(
      {
        UserInfo: {
          userId: "507f1f77bcf86cd799439011",
          email: "test@example.com",
          type: "access",
        },
      },
      { expiresIn: "15m" } // no jwtid
    );
    const req = { headers: { authorization: `Bearer ${token}` }, requestId: "test-req-id", user: undefined };
    const res = {};
    const next = vi.fn();

    await authTokenMiddleware(req, res, next);

    expect(isTokenRevoked).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
    expect(req.user.userId).toBe("507f1f77bcf86cd799439011");
    expect(req.user.type).toBe("access");
  });

  it("Case 7: Valid non-revoked token — attaches req.user and calls next()", async () => {
    const token = mintValidAccessToken();
    isTokenRevoked.mockResolvedValue(false);
    const req = { headers: { authorization: `Bearer ${token}` }, requestId: "test-req-id", user: undefined };
    const res = {};
    const next = vi.fn();

    await authTokenMiddleware(req, res, next);

    expect(isTokenRevoked).toHaveBeenCalledWith("test-jti-001");
    expect(next).toHaveBeenCalled();
    expect(req.user.userId).toBe("507f1f77bcf86cd799439011");
    expect(req.user.type).toBe("access");
  });

  it("Case 8: Expired token — returns TOKEN_EXPIRED", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2025-01-01T00:00:00Z"));
    const token = mintValidAccessToken();
    vi.advanceTimersByTime(16 * 60 * 1000); // 16 minutes
    vi.useRealTimers();

    const req = { headers: { authorization: `Bearer ${token}` }, requestId: "test-req-id" };
    const res = {};
    const next = vi.fn();

    await authTokenMiddleware(req, res, next);

    expect(apiResponseManager).toHaveBeenCalledWith(req, res, expect.objectContaining({
      errorCode: "TOKEN_EXPIRED"
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it("Case 9: Malformed / tampered token — returns TOKEN_INVALID", async () => {
    const req = { headers: { authorization: "Bearer invalid.token.string" }, requestId: "test-req-id" };
    const res = {};
    const next = vi.fn();

    await authTokenMiddleware(req, res, next);

    expect(apiResponseManager).toHaveBeenCalledWith(req, res, expect.objectContaining({
      errorCode: "TOKEN_INVALID"
    }));
    expect(next).not.toHaveBeenCalled();
  });

  it("Case 10: Unexpected non-jwt error — returns 500", async () => {
    const token = mintValidAccessToken();
    const req = { headers: { authorization: `Bearer ${token}` }, requestId: "test-req-id" };
    const res = {};
    const next = vi.fn();

    // Corrupt the secret to cause a generic error
    process.env.ACCESS_TOKEN_SECRET = "";

    await authTokenMiddleware(req, res, next);

    expect(apiResponseManager).toHaveBeenCalledWith(req, res, expect.objectContaining({
      errorCode: "TOKEN_INVALID"
    }));
    expect(next).not.toHaveBeenCalled();
  });
});