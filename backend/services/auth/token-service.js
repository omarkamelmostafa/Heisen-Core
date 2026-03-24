// backend/services/auth/token-service.js
// Centralized token management service for JWT operations and token blacklisting.
// Refresh tokens are now DB-backed via the RefreshToken model for multi-device
// session support, rotation chains, and reuse detection.

import jwt from "jsonwebtoken";
import crypto from "crypto";
import redis from "../../config/redis.js";
import RefreshToken from "../../model/RefreshToken.js";
import logger from "../../utilities/general/logger.js";

// ==================== TOKEN GENERATION ====================

/**
 * Generate unique JWT ID for tracking and revocation.
 */
const generateJwtId = () => crypto.randomBytes(16).toString("hex");

/**
 * Hash a raw token value using SHA-256 for secure storage.
 * @param {string} rawToken - The unhashed token value
 * @returns {string} SHA-256 hex digest
 */
export const hashToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");

/**
 * Generate an access token + a new RefreshToken document in the database.
 *
 * The raw (unhashed) refresh token value is returned so the controller can set
 * it in the HttpOnly cookie. Only the hash is persisted in MongoDB.
 *
 * @param {Object} user - Mongoose user document (must have _id, email, uuid, tokenVersion)
 * @param {string} userAgent - User-Agent header from the request
 * @param {string} ipAddress - Client IP address
 * @returns {{ accessToken: string, refreshTokenValue: string, accessTokenExpiresIn: string }}
 */
export const generateTokens = async (user, userAgent = "", ipAddress = "", rememberMe = false) => {
  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "15m";
  const userId = user._id.toString();

  // ── Access Token (JWT) ──
  const accessToken = jwt.sign(
    {
      UserInfo: {
        userId,
        email: user.email,
        uuid: user.uuid,
        type: "access",
      },
      iss: process.env.JWT_ISSUER || "new-starter-backend-v1",
      aud: process.env.JWT_AUDIENCE || "new-starter-web-client",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: accessTokenExpiry,
      jwtid: generateJwtId(),
    }
  );

  // ── Refresh Token (opaque, DB-backed) ──
  const rawRefreshToken = crypto.randomBytes(40).toString("hex");
  const hashedRefreshToken = hashToken(rawRefreshToken);

  const expiresAt = rememberMe
    ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  await RefreshToken.create({
    token: hashedRefreshToken,
    user: user._id,
    rememberMe: rememberMe,
    expiresAt: expiresAt,
    userAgent,
    ipAddress,
    tokenVersion: user.tokenVersion || 1,
  });

  return {
    accessToken,
    refreshTokenValue: rawRefreshToken,
    accessTokenExpiresIn: accessTokenExpiry,
  };
};

// ==================== TOKEN VERIFICATION ====================

/**
 * Safely verify or decode a JWT.
 * Returns decoded payload, or null if completely malformed.
 */
export const safeVerifyOrDecode = (token, secret, options = {}) => {
  try {
    return jwt.verify(token, secret, options);
  } catch {
    return jwt.decode(token);
  }
};

// ==================== TOKEN REFRESH (ROTATION + REUSE DETECTION) ====================

/**
 * Refresh an access token using a valid refresh token cookie value.
 *
 * Implements rotation: old token is revoked and linked to the new one via `replacedBy`.
 * Implements reuse detection: if a revoked+replaced token is presented, ALL tokens
 * for the user are revoked (nuclear option — theft assumed).
 *
 * @param {string} rawRefreshToken - The unhashed refresh token from the cookie
 * @param {string} userAgent - User-Agent header from the request
 * @param {string} ipAddress - Client IP address
 * @returns {{ accessToken: string, refreshTokenValue: string, accessTokenExpiresIn: string, user: Object }}
 */
export const refreshAccessToken = async (rawRefreshToken, userAgent = "", ipAddress = "") => {
  const hashedToken = hashToken(rawRefreshToken);

  // Look up the RefreshToken document by hashed value
  const tokenDoc = await RefreshToken.findOne({ token: hashedToken }).populate("user");

  if (!tokenDoc) {
    throw new Error("Invalid refresh token.");
  }

  // ── Reuse Detection ──
  // If the token is already revoked AND has a replacement, this is a reuse attempt.
  // An attacker is replaying a stolen token after the legitimate user rotated it.
  if (tokenDoc.isRevoked) {
    if (tokenDoc.replacedBy) {
      // NUCLEAR: revoke ALL tokens for this user
      await RefreshToken.updateMany(
        { user: tokenDoc.user._id },
        { isRevoked: true }
      );
      logger.warn(
        { userId: tokenDoc.user._id, ip: ipAddress },
        "Refresh token reuse detected — all sessions revoked"
      );
      throw new Error("Token reuse detected. All sessions have been invalidated.");
    }
    throw new Error("Refresh token has been revoked.");
  }

  // ── Expiry Check ──
  if (tokenDoc.expiresAt < new Date()) {
    tokenDoc.isRevoked = true;
    await tokenDoc.save();
    throw new Error("Refresh token expired.");
  }

  // ── Token Version Check ──
  // If user's tokenVersion was incremented (e.g. "logout all", password change),
  // all previously-issued tokens are stale.
  const user = tokenDoc.user;
  // Need to fetch tokenVersion which is select: false
  const userWithVersion = await (await import("../../model/User.js")).default
    .findById(user._id)
    .select("+tokenVersion");

  if (!userWithVersion) {
    throw new Error("User not found.");
  }

  if (tokenDoc.tokenVersion !== (userWithVersion.tokenVersion || 1)) {
    tokenDoc.isRevoked = true;
    await tokenDoc.save();
    throw new Error("Session expired. Please login again.");
  }

  // ── Rotation: issue new tokens ──
  const { accessToken, refreshTokenValue, accessTokenExpiresIn } =
    await generateTokens(userWithVersion, userAgent, ipAddress, tokenDoc.rememberMe);

  // Mark the old token as revoked and point to the new one
  const newTokenDoc = await RefreshToken.findOne({
    token: hashToken(refreshTokenValue),
  });

  tokenDoc.isRevoked = true;
  tokenDoc.replacedBy = newTokenDoc._id;
  await tokenDoc.save();

  return {
    accessToken,
    refreshTokenValue,
    accessTokenExpiresIn,
    user: userWithVersion,
    rememberMe: tokenDoc.rememberMe ?? false,
  };
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
    logger.warn({ err: error }, "Redis blacklist check unavailable");
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
    const revokedPercentage = (revokedCount / totalTokens) * 100;

    return {
      connected: true,
      revokedCount,
      totalTokens,
      revokedPercentage: revokedPercentage.toFixed(2),
    };
  } catch (error) {
    logger.error({ err: error }, "Redis error in getBlacklistStats");
    return {
      connected: false,
      error: error.message,
      revokedCount: 0,
      totalTokens: 0,
      revokedPercentage: 0,
    };
  }
};

export const generate2faTempToken = (userId) => {
  return jwt.sign(
    {
      UserInfo: {
        userId,
        type: "2fa",
      },
      iss: process.env.JWT_ISSUER || "new-starter-backend-v1",
      aud: process.env.JWT_AUDIENCE || "new-starter-web-client",
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "10m",
    }
  );
}; 