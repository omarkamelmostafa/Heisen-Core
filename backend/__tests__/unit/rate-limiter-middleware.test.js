// backend/__tests__/unit/rate-limiter-middleware.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRateLimiterMiddleware } from "../../middleware/security/rate-limiter-middleware.js";
import {
  loginLimiter,
  registerLimiter,
  forgotPasswordLimiter,
  refreshLimiter,
  resetPasswordLimiter,
  verifyEmailLimiter,
  resendVerificationLimiter,
  userMeLimiter,
  healthLimiter,
  logoutLimiter,
  updateProfileLimiter,
  emailConfirmLimiter,
  emailChangeLimiter,
  changePasswordLimiter,
  toggle2faLimiter,
  verify2faLimiter,
  resend2faLimiter,
  avatarUploadLimiter,
} from "../../middleware/security/rate-limiters.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createRateLimiterMiddleware", () => {
  describe("test environment bypass", () => {
    it("calls next() immediately in test environment", () => {
      const mockReq = {};
      const mockRes = {};
      const mockNext = vi.fn();
      const middleware = createRateLimiterMiddleware({ windowMs: 60_000, max: 5 });
      middleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledOnce();
    });

    it("does not call any rate limiting logic in test environment", () => {
      const mockReq = {};
      const mockRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn(),
        setHeader: vi.fn(),
      };
      const mockNext = vi.fn();
      const middleware = createRateLimiterMiddleware({
        windowMs: 60_000,
        max: 5,
        message: { text: "x", errorCode: "Y" },
      });
      middleware(mockReq, mockRes, mockNext);
      expect(mockNext).toHaveBeenCalledOnce();
      expect(mockRes.status).not.toHaveBeenCalled();
      expect(mockRes.json).not.toHaveBeenCalled();
      expect(mockRes.setHeader).not.toHaveBeenCalled();
    });

    it("returns a function (middleware) regardless of environment", () => {
      const middleware = createRateLimiterMiddleware({});
      expect(typeof middleware).toBe("function");
    });
  });

  describe("middleware factory behavior", () => {
    it("accepts windowMs and max options without throwing", () => {
      expect(() =>
        createRateLimiterMiddleware({ windowMs: 5 * 60 * 1000, max: 10 }),
      ).not.toThrow();
    });

    it("accepts a message option without throwing", () => {
      expect(() =>
        createRateLimiterMiddleware({
          message: {
            text: "Custom limit message",
            errorCode: "RATE_LIMITED",
          },
        }),
      ).not.toThrow();
    });

    it("accepts a keyGenerator function option without throwing", () => {
      expect(() =>
        createRateLimiterMiddleware({
          keyGenerator: (req) => req.ip ?? "unknown",
        }),
      ).not.toThrow();
    });
  });
});

describe("Rate limiter configurations", () => {
  it("loginLimiter is a callable middleware function", () => {
    expect(typeof loginLimiter).toBe("function");
  });

  it("registerLimiter is a callable middleware function", () => {
    expect(typeof registerLimiter).toBe("function");
  });

  it("forgotPasswordLimiter is a callable middleware function", () => {
    expect(typeof forgotPasswordLimiter).toBe("function");
  });

  it("refreshLimiter is a callable middleware function", () => {
    expect(typeof refreshLimiter).toBe("function");
  });

  it("resetPasswordLimiter is a callable middleware function", () => {
    expect(typeof resetPasswordLimiter).toBe("function");
  });

  it("verifyEmailLimiter is a callable middleware function", () => {
    expect(typeof verifyEmailLimiter).toBe("function");
  });

  it("resendVerificationLimiter is a callable middleware function", () => {
    expect(typeof resendVerificationLimiter).toBe("function");
  });

  it("userMeLimiter is a callable middleware function", () => {
    expect(typeof userMeLimiter).toBe("function");
  });

  it("healthLimiter is a callable middleware function", () => {
    expect(typeof healthLimiter).toBe("function");
  });

  it("logoutLimiter is a callable middleware function", () => {
    expect(typeof logoutLimiter).toBe("function");
  });

  it("updateProfileLimiter is a callable middleware function", () => {
    expect(typeof updateProfileLimiter).toBe("function");
  });

  it("emailConfirmLimiter is a callable middleware function", () => {
    expect(typeof emailConfirmLimiter).toBe("function");
  });

  it("emailChangeLimiter is a callable middleware function", () => {
    expect(typeof emailChangeLimiter).toBe("function");
  });

  it("changePasswordLimiter is a callable middleware function", () => {
    expect(typeof changePasswordLimiter).toBe("function");
  });

  it("toggle2faLimiter is a callable middleware function", () => {
    expect(typeof toggle2faLimiter).toBe("function");
  });

  it("verify2faLimiter is a callable middleware function", () => {
    expect(typeof verify2faLimiter).toBe("function");
  });

  it("resend2faLimiter is a callable middleware function", () => {
    expect(typeof resend2faLimiter).toBe("function");
  });

  it("avatarUploadLimiter is a callable middleware function", () => {
    expect(typeof avatarUploadLimiter).toBe("function");
  });
});

describe("Test environment bypass behavior", () => {
  it("loginLimiter calls next() without blocking in test env", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = vi.fn();
    await loginLimiter(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledOnce();
  });

  it("forgotPasswordLimiter calls next() without blocking in test env", async () => {
    const mockReq = {};
    const mockRes = {};
    const mockNext = vi.fn();
    await forgotPasswordLimiter(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalledOnce();
  });
});
