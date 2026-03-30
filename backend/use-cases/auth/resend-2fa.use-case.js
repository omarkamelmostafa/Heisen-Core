import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../../model/User.js";
import { generateVerificationCode } from "../../utilities/auth/crypto-utils.js";
import emailService from "../../services/email/email.service.js";
import logger from "../../utilities/general/logger.js";

export async function resend2faUseCase({ tempToken }) {
  try {
    // 1. Verify tempToken
    let decoded;
    try {
      decoded = jwt.verify(tempToken, process.env.ACCESS_TOKEN_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return {
          success: false,
          statusCode: 400,
          message: "Verification session has expired. Please log in again.",
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

    // 3. Find user
    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        statusCode: 400,
        message: "Verification failed. Please log in again.",
        errorCode: "TWO_FACTOR_SESSION_INVALID",
      };
    }

    // 4. Verify 2FA is still enabled
    if (!user.twoFactorEnabled) {
      return {
        success: false,
        statusCode: 400,
        message: "Two-factor authentication is not enabled.",
        errorCode: "TWO_FACTOR_NOT_ENABLED",
      };
    }

    // 5. Generate new OTP
    const otpCode = generateVerificationCode();
    const hashedCode = crypto.createHash("sha256").update(otpCode).digest("hex");

    // 6. Store new OTP and reset expiry
    user.twoFactorCode = hashedCode;
    user.twoFactorExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    // 7. Send email
    await emailService.send2faCodeEmail(user, otpCode);

    logger.info({ userId }, "2FA code resent successfully");

    return {
      success: true,
      statusCode: 200,
      message: "A new verification code has been sent to your email.",
    };
  } catch (error) {
    logger.error({ err: error }, "Resend 2FA code error");

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
      message: "Failed to resend verification code",
      errorCode: "RESEND_2FA_FAILED",
    };
  }
}
