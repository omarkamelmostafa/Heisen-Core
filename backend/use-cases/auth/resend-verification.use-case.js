// backend/use-cases/auth/resend-verification.use-case.js

import crypto from "crypto";
import { generateVerificationCode } from "../../utilities/auth/crypto-utils.js";
import User from "../../model/User.js";
import logger from "../../utilities/general/logger.js";
import { EmailService } from "../../services/email/email.service.js";

const emailService = new EmailService();

/**
 * Resend Verification Email Use Case — Pure business logic, no req/res.
 *
 * If user exists and is not yet verified, generate a new token and send email.
 * Always returns the same response to prevent account enumeration (FR-008).
 *
 * @param {Object} dto
 * @param {string} dto.email
 * @returns {Object} { success, statusCode, message }
 */
export async function resendVerificationUseCase({ email }) {
  const successResponse = {
    success: true,
    statusCode: 200,
    message:
      "If an unverified account exists for this email, a new verification link has been sent.",
  };

  try {
    if (!email || typeof email !== "string") {
      return {
        success: false,
        statusCode: 400,
        message: "Valid email is required",
        errorCode: "INVALID_EMAIL",
      };
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
      isVerified: false,
    });

    if (!user) {
      // Same response to prevent enumeration
      return successResponse;
    }

    // Generate new verification token
    const verificationCode = generateVerificationCode();
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(verificationCode)
      .digest("hex");

    user.verificationToken = hashedVerificationToken;
    user.verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // 24 hours
    await user.save();

    // Send verification email (synchronous)
    try {
      await emailService.sendVerificationEmail(user, verificationCode);
      logger.info({ email: user.email }, "Resent verification email");
    } catch (emailError) {
      logger.error(
        { err: emailError, email: user.email },
        "Failed to resend verification email"
      );
      return {
        success: false,
        statusCode: 500,
        message: "Failed to send verification email. Please try again later.",
        errorCode: "EMAIL_DISPATCH_FAILED",
      };
    }

    return {
      success: true,
      statusCode: 200,
      message: "Verification code sent successfully.",
    };
  } catch (error) {
    logger.error({ err: error }, "Resend verification use-case error");
    return successResponse;
  }
}
