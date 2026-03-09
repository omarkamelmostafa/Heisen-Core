// backend/use-cases/auth/refresh-token.use-case.js

import User from "../../model/User.js";
import jwt from "jsonwebtoken";
import { refreshAccessToken } from "../../services/auth/token-service.js";
import logger from "../../utilities/general/logger.js";

/**
 * Refresh Token Use Case — Pure business logic, no req/res.
 *
 * @param {Object} dto
 * @param {string|null} dto.refreshToken - From cookie
 * @param {string}      dto.clientIP     - For security logging
 * @returns {Object} { success, statusCode, errorCode?, message, data?, clearCookie? }
 */
export async function refreshTokenUseCase({ refreshToken, clientIP }) {
  if (!refreshToken) {
    return {
      success: false,
      statusCode: 401,
      message: "Refresh token required",
      errorCode: "MISSING_REFRESH_TOKEN",
    };
  }

  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    const user = await User.findById(decoded.userId).select(
      "+refreshToken +tokenVersion"
    );

    if (!user) {
      return {
        success: false,
        statusCode: 401,
        message: "User not found",
        errorCode: "USER_NOT_FOUND",
        clearCookie: true,
      };
    }

    // Token version check
    if (decoded.tokenVersion !== user.tokenVersion) {
      user.refreshToken = null;
      await user.save();

      return {
        success: false,
        statusCode: 401,
        message: "Session expired. Please login again.",
        errorCode: "TOKEN_VERSION_MISMATCH",
        clearCookie: true,
      };
    }

    // Token reuse detection
    if (user.refreshToken !== refreshToken) {
      user.refreshToken = null;
      await user.save();

      logger.warn({ userId: user._id, ip: clientIP }, "Token reuse detected");

      return {
        success: false,
        statusCode: 401,
        message: "Security alert: Invalid session detected.",
        errorCode: "TOKEN_REUSE_DETECTED",
        clearCookie: true,
      };
    }

    // Generate new tokens
    const {
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresIn,
    } = await refreshAccessToken(refreshToken, user);

    // Rotate refresh token in DB
    user.refreshToken = newRefreshToken;
    await user.save();

    return {
      success: true,
      statusCode: 200,
      message: "Token refreshed successfully",
      data: {
        accessToken,
        newRefreshToken,
        tokenType: "Bearer",
        expiresIn: accessTokenExpiresIn,
      },
    };
  } catch (error) {
    logger.error({ err: error }, "Refresh token use-case error");

    const errorMap = {
      TokenExpiredError: {
        message: "Refresh token expired",
        errorCode: "REFRESH_TOKEN_EXPIRED",
      },
      JsonWebTokenError: {
        message: "Invalid refresh token",
        errorCode: "INVALID_TOKEN",
      },
      NotBeforeError: {
        message: "Token not yet active",
        errorCode: "TOKEN_NOT_ACTIVE",
      },
    };

    const errorConfig = errorMap[error.name] || {
      message: "Session invalid. Please login again.",
      errorCode: "SESSION_INVALID",
    };

    return {
      success: false,
      statusCode: 401,
      clearCookie: true,
      ...errorConfig,
    };
  }
}
