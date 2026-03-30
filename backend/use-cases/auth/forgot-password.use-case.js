// backend/use-cases/auth/forgot-password.use-case.js

import crypto from "crypto";
import { generateResetToken } from "../../utilities/auth/crypto-utils.js";
import User from "../../model/User.js";
import logger from "../../utilities/general/logger.js";
import { EmailService } from "../../services/email/email.service.js";

const emailService = new EmailService();

/**
 * Forgot Password Use Case — Pure business logic, no req/res.
 *
 * Security: Always returns the same response whether the email exists or not (FR-020).
 *
 * @param {Object} dto
 * @param {string} dto.email
 * @param {string} dto.clientIP - For logging
 * @param {string} dto.origin - Frontend origin URL
 * @returns {Object} { success, statusCode, message }
 */
export async function forgotPasswordUseCase({ email, clientIP, origin }) {
  const successResponse = {
    success: true,
    statusCode: 200,
    message:
      "If an account exists for this email, a password reset link has been sent.",
  };

  try {
    // Input validation
    if (!email || typeof email !== "string") {
      return {
        success: false,
        statusCode: 400,
        message: "Valid email is required",
        errorCode: "INVALID_EMAIL",
      };
    }

    // Find user (security: always return same response)
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    });

    if (!user) {
      logger.warn(
        { email, ip: clientIP },
        "Password reset attempt for non-existent email"
      );
      return successResponse;
    }

    // Generate reset token — store hashed, send raw in email URL
    const resetToken = generateResetToken();
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    user.lastSecurityEvent = new Date();
    await user.save();

    // Queue email (non-blocking)
    setImmediate(async () => {
      try {
        const baseUrl = origin || (process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',')[0] : "http://localhost:3000");
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&id=${user._id}`;
        await emailService.sendPasswordResetEmail(user, resetUrl);
        logger.info({ email: user.email }, "Password reset email sent");
      } catch (emailError) {
        logger.error(
          { err: emailError, email: user.email },
          "Failed to send password reset email"
        );
      }
    });

    logger.info(
      { email: user.email, ip: clientIP },
      "Password reset initiated"
    );
    return successResponse;
  } catch (error) {
    logger.error({ err: error }, "Forgot password use-case error");
    // Security: always return same response to prevent enumeration
    return successResponse;
  }
}
