import User from "../../model/User.js";
import jwt from "jsonwebtoken";
import { refreshAccessToken } from "../../utilities/auth/token-utils.js";
import { clearCookie, setCookie } from "../../utilities/general/cookie-utils.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import { emitLogMessage } from "../../utilities/general/emit-log.js";
import { REFRESH_TOKEN_COOKIE_NAME } from "./auth-shared.js";

export const handleRefreshToken = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  if (!refreshToken) {
    return apiResponseManager(req, res, {
      statusCode: 401,
      success: false,
      message: "Refresh token required",
      errorCode: "MISSING_REFRESH_TOKEN",
    });
  }

  try {
    // Verify and decode refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    // Find user by ID
    const user = await User.findById(decoded.userId).select(
      "+refreshToken +tokenVersion"
    );

    if (!user) {
      clearCookie(res, REFRESH_TOKEN_COOKIE_NAME);
      return apiResponseManager(req, res, {
        statusCode: 401,
        success: false,
        message: "User not found",
        errorCode: "USER_NOT_FOUND",
      });
    }

    // Check token version (critical security fix)
    if (decoded.tokenVersion !== user.tokenVersion) {
      clearCookie(res, REFRESH_TOKEN_COOKIE_NAME);
      user.refreshToken = null;
      await user.save();

      return apiResponseManager(req, res, {
        statusCode: 401,
        success: false,
        message: "Session expired. Please login again.",
        errorCode: "TOKEN_VERSION_MISMATCH",
      });
    }

    // Check if stored refresh token matches (prevent token reuse)
    if (user.refreshToken !== refreshToken) {
      clearCookie(res, REFRESH_TOKEN_COOKIE_NAME);
      user.refreshToken = null;
      await user.save();

      // Log security event
      emitLogMessage(
        `Token reuse detected for user ${user._id} from IP ${req.ip}`,
        "info"
      );

      return apiResponseManager(req, res, {
        statusCode: 401,
        success: false,
        message: "Security alert: Invalid session detected.",
        errorCode: "TOKEN_REUSE_DETECTED",
      });
    }

    // Generate new tokens
    const {
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresIn,
    } = await refreshAccessToken(refreshToken, user);

    // Update refresh token in database (rotation)
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token cookie with enhanced security
    setCookie(res, REFRESH_TOKEN_COOKIE_NAME, newRefreshToken, {
      maxAge: process.env.REFRESH_TOKEN_COOKIE_MAX_AGE || 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh", // Limit cookie scope
    });

    return apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken,
        tokenType: "Bearer",
        expiresIn: accessTokenExpiresIn,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    clearCookie(res, REFRESH_TOKEN_COOKIE_NAME);

    // Enhanced error handling
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

    return apiResponseManager(req, res, {
      statusCode: 401,
      success: false,
      ...errorConfig,
    });
  }
};
