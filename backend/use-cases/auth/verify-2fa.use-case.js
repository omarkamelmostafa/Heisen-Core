import jwt from "jsonwebtoken";
import User from "../../model/User.js";
import { hashToken, generateTokens } from "../../services/auth/token-service.js";
import { sanitizeUserForResponse } from "../../utilities/auth/user-data-utils.js";
import logger from "../../utilities/general/logger.js";

export async function verify2faUseCase({ token, tempToken, userAgent, ipAddress }) {
  try {
    // 1. Verify temp token
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return {
          success: false,
          statusCode: 400,
          message: "Verification session has expired. Please log in again to receive a new code.",
          errorCode: "TWO_FACTOR_SESSION_EXPIRED",
        };
      }
      return {
        success: false,
        statusCode: 400,
        message: "Invalid verification session. Please log in again.",
        errorCode: "TWO_FACTOR_SESSION_INVALID",
      };
    }

    // 2. Validate token type
    if (!decoded.UserInfo || decoded.UserInfo.type !== "2fa") {
      return {
        success: false,
        statusCode: 400,
        message: "Invalid verification session. Please log in again.",
        errorCode: "TWO_FACTOR_SESSION_INVALID",
      };
    }

    const userId = decoded.UserInfo.userId;

    // 3. Find user with 2FA fields
    const user = await User.findById(userId).select(
      "+twoFactorCode +twoFactorExpiry +password +tokenVersion"
    );

    if (!user) {
      return {
        success: false,
        statusCode: 400,
        message: "Verification failed. Please log in again.",
        errorCode: "TWO_FACTOR_SESSION_INVALID",
      };
    }

    // 4. Check OTP expiry
    if (!user.twoFactorCode || !user.twoFactorExpiry || user.twoFactorExpiry < new Date()) {
      return {
        success: false,
        statusCode: 400,
        message: "Verification code has expired. Please login again.",
        errorCode: "TWO_FACTOR_EXPIRED",
      };
    }

    // 5. Compare OTP
    const hashedToken = hashToken(token);
    if (hashedToken !== user.twoFactorCode) {
      return {
        success: false,
        statusCode: 400,
        message: "Invalid verification code",
        errorCode: "TWO_FACTOR_INVALID",
      };
    }

    // 6. Clear 2FA fields
    user.twoFactorCode = undefined;
    user.twoFactorExpiry = undefined;
    await user.save();

    // 7. Generate full auth tokens (identical to normal login)
    const { accessToken, refreshTokenValue, accessTokenExpiresIn } =
      await generateTokens(user, userAgent, ipAddress, false);

    const safeUser = sanitizeUserForResponse(user);

    logger.info({ userId }, "2FA verification successful");

    return {
      success: true,
      statusCode: 200,
      message: "Login successful",
      data: {
        user: safeUser,
        accessToken,
        refreshTokenValue,
        expiresIn: accessTokenExpiresIn,
      },
    };
  } catch (error) {
    logger.error({ err: error }, "2FA verification error");

    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return {
        success: false,
        statusCode: 503,
        message: "Service temporarily unavailable",
        errorCode: "DATABASE_ERROR",
      };
    }

    return {
      success: false,
      statusCode: 500,
      message: "Verification failed",
      errorCode: "TWO_FACTOR_VERIFICATION_FAILED",
    };
  }
}
