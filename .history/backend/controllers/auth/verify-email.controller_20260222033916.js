import User from "../../model/User.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import logger from "../../utilities/general/logger.js";

export const handleVerifyEmail = async (req, res) => {
  const { code } = req.body;

  // Input validation
  if (!code || typeof code !== "string" || code.trim().length === 0) {
    return apiResponseManager(req, res, {
      statusCode: 400,
      success: false,
      message: "Verification code is required",
      errorCode: "MISSING_VERIFICATION_CODE",
    });
  }

  try {
    // Find user with valid verification token
    const user = await User.findOne({
      verificationToken: code.trim(),
      verificationTokenExpiresAt: { $gt: new Date() },
      isVerified: false, // Prevent re-verification
    });

    if (!user) {
      // Log security event
      logger.warn(
        { code: code.substring(0, 8) + "..." },
        "Failed email verification attempt"
      );

      return apiResponseManager(req, res, {
        statusCode: 400,
        success: false,
        message: "Invalid, expired, or already used verification code",
        errorCode: "INVALID_VERIFICATION_CODE",
      });
    }

    // Update user verification status
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpiresAt = undefined;
    user.lastSecurityEvent = new Date();

    await user.save();

    // NON-BLOCKING: Send welcome email without delaying response
    setImmediate(async () => {
      try {
        // TODO: Import and call sendWelcomeEmail when email service is wired up
        // await sendWelcomeEmail(user.email, `${user.firstname} ${user.lastname}`);
        logger.info({ email: user.email }, "Welcome email queued");
      } catch (emailError) {
        logger.error({ err: emailError, email: user.email }, "Failed to send welcome email");
        // User is already verified - email failure is non-critical
      }
    });

    // IMMEDIATE RESPONSE - User doesn't wait for emails
    return apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
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
    });
  } catch (error) {
    logger.error({ err: error }, "Email verification error");

    // Specific error handling
    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return apiResponseManager(req, res, {
        statusCode: 503,
        success: false,
        message: "Service temporarily unavailable. Please try again.",
        errorCode: "DATABASE_ERROR",
      });
    }

    return apiResponseManager(req, res, {
      statusCode: 500,
      success: false,
      message: "Email verification failed due to unexpected error",
      errorCode: "VERIFICATION_FAILED",
    });
  }
};

