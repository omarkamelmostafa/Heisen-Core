// backend/use-cases/auth/refresh-token.use-case.js

import { refreshAccessToken } from "../../services/auth/token-service.js";
import logger from "../../utilities/general/logger.js";

/**
 * Refresh Token Use Case — Pure business logic, no req/res.
 *
 * Delegates rotation + reuse detection to the token service.
 * Returns the new raw refresh token for the controller to set as a cookie.
 *
 * @param {Object} dto
 * @param {string|null} dto.refreshToken - Raw token from cookie
 * @param {string}      dto.userAgent    - User-Agent header
 * @param {string}      dto.ipAddress    - Client IP
 * @returns {Object} { success, statusCode, errorCode?, message, data?, clearCookie? }
 */
export async function refreshTokenUseCase({ refreshToken, userAgent, ipAddress }) {
  if (!refreshToken) {
    return {
      success: false,
      statusCode: 401,
      message: "Refresh token required",
      errorCode: "MISSING_REFRESH_TOKEN",
    };
  }

  try {
    const { accessToken, refreshTokenValue, accessTokenExpiresIn } =
      await refreshAccessToken(refreshToken, userAgent, ipAddress);

    logger.info({ ip: ipAddress }, "Token refreshed successfully");

    return {
      success: true,
      statusCode: 200,
      message: "Token refreshed successfully",
      data: {
        accessToken,
        newRefreshToken: refreshTokenValue,
        tokenType: "Bearer",
        expiresIn: accessTokenExpiresIn,
      },
    };
  } catch (error) {
    logger.warn({ err: error, ip: ipAddress }, "Refresh token use-case error");

    // Determine specific error type
    const isReuse = error.message.includes("reuse detected");
    const isRevoked = error.message.includes("revoked");
    const isExpired = error.message.includes("expired");
    const isVersionMismatch = error.message.includes("Session expired");

    let errorCode = "SESSION_INVALID";
    if (isReuse) errorCode = "TOKEN_REUSE_DETECTED";
    else if (isRevoked) errorCode = "TOKEN_REVOKED";
    else if (isExpired) errorCode = "REFRESH_TOKEN_EXPIRED";
    else if (isVersionMismatch) errorCode = "TOKEN_VERSION_MISMATCH";

    return {
      success: false,
      statusCode: 401,
      message: error.message || "Session invalid. Please login again.",
      errorCode,
      clearCookie: true,
    };
  }
}
