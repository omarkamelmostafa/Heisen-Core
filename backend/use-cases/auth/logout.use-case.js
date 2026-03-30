// backend/use-cases/auth/logout.use-case.js

import RefreshToken from "../../model/RefreshToken.js";
import {
  hashToken,
  safeVerifyOrDecode,
  revokeByJti,
} from "../../services/auth/token-service.js";
import logger from "../../utilities/general/logger.js";

/**
 * Logout Use Case — Single device logout.
 *
 * Revokes the current device's refresh token and blacklists the access token JTI.
 * Returns 204 if no cookie present (idempotent) per contract.
 *
 * @param {Object} dto
 * @param {string|null} dto.refreshToken - Raw refresh token from cookie
 * @param {string|null} dto.accessToken  - From Authorization header
 * @returns {Object} { success, statusCode, message }
 */
export async function logoutUseCase({ refreshToken, accessToken }) {
  try {
    // No cookie = already logged out (idempotent)
    if (!refreshToken) {
      return {
        success: true,
        statusCode: 204,
        message: "No active session.",
      };
    }

    // 1. Revoke the refresh token in the database
    const hashedToken = hashToken(refreshToken);
    const tokenDoc = await RefreshToken.findOneAndUpdate(
      { token: hashedToken, isRevoked: false },
      { isRevoked: true }
    );

    if (tokenDoc) {
      logger.info(
        { userId: tokenDoc.user },
        "Refresh token revoked on logout"
      );
    }

    // 2. Blacklist the access token's JTI in Redis (if provided)
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

    return {
      success: true,
      statusCode: 200,
      message: "Logged out successfully.",
    };
  } catch (error) {
    logger.error({ err: error }, "Logout use-case error");

    // Logout should always succeed from user perspective
    return {
      success: true,
      statusCode: 200,
      message: "Logged out successfully.",
    };
  }
}
