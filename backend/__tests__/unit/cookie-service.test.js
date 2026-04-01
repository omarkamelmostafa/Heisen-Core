// backend/__tests__/unit/cookie-service.test.js
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setCookie, clearCookie, setRefreshTokenCookie } from "../../services/auth/cookie-service.js";

describe("Cookie Configuration (cookie-service.js)", () => {
  let mockRes;
  let originalEnv;

  beforeEach(() => {
    mockRes = {
      cookie: vi.fn(),
      clearCookie: vi.fn(),
    };
    originalEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    vi.restoreAllMocks();
  });

  // D1
  it("setCookie sets correct options", () => {
    setCookie(mockRes, "testCookie", "testValue");
    expect(mockRes.cookie).toHaveBeenCalled();

    const args = mockRes.cookie.mock.calls[0];
    expect(args[0]).toBe("testCookie");
    expect(args[1]).toBe("testValue");

    const options = args[2];
    expect(options.httpOnly).toBe(true);
    expect(options.sameSite).toBe("Lax");
    expect(options.path).toBe("/");
  });

  // D2
  it("httpOnly is always true regardless of NODE_ENV", () => {
    process.env.NODE_ENV = "development";
    setCookie(mockRes, "devCookie", "val");
    expect(mockRes.cookie.mock.calls[0][2].httpOnly).toBe(true);

    process.env.NODE_ENV = "production";
    setCookie(mockRes, "prodCookie", "val");
    expect(mockRes.cookie.mock.calls[1][2].httpOnly).toBe(true);
  });

  // D3
  it("secure flag follows environment", async () => {
    vi.resetModules();
    process.env.NODE_ENV = "production";
    const { setCookie: setCookieProd } = await import("../../services/auth/cookie-service.js");
    setCookieProd(mockRes, "prodCookie", "val");
    expect(mockRes.cookie.mock.calls[0][2].secure).toBe(true);

    vi.resetModules();
    process.env.NODE_ENV = "development";
    const { setCookie: setCookieDev } = await import("../../services/auth/cookie-service.js");
    setCookieDev(mockRes, "devCookie", "val");
    expect(mockRes.cookie.mock.calls[1][2].secure).toBe(false);
  });

  // D4
  it("clearCookie uses matching path", async () => {
    vi.resetModules();
    const { clearCookie: clearCookieDyn } = await import("../../services/auth/cookie-service.js");
    clearCookieDyn(mockRes, "testCookie");

    // Check it calls res.cookie with empty string and matching path
    expect(mockRes.cookie).toHaveBeenCalled();
    const args = mockRes.cookie.mock.calls[0];
    expect(args[0]).toBe("testCookie");
    expect(args[1]).toBe("");

    const options = args[2];
    expect(options.path).toBe("/");
    expect(options.maxAge).toBe(0);
  });

  // D5
  it("includes domain when COOKIE_DOMAIN is set", async () => {
    vi.resetModules();
    process.env.COOKIE_DOMAIN = ".example.com";
    const { setCookie, clearCookie } = await import("../../services/auth/cookie-service.js");

    setCookie(mockRes, "testCookie", "val");
    expect(mockRes.cookie.mock.calls[0][2].domain).toBe(".example.com");

    clearCookie(mockRes, "testCookie");
    expect(mockRes.cookie.mock.calls[1][2].domain).toBe(".example.com");
  });
});

describe("setRefreshTokenCookie", () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      cookie: vi.fn(),
    };
  });

  it("sets session cookie when rememberMe is false", () => {
    setRefreshTokenCookie(mockRes, "test-token", false);

    expect(mockRes.cookie).toHaveBeenCalledWith(
      "refresh_token",
      "test-token",
      expect.objectContaining({
        httpOnly: true,
        sameSite: "Lax",
        path: "/",
      })
    );

    // Session cookie: no maxAge
    const options = mockRes.cookie.mock.calls[0][2];
    expect(options.maxAge).toBeUndefined();
  });

  it("sets persistent cookie when rememberMe is true", () => {
    setRefreshTokenCookie(mockRes, "test-token", true);

    const options = mockRes.cookie.mock.calls[0][2];
    expect(options.maxAge).toBe(30 * 24 * 60 * 60 * 1000);
  });

  it("defaults rememberMe to false when not provided", () => {
    setRefreshTokenCookie(mockRes, "test-token");

    const options = mockRes.cookie.mock.calls[0][2];
    expect(options.maxAge).toBeUndefined();
  });

  it("sets secure to true when NODE_ENV is production", () => {
    const original = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    setRefreshTokenCookie(mockRes, "test-token", false);

    const options = mockRes.cookie.mock.calls[0][2];
    expect(options.secure).toBe(true);

    process.env.NODE_ENV = original;
  });

  it("sets secure to false when NODE_ENV is not production", () => {
    process.env.NODE_ENV = "test";

    setRefreshTokenCookie(mockRes, "test-token", false);

    const options = mockRes.cookie.mock.calls[0][2];
    expect(options.secure).toBe(false);
  });

  it("includes domain when COOKIE_DOMAIN is set", () => {
    process.env.COOKIE_DOMAIN = ".example.com";

    setRefreshTokenCookie(mockRes, "test-token", false);

    const options = mockRes.cookie.mock.calls[0][2];
    expect(options.domain).toBe(".example.com");

    delete process.env.COOKIE_DOMAIN;
  });

  it("omits domain when COOKIE_DOMAIN is not set", () => {
    delete process.env.COOKIE_DOMAIN;

    setRefreshTokenCookie(mockRes, "test-token", false);

    const options = mockRes.cookie.mock.calls[0][2];
    expect(options.domain).toBeUndefined();
  });
});

