// backend/use-cases/auth/verify-email.use-case.js

import crypto from "crypto";
import User from "../../model/User.js";
import logger from "../../utilities/general/logger.js";

/**
 * Verify Email Use Case — Pure business logic, no req/res.
 *
 * Hashes the incoming token and looks up the user by the hashed value.
 * Supports distinct error codes for expired (410), already verified (409),
 * and invalid (400) tokens per the auth-api contract.
 *
 * @param {Object} dto
 * @param {string} dto.token - Raw verification token from the email link
 * @returns {Object} { success, statusCode, errorCode?, message, data? }
 */
export async function verifyEmailUseCase({ token }) {
  // Input validation
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return {
      success: false,
      statusCode: 400,
      message: "Verification token is required",
      errorCode: "MISSING_VERIFICATION_TOKEN",
    };
  }

  try {
    // Hash the incoming token to match the stored hashed value
    const hashedToken = crypto
      .createHash("sha256")
      .update(token.trim())
      .digest("hex");

    // First, check if a user exists with this token at all (regardless of expiry/status)
    const user = await User.findOne({
      verificationToken: hashedToken,
    }).select("+verificationToken +verificationTokenExpiresAt");

    if (!user) {
      // Could be an already-verified user (token was cleared) — check generically
      logger.warn(
        { token: token.substring(0, 8) + "..." },
        "Failed email verification attempt — token not found"
      );

      return {
        success: false,
        statusCode: 400,
        message: "Invalid or already used verification token",
        errorCode: "INVALID_VERIFICATION_TOKEN",
      };
    }

    // Already verified (token already consumed)
    if (user.isVerified) {
      return {
        success: false,
        statusCode: 409,
        message: "Email has already been verified.",
        errorCode: "ALREADY_VERIFIED",
      };
    }

    // Token expired
    if (user.verificationTokenExpiresAt < new Date()) {
      return {
        success: false,
        statusCode: 410,
        message:
          "Verification token has expired. Please request a new verification email.",
        errorCode: "VERIFICATION_TOKEN_EXPIRED",
      };
    }

    // Success — verify the user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    user.lastSecurityEvent = new Date();
    await user.save();

    logger.info({ email: user.email }, "Email verified successfully");

    return {
      success: true,
      statusCode: 200,
      message: "Email verified successfully. You can now log in.",
    };
  } catch (error) {
    logger.error({ err: error }, "Email verification use-case error");

    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return {
        success: false,
        statusCode: 503,
        message: "Service temporarily unavailable. Please try again.",
        errorCode: "DATABASE_ERROR",
      };
    }

    return {
      success: false,
      statusCode: 500,
      message: "Email verification failed due to unexpected error",
      errorCode: "VERIFICATION_FAILED",
    };
  }
}
