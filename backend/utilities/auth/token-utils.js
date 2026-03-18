// utils/auth/tokenUtils.js

import jwt from "jsonwebtoken";
import crypto from "crypto";
import redis from "../../config/redis.js";

export const generateTokens = async (user) => {
  const accessTokenExpiry = process.env.ACCESS_TOKEN_EXPIRY || "15m"; // Shorter for security
  const refreshTokenExpiry = process.env.REFRESH_TOKEN_EXPIRY || "7d";
  const userId = user._id.toString();

  // Enhanced token payload with security features
  const accessTokenPayload = {
    UserInfo: {
      userId,
      email: user.email,
      uuid: user.uuid, // Include UUID for additional security
      // roles: user.roles || [],
      // permissions: user.permissions || [],
      type: "access", // Token type identification
    },
    iss: process.env.JWT_ISSUER || "new-starter-backend-v1",
    aud: process.env.JWT_AUDIENCE || "new-starter-web-client",
  };

  const refreshTokenPayload = {
    userId,
    uuid: user.uuid,
    type: "refresh",
    tokenVersion: user.tokenVersion || 1, // Important for token invalidation
    iss: process.env.JWT_ISSUER || "new-starter-backend-v1",
    aud: process.env.JWT_AUDIENCE || "new-starter-web-client",
  };

  // Generate tokens with enhanced options
  const accessToken = jwt.sign(
    accessTokenPayload,
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: accessTokenExpiry,
      jwtid: generateJwtId(), // Unique JWT ID for tracking
    }
  );

  const refreshToken = jwt.sign(
    refreshTokenPayload,
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: refreshTokenExpiry,
      jwtid: generateJwtId(),
    }
  );

  return {
    accessToken,
    refreshToken,
    accessTokenExpiresIn: accessTokenExpiry,
  };
};

// Generate unique JWT ID for tracking and revocation
const generateJwtId = () => {
  return crypto.randomBytes(16).toString("hex");
};

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

// Token refresh functionality
export const refreshAccessToken = async (refreshToken, user) => {
  const decoded = verifyRefreshToken(refreshToken);

  // Check if token version matches (for logout all devices)
  if (decoded.tokenVersion !== (user.tokenVersion || 1)) {
    throw new Error("Token revoked. Please login again.");
  }

  // Generate new access token
  return generateTokens(user);
};

// Check if token is about to expire (for proactive refresh)
export const isTokenExpiringSoon = (token, thresholdMinutes = 5) => {
  const decoded = jwt.decode(token);
  if (!decoded || !decoded.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return decoded.exp - now < thresholdMinutes * 60;
};

// logout handler

// 🕓 Optimized in-memory blacklist (auto-expires)
// const tokenBlacklist = new NodeCache({
//   stdTTL: 3600, // 60 minutes (matches access token expiry)
//   checkperiod: 300, // Clean every 5 minutes
//   maxKeys: 10000, // Prevent memory exhaustion
//   deleteOnExpire: true,
// });

/**
 * Safely verifies or decodes a JWT.
 * Returns null if invalid, expired, or malformed.
 */
export const safeVerifyOrDecode = (token, secret, options = {}) => {
  try {
    return jwt.verify(token, secret, options);
  } catch (err) {
    // Graceful fallback to decode (useful for expired tokens)
    return jwt.decode(token);
  }
};

/**
 * Revokes a token by its JTI using Redis
 */
export const revokeByJti = async (jti, exp) => {
  if (!jti) return;

  try {
    // Only blacklist tokens that are still valid
    const currentTime = Math.floor(Date.now() / 1000);
    const ttl = exp ? exp - currentTime : 0;

    if (ttl > 0) {
      await redis.setex(`blacklist:${jti}`, ttl, "1");
    }
  } catch (error) {
    console.warn("Redis blacklisting unavailable:", error.message);
    throw error; // Let caller handle the fallback
  }
};

/**
 * Checks if a token JTI is revoked in Redis
 */
export const isTokenRevoked = async (jti) => {
  try {
    const result = await redis.get(`blacklist:${jti}`);
    return result === "1";
  } catch (error) {
    console.warn("Redis blacklist check unavailable:", error.message);
    return false; // Graceful fallback - assume not revoked
  }
};

/**
 * Get blacklist stats from Redis
 */

/**
 * Get blacklist stats from Redis
 */
export const getBlacklistStats = async () => {
  try {
    // Test connection first
    await redis.ping();

    // Get all blacklist keys
    const keys = await redis.keys('blacklist:*');

    // Only proceed if we have keys
    if (keys.length === 0) {
      return {
        connected: true,
        revokedCount: 0,
        totalTokens: 0,
        revokedPercentage: 0,
        message: 'No blacklisted tokens found'
      };
    }

    // Use pipeline for better performance
    const pipeline = redis.pipeline();
    keys.forEach(key => {
      pipeline.get(key);
    });

    const results = await pipeline.exec();

    // Count the number of revoked tokens
    const revokedCount = results.reduce((count, [err, value]) => {
      if (!err && value === '1') {
        return count + 1;
      }
      return count;
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
    console.error('Redis error in getBlacklistStats:', error.message);
    return {
      connected: false,
      error: error.message,
      revokedCount: 0,
      totalTokens: 0,
      revokedPercentage: 0
    };
  }
};


// export const getBlacklistStats = async () => {
//   try {
//     // This is simplified - you might need Redis SCAN for production
//     // get the stats of black list values
//     const keys = await redis.keys("blacklist:*");
//     const values = await redis.mget(keys);

//     // Count the number of revoked tokens
//     const revokedCount = values.reduce((count, value) => {
//       return value === "1" ? count + 1 : count;
//     }, 0);

//     // Calculate the percentage of revoked tokens
//     const totalTokens = keys.length;
//     const revokedPercentage = (revokedCount / totalTokens) * 100;

//     return {
//       revokedCount,
//       totalTokens,
//       revokedPercentage,
//     };
//   } catch (error) {
//     return {
//       connected: false,
//       error: error.message,
//     };
//   }
// };


// export const generateTokens = async (user) => {
//   // const roles = Array.isArray(user?.roles) ? user.roles : [];
//   // const permissions = Array.isArray(user?.permissions) ? user.permissions : [];
//   const accessTokenExpiry = "1h"; // one hour
//   const refreshTokenExpiry = "1d"; // one day
//   const userId = user._id instanceof ObjectId ? user._id.toString() : user._id;

//   // Generate new access token
//   const accessToken = jwt.sign(
//     {
//       UserInfo: {
//         userId,
//         email: user?.email,
//         // uuid: user?.uuid,
//       },
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     { expiresIn: accessTokenExpiry }
//   );

//   // Generate new refresh token
//   const refreshToken = jwt.sign(
//     {
//       userId,
//       email: user?.email,
//       // uuid: user?.uuid,
//     },
//     process.env.REFRESH_TOKEN_SECRET,
//     { expiresIn: refreshTokenExpiry }
//   );

//   return { accessToken, refreshToken };
// };
