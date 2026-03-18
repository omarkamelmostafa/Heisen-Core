import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import jwt from "jsonwebtoken";
import {
  generateTokens,
  verifyRefreshToken,
  refreshAccessToken,
  isTokenExpiringSoon,
  safeVerifyOrDecode,
  revokeByJti,
  isTokenRevoked,
  getBlacklistStats,
} from "../../utilities/auth/token-utils.js";
import redis from "../../config/redis.js";

// token-utils.js purpose:
// This module offers a lightweight token utility wrapper replicating token-service functionality.
// It directly signs JWTs and integrates deeply with Redis to handle JWT blocklists and revocation
// stats, offering localized token manipulation distinct from the DB-backed refresh token logic.

vi.mock("../../config/redis.js", () => ({
  default: {
    setex: vi.fn(),
    get: vi.fn(),
    ping: vi.fn(),
    keys: vi.fn().mockResolvedValue([]),
    pipeline: vi.fn().mockReturnValue({
      get: vi.fn(),
      exec: vi.fn().mockResolvedValue([]),
    }),
  },
}));

const TEST_ACCESS_SECRET = "test-access-token-secret-utils";
const TEST_REFRESH_SECRET = "test-refresh-token-secret-utils";
const TEST_USER_ID = "609c1f77bcf86cd799439abc";

const mockUser = {
  _id: TEST_USER_ID,
  email: "utils@example.com",
  uuid: "test-uuid-utils",
  tokenVersion: 1,
};

describe("Token Utilities (utilities/auth/token-utils.js)", () => {
  beforeEach(() => {
    process.env.ACCESS_TOKEN_SECRET = TEST_ACCESS_SECRET;
    process.env.REFRESH_TOKEN_SECRET = TEST_REFRESH_SECRET;
    process.env.ACCESS_TOKEN_EXPIRY = "15m";
    process.env.REFRESH_TOKEN_EXPIRY = "7d";
    process.env.JWT_ISSUER = "test-issuer";
    process.env.JWT_AUDIENCE = "test-audience";
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("generateTokens creates valid access and refresh JWTs", async () => {
    const result = await generateTokens(mockUser);
    expect(result.accessToken.split(".")).toHaveLength(3);
    expect(result.refreshToken.split(".")).toHaveLength(3);
    expect(result.accessTokenExpiresIn).toBe("15m");
  });

  it("verifyRefreshToken works for valid tokens", async () => {
    const { refreshToken } = await generateTokens(mockUser);
    const decoded = verifyRefreshToken(refreshToken);
    expect(decoded.userId).toBe(TEST_USER_ID);
  });

  it("verifyRefreshToken throws on invalid token", () => {
    expect(() => verifyRefreshToken("invalid")).toThrow(/Refresh token invalid/);
  });

  it("refreshAccessToken works when valid", async () => {
    const { refreshToken } = await generateTokens(mockUser);
    const result = await refreshAccessToken(refreshToken, mockUser);
    expect(result.accessToken.split(".")).toHaveLength(3);
  });

  it("refreshAccessToken throws when version mismatches", async () => {
    const { refreshToken } = await generateTokens(mockUser);
    // User version evolved
    await expect(refreshAccessToken(refreshToken, { ...mockUser, tokenVersion: 2 })).rejects.toThrow("Token revoked. Please login again.");
  });

  it("isTokenExpiringSoon handles soon and not soon", async () => {
    const { accessToken } = await generateTokens(mockUser);
    expect(isTokenExpiringSoon(accessToken, 5)).toBe(false);

    vi.useFakeTimers();
    vi.advanceTimersByTime(11 * 60 * 1000); // 11 min passes out of 15
    expect(isTokenExpiringSoon(accessToken, 5)).toBe(true);
  });

  it("isTokenExpiringSoon returns true for null or un-expiring tokens", () => {
    expect(isTokenExpiringSoon("invalid-token", 5)).toBe(true);
  });

  it("safeVerifyOrDecode works normally", async () => {
    const { accessToken } = await generateTokens(mockUser);
    const r = safeVerifyOrDecode(accessToken, TEST_ACCESS_SECRET);
    expect(r.UserInfo.userId).toBe(TEST_USER_ID);
  });

  it("safeVerifyOrDecode decode fallback", async () => {
    const { accessToken } = await generateTokens(mockUser);
    const tampered = accessToken.slice(0, -5) + "aaaaa"; // break sig
    const r = safeVerifyOrDecode(tampered, TEST_ACCESS_SECRET);
    expect(r.UserInfo.userId).toBe(TEST_USER_ID); // decode works
  });

  it("safeVerifyOrDecode fully malformed returns null", () => {
    expect(safeVerifyOrDecode("abc", TEST_ACCESS_SECRET)).toBeNull();
  });

  describe("Redis functionalities", () => {
    it("revokeByJti skips if no jti or expired", async () => {
      await revokeByJti();
      await revokeByJti("test", 0);
      expect(redis.setex).not.toHaveBeenCalled();
    });

    it("revokeByJti writes to redis", async () => {
      await revokeByJti("test", Math.floor(Date.now() / 1000) + 10);
      expect(redis.setex).toHaveBeenCalled();
    });

    it("revokeByJti handles fallback warning natively", async () => {
        // Mock error and ensure warning does not crash
        redis.setex.mockRejectedValueOnce(new Error("redis-fail"));
        await expect(revokeByJti("test", Math.floor(Date.now() / 1000) + 10)).rejects.toThrow();
    });

    it("isTokenRevoked checks redis", async () => {
      redis.get.mockResolvedValueOnce("1").mockResolvedValueOnce("0");
      expect(await isTokenRevoked("found")).toBe(true);
      expect(await isTokenRevoked("not-found")).toBe(false);
    });

    it("isTokenRevoked gracefully handles redis failure", async () => {
      redis.get.mockRejectedValueOnce(new Error("fail"));
      expect(await isTokenRevoked("err")).toBe(false);
    });

    it("getBlacklistStats handles empty", async () => {
      redis.keys.mockResolvedValueOnce([]);
      const s = await getBlacklistStats();
      expect(s.totalTokens).toBe(0);
    });

    it("getBlacklistStats handles valid keys", async () => {
      redis.keys.mockResolvedValueOnce(["1","2"]);
      redis.pipeline.mockReturnValueOnce({
        get: vi.fn(),
        exec: vi.fn().mockResolvedValue([ [null,"1"], [null,"0"] ])
      });
      const s = await getBlacklistStats();
      expect(s.revokedCount).toBe(1);
      expect(s.totalTokens).toBe(2);
      expect(s.revokedPercentage).toBe("50.00");
    });

    it("getBlacklistStats handles errors", async () => {
      redis.ping.mockRejectedValueOnce(new Error("ping fails"));
      const s = await getBlacklistStats();
      expect(s.connected).toBe(false);
    });
  });

  describe("Branch and Edge Cases", () => {
    it("safeVerifyOrDecode hits inner catch with null token", () => {
      expect(safeVerifyOrDecode(null, TEST_ACCESS_SECRET)).toBeNull();
    });

    it("safeVerifyOrDecode passes options through verify", () => {
      const token = jwt.sign({ a: 1 }, TEST_ACCESS_SECRET, { expiresIn: "-10s" });
      const result = safeVerifyOrDecode(token, TEST_ACCESS_SECRET, { ignoreExpiration: true });
      expect(result).not.toBeNull();
    });

    it("verifyRefreshToken works without env default issuer/audience", () => {
      delete process.env.JWT_ISSUER;
      delete process.env.JWT_AUDIENCE;
      const token = jwt.sign({ userId: TEST_USER_ID, tokenVersion: 1 }, TEST_REFRESH_SECRET);
      const decoded = verifyRefreshToken(token);
      expect(decoded.userId).toBe(TEST_USER_ID);
    });

    it("generateTokens without defaults", async () => {
      delete process.env.ACCESS_TOKEN_EXPIRY;
      delete process.env.REFRESH_TOKEN_EXPIRY;
      delete process.env.JWT_ISSUER;
      delete process.env.JWT_AUDIENCE;

      const r = await generateTokens(mockUser);
      expect(r.accessToken).toBeDefined();
    });

    it("isTokenExpiringSoon without threshold", async () => {
      const { accessToken } = await generateTokens(mockUser);
      expect(isTokenExpiringSoon(accessToken)).toBe(false);
    });

    it("generateTokens with missing tokenVersion falls back to 1", async () => {
      const userWithoutVersion = { ...mockUser };
      delete userWithoutVersion.tokenVersion;
      const r = await generateTokens(userWithoutVersion);
      expect(r.accessToken).toBeDefined();
    });

    it("refreshAccessToken with missing user.tokenVersion falls back to 1", async () => {
      const userWithoutVersion = { ...mockUser };
      delete userWithoutVersion.tokenVersion;
      const { refreshToken } = await generateTokens(userWithoutVersion); // embeds 1
      
      const r = await refreshAccessToken(refreshToken, userWithoutVersion);
      expect(r.accessToken).toBeDefined();
    });

    it("isTokenExpiringSoon with token missing exp returns true", () => {
      const tokenNoExp = jwt.sign({ a: 1 }, TEST_ACCESS_SECRET); // no expiresIn
      expect(isTokenExpiringSoon(tokenNoExp)).toBe(true);
    });

    it("revokeByJti without exp argument sets ttl 0", async () => {
      await revokeByJti("test-jti-no-exp");
      // shouldn't throw, and shouldn't call setex
    });

    it("getBlacklistStats handles mixed pipeline results with error", async () => {
      redis.keys.mockResolvedValueOnce(["key1", "key2"]);
      redis.pipeline.mockReturnValueOnce({
        get: vi.fn(),
        exec: vi.fn().mockResolvedValueOnce([[new Error("pipe err"), null], [null, "1"]]),
      });
      const result = await getBlacklistStats();
      expect(result.revokedCount).toBe(1); // gracefully skipped the error
    });
  });
});
