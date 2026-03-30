// backend/use-cases/auth/logout.use-case.js

import User from "../../model/User.js";
import {
  safeVerifyOrDecode,
  revokeByJti,
} from "../../services/auth/token-service.js";
import logger from "../../utilities/general/logger.js";

/**
 * Logout Use Case — Pure business logic, no req/res.
 *
 * @param {Object} dto
 * @param {string|null} dto.refreshToken - From cookie
 * @param {string|null} dto.accessToken  - From Authorization header
 * @param {boolean}     dto.logoutAll    - Whether to invalidate all sessions
 * @returns {Object} { success, statusCode, message }
 */
export async function logoutUseCase({ refreshToken, accessToken, logoutAll = false }) {
  try {
    let decodedRefresh = null;

    // 1. Process refresh token — blacklist in Redis
    if (refreshToken) {
      decodedRefresh = safeVerifyOrDecode(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        {
          issuer: process.env.JWT_ISSUER,
          audience: process.env.JWT_AUDIENCE,
        }
      );

      if (decodedRefresh?.jti && decodedRefresh.exp > Date.now() / 1000) {
        try {
          await revokeByJti(decodedRefresh.jti, decodedRefresh.exp);
        } catch (redisError) {
          logger.warn(
            { err: redisError, jti: decodedRefresh.jti },
            "Redis unavailable for blacklisting refresh token"
          );
        }
      }
    }

    // 2. Process access token — blacklist in Redis
    if (accessToken) {
      const decodedAccess = safeVerifyOrDecode(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        {
          issuer: process.env.JWT_ISSUER,
          audience: process.env.JWT_AUDIENCE,
        }
      );

      if (decodedAccess?.jti && decodedAccess.exp > Date.now() / 1000) {
        try {
          await revokeByJti(decodedAccess.jti, decodedAccess.exp);
        } catch (redisError) {
          logger.warn(
            { err: redisError, jti: decodedAccess.jti },
            "Redis unavailable for blacklisting access token"
          );
        }
      }
    }

    // 3. Invalidate database tokens
    if (decodedRefresh?.userId) {
      const userId = decodedRefresh.userId;

      if (logoutAll) {
        await User.findByIdAndUpdate(userId, {
          $inc: { tokenVersion: 1 },
          $unset: { refreshToken: "" },
        }).exec();
      } else if (refreshToken) {
        await User.findOneAndUpdate(
          { _id: userId, refreshToken: refreshToken },
          { $unset: { refreshToken: "" } }
        ).exec();
      }
    }

    return {
      success: true,
      statusCode: 200,
      message: "Logged out successfully",
    };
  } catch (error) {
    logger.error({ err: error }, "Logout use-case error");

    // Logout should always succeed from user perspective
    return {
      success: true,
      statusCode: 200,
      message: "Logged out successfully",
    };
  }
}
