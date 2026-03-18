import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { setCookie, clearCookie } from "../../services/auth/cookie-service.js";

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

