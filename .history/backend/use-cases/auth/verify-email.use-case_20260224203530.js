// backend/use-cases/auth/verify-email.use-case.js

import User from "../../model/User.js";
import logger from "../../utilities/general/logger.js";

/**
 * Verify Email Use Case — Pure business logic, no req/res.
 *
 * @param {Object} dto
 * @param {string} dto.code - Verification code from user
 * @returns {Object} { success, statusCode, errorCode?, message, data? }
 */
export async function verifyEmailUseCase({ code }) {
  // Input validation
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    return {
      success: false,
      statusCode: 400,
      message: "Verification code is required",
      errorCode: "MISSING_VERIFICATION_CODE",
    };
  }

  try {
    const user = await User.findOne({
      verificationToken: code.trim(),
      verificationTokenExpiresAt: { $gt: new Date() },
      isVerified: false,
    });

    if (!user) {
      logger.warn(
        { code: code.substring(0, 8) + "..." },
        "Failed email verification attempt"
      );

      return {
        success: false,
        statusCode: 400,
        message: "Invalid, expired, or already used verification code",
        errorCode: "INVALID_VERIFICATION_CODE",
      };
    }

    // Update verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    user.lastSecurityEvent = new Date();
    await user.save();

    // Queue welcome email (non-blocking)
    setImmediate(async () => {
      try {
        // TODO: Import and call sendWelcomeEmail when email service is wired up
        logger.info({ email: user.email }, "Welcome email queued");
      } catch (emailError) {
        logger.error(
          { err: emailError, email: user.email },
          "Failed to send welcome email"
        );
      }
    });

    return {
      success: true,
      statusCode: 200,
      message: "Email verified successfully! Welcome to our platform.",
      data: {
        user: {
          id: user._id,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          isVerified: user.isVerified,
        },
        nextSteps: [
          "Complete your profile",
          "Set up your preferences",
          "Explore our features",
        ],
      },
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
