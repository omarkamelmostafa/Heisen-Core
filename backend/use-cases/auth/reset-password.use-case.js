// backend/use-cases/auth/reset-password.use-case.js

import crypto from "crypto";
import User from "../../model/User.js";
import RefreshToken from "../../model/RefreshToken.js";
import { hashPassword, comparePassword } from "../../utilities/auth/hash-utils.js";
import logger from "../../utilities/general/logger.js";
import { EmailService } from "../../services/email/email.service.js";

const emailService = new EmailService();

/**
 * Reset Password Use Case — Pure business logic, no req/res.
 *
 * Validates the reset token, updates the password, increments tokenVersion,
 * and revokes ALL RefreshToken documents for the user (FR-022).
 *
 * @param {Object} dto
 * @param {string} dto.token    - Raw reset token from URL
 * @param {string} dto.password - New password
 * @returns {Object} { success, statusCode, errorCode?, message }
 */
export async function resetPasswordUseCase({ token, password }) {
  try {
    // Input validation
    if (!token || typeof token !== "string" || token.length < 20) {
      return {
        success: false,
        statusCode: 400,
        message: "Valid reset token is required",
        errorCode: "INVALID_RESET_TOKEN",
      };
    }

    if (!password || typeof password !== "string") {
      return {
        success: false,
        statusCode: 400,
        message: "New password is required",
        errorCode: "MISSING_PASSWORD",
      };
    }

    // Hash token to match stored value
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
      isActive: true,
    }).select("+password +tokenVersion");

    if (!user) {
      logger.warn(
        { token: token.substring(0, 16) + "..." },
        "Invalid password reset token attempt"
      );

      return {
        success: false,
        statusCode: 400,
        message: "Invalid, expired, or already used reset token",
        errorCode: "INVALID_RESET_TOKEN",
      };
    }

    // Prevent reuse of same password
    const isSamePassword = await comparePassword(password, user.password);
    if (isSamePassword) {
      return {
        success: false,
        statusCode: 400,
        message: "New password cannot be the same as your current password",
        errorCode: "PASSWORD_SAME_AS_CURRENT",
      };
    }

    // Update password + security fields
    user.password = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;
    user.tokenVersion += 1; // Invalidates all refresh tokens on next check
    user.lastPasswordChange = new Date();
    user.lastSecurityEvent = new Date();

    await user.save();

    // Revoke ALL RefreshToken documents for this user (FR-022)
    const revokeResult = await RefreshToken.updateMany(
      { user: user._id, isRevoked: false },
      { isRevoked: true }
    );

    logger.info(
      { email: user.email, revokedSessions: revokeResult.modifiedCount },
      "Password reset completed — all sessions revoked"
    );

    // Queue success email (non-blocking)
    setImmediate(async () => {
      try {
        await emailService.sendResetSuccessEmail(user);
        logger.info({ email: user.email }, "Password reset success email sent");
      } catch (emailError) {
        logger.error(
          { err: emailError, email: user.email },
          "Failed to send password reset success email"
        );
      }
    });

    return {
      success: true,
      statusCode: 200,
      message:
        "Password reset successful. Please log in with your new password.",
    };
  } catch (error) {
    logger.error({ err: error }, "Reset password use-case error");

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
      message: "Password reset failed due to unexpected error",
      errorCode: "RESET_FAILED",
    };
  }
}
