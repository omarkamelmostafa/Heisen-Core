// backend/services/auth/token-service.js
// Centralized token management service for JWT operations and token blacklisting.

import jwt from "jsonwebtoken";
import crypto from "crypto";
import redis from "../../config/redis.js";

// ==================== TOKEN GENERATION ====================

/**
 * Generate unique JWT ID for tracking and revocation
 */
const generateJwtId = () => crypto.randomBytes(16).toString("hex");

/**
 * Generate access + refresh token pair for a user session.
 */
export const generateTokens = async (user) => {
  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "15m";
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || "1d";
  const userId = user._id.toString();

  const accessToken = jwt.sign(
    {
      UserInfo: {
        userId,
        email: user.email,
        uuid: user.uuid,
        type: "access",
      },
      iss: process.env.JWT_ISSUER || "fantasy-coach-app-backend-v1",
      aud: process.env.JWT_AUDIENCE || "fantasy-coach-app-web-client",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: accessTokenExpiry,
      jwtid: generateJwtId(),
    }
  );

  const refreshToken = jwt.sign(
    {
      userId,
      uuid: user.uuid,
      type: "refresh",
      tokenVersion: user.tokenVersion || 1,
      iss: process.env.JWT_ISSUER || "fantasy-coach-app-backend-v1",
      aud: process.env.JWT_AUDIENCE || "fantasy-coach-app-web-client",
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: refreshTokenExpiry,
      jwtid: generateJwtId(),
    }
  );

  return { accessToken, refreshToken, accessTokenExpiresIn: accessTokenExpiry };
};

// ==================== TOKEN VERIFICATION ====================

/**
 * Verify a refresh token. Throws on failure.
 */
export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });
  } catch (error) {
    throw new Error(`Refresh token invalid: ${error.message}`);
  }
};

/**
 * Safely verify or decode a JWT.
 * Returns decoded payload, or null if completely malformed.
 */
export const safeVerifyOrDecode = (token, secret, options = {}) => {
  try {
    return jwt.verify(token, secret, options);
  } catch {
    try {
      return jwt.decode(token);
    } catch {
      return null;
    }
  }
};

// ==================== TOKEN REFRESH ====================

/**
 * Refresh an access token using a valid refresh token.
 * Validates token version to support "logout all devices" flows.
 */
export const refreshAccessToken = async (refreshToken, user) => {
  const decoded = verifyRefreshToken(refreshToken);

  if (decoded.tokenVersion !== (user.tokenVersion || 1)) {
    throw new Error("Token revoked. Please login again.");
  }

  return generateTokens(user);
};

/**
 * Check if token is about to expire (for proactive refresh).
 */
export const isTokenExpiringSoon = (token, thresholdMinutes = 5) => {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - now < thresholdMinutes * 60;
};

// ==================== TOKEN BLACKLIST (REDIS-BACKED) ====================

/**
 * Revoke a token by its JTI. TTL is set to the remaining token lifetime.
 */
export const revokeByJti = async (jti, exp) => {
  if (!jti) return;

  const currentTime = Math.floor(Date.now() / 1000);
  const ttl = exp ? exp - currentTime : 0;

  if (ttl > 0) {
    await redis.setex(`blacklist:${jti}`, ttl, "1");
  }
};

/**
 * Check if a token JTI has been revoked.
 */
export const isTokenRevoked = async (jti) => {
  try {
    const result = await redis.get(`blacklist:${jti}`);
    return result === "1";
  } catch (error) {
    console.warn("Redis blacklist check unavailable:", error.message);
    return false; // Graceful fallback
  }
};

/**
 * Get blacklist statistics from Redis.
 */
export const getBlacklistStats = async () => {
  try {
    await redis.ping();

    const keys = await redis.keys("blacklist:*");

    if (keys.length === 0) {
      return {
        connected: true,
        revokedCount: 0,
        totalTokens: 0,
        revokedPercentage: 0,
        message: "No blacklisted tokens found",
      };
    }

    const pipeline = redis.pipeline();
    keys.forEach((key) => pipeline.get(key));

    const results = await pipeline.exec();
    const revokedCount = results.reduce((count, [err, value]) => {
      return !err && value === "1" ? count + 1 : count;
    }, 0);

    const totalTokens = keys.length;
    const revokedPercentage =
      totalTokens > 0 ? (revokedCount / totalTokens) * 100 : 0;

    return {
      connected: true,
      revokedCount,
      totalTokens,
      revokedPercentage: revokedPercentage.toFixed(2),
    };
  } catch (error) {
    console.error("Redis error in getBlacklistStats:", error.message);
    return {
      connected: false,
      error: error.message,
      revokedCount: 0,
      totalTokens: 0,
      revokedPercentage: 0,
    };
  }
};
