import crypto from "crypto";
import User from "../../model/User.js";
import bcrypt from "bcrypt";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import logger from "../../utilities/general/logger.js";

// ─── Rate Limiting Helpers (In-Memory — migrate to Redis in future) ─

const passwordResetAttempts = new Map();

const isPasswordResetRateLimited = async (email, ip) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 3; // 3 attempts per 15 minutes

  const emailKey = `email:${email}`;
  const ipKey = `ip:${ip}`;

  const emailAttempts = passwordResetAttempts.get(emailKey) || [];
  const ipAttempts = passwordResetAttempts.get(ipKey) || [];

  // Remove attempts outside current window
  const recentEmailAttempts = emailAttempts.filter(
    (time) => time > now - windowMs
  );
  const recentIPAttempts = ipAttempts.filter((time) => time > now - windowMs);

  // Check if rate limited and calculate time remaining
  const isEmailLimited = recentEmailAttempts.length >= maxAttempts;
  const isIPLimited = recentIPAttempts.length >= maxAttempts * 2;

  if (isEmailLimited || isIPLimited) {
    // Calculate time remaining based on oldest attempt in window
    const oldestAttempt = Math.min(...recentEmailAttempts, ...recentIPAttempts);
    const timeRemainingMs = oldestAttempt + windowMs - now;
    const timeRemainingMinutes = Math.ceil(timeRemainingMs / (60 * 1000));

    return {
      rateLimited: true,
      timeRemainingMinutes,
      reason: isEmailLimited ? "email" : "ip",
    };
  }

  // Add current attempt
  recentEmailAttempts.push(now);
  recentIPAttempts.push(now);
  passwordResetAttempts.set(emailKey, recentEmailAttempts);
  passwordResetAttempts.set(ipKey, recentIPAttempts);

  return { rateLimited: false };
};

// ─── Controllers ────────────────────────────────────────────────────

export const handleForgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    // Input validation already handled by middleware, but double-check
    if (!email || typeof email !== "string") {
      return apiResponseManager(req, res, {
        statusCode: 400,
        success: false,
        message: "Valid email is required",
        errorCode: "INVALID_EMAIL",
      });
    }

    // Rate limiting check with time remaining
    const clientIP = req.ip;
    const rateLimitResult = await isPasswordResetRateLimited(email, clientIP);

    if (rateLimitResult.rateLimited) {
      return apiResponseManager(req, res, {
        statusCode: 429,
        success: false,
        message: `Too many password reset attempts. Please try again in ${rateLimitResult.timeRemainingMinutes} minutes.`,
        errorCode: "RATE_LIMITED",
        data: {
          retryAfter: rateLimitResult.timeRemainingMinutes * 60, // seconds
          reason: rateLimitResult.reason,
        },
      });
    }

    // Find user without revealing existence
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    });

    // SECURITY: Always return same response structure
    const successResponse = {
      statusCode: 200,
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    };

    // Case 1: User doesn't exist
    if (!user) {
      logger.warn(
        { email, ip: clientIP },
        "Password reset attempt for non-existent email"
      );
      return apiResponseManager(req, res, successResponse);
    }

    // Case 2: User already has active reset token
    if (user.resetPasswordToken && user.resetPasswordExpiresAt > new Date()) {
      logger.info(
        { email: user.email, ip: clientIP },
        "Password reset already active for user"
      );
      return apiResponseManager(req, res, successResponse);
    }

    // Case 3: Generate and send reset token (ACTUAL SUCCESS)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);

    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    user.lastSecurityEvent = new Date();
    await user.save();

    // NON-BLOCKING: Send email
    setImmediate(async () => {
      try {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`;
        // TODO: Import and call sendPasswordResetEmail when email service is wired up
        // await sendPasswordResetEmail(user.email, resetUrl, user.firstname);
        logger.info({ email: user.email }, "Password reset email queued");
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

    return apiResponseManager(req, res, successResponse);
  } catch (error) {
    logger.error({ err: error }, "Forgot password error");

    // Even in error, return the same success response for security
    return apiResponseManager(req, res, {
      statusCode: 200, // Still 200 to prevent user enumeration
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    });
  }
};

export const handleResetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // Input validation (already handled by middleware, but double-check)
    if (!token || typeof token !== "string" || token.length < 100) {
      return apiResponseManager(req, res, {
        statusCode: 400,
        success: false,
        message: "Valid reset token is required",
        errorCode: "INVALID_RESET_TOKEN",
      });
    }

    if (!password || typeof password !== "string") {
      return apiResponseManager(req, res, {
        statusCode: 400,
        success: false,
        message: "New password is required",
        errorCode: "MISSING_PASSWORD",
      });
    }

    // Hash the token to match what we stored (security best practice)
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with valid reset token and active account
    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpiresAt: { $gt: new Date() },
      isActive: true,
    });

    if (!user) {
      // Log security event for invalid token attempts
      logger.warn(
        { token: token.substring(0, 16) + "..." },
        "Invalid password reset token attempt"
      );

      return apiResponseManager(req, res, {
        statusCode: 400,
        success: false,
        message: "Invalid, expired, or already used reset token",
        errorCode: "INVALID_RESET_TOKEN",
      });
    }

    // Check if new password is different from old password
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return apiResponseManager(req, res, {
        statusCode: 400,
        success: false,
        message: "New password cannot be the same as your current password",
        errorCode: "PASSWORD_SAME_AS_CURRENT",
      });
    }

    // Update password with enhanced security measures
    const hashedPassword = await bcrypt.hash(password, 12);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiresAt = undefined;

    // SECURITY: Reset login lock and attempts
    user.isLocked = false;
    user.lockUntil = undefined;
    user.loginAttempts = 0;

    // SECURITY: Invalidate all existing sessions
    user.tokenVersion += 1;
    user.refreshToken = null;

    // SECURITY: Update security timestamps
    user.lastPasswordChange = new Date();
    user.lastSecurityEvent = new Date();
    user.lastLogin = new Date(); // Optional: count as a login event

    await user.save();

    // NON-BLOCKING: Send success email without delaying response
    setImmediate(async () => {
      try {
        // TODO: Import and call sendResetSuccessEmail when email service is wired up
        // await sendResetSuccessEmail(user.email, user.firstname);
        logger.info({ email: user.email }, "Password reset success email queued");
      } catch (emailError) {
        logger.error(
          { err: emailError, email: user.email },
          "Failed to send password reset success email"
        );
      }
    });

    // Log security event
    logger.info({ email: user.email }, "Password reset completed");

    return apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message:
        "Password reset successfully. Please login with your new password.",
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstname: user.firstname,
        },
        nextSteps: [
          "Login with your new password",
          "Update your security settings if needed",
          "Contact support if you didn't request this reset",
        ],
      },
    });
  } catch (error) {
    logger.error({ err: error }, "Reset password error");

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
      message: "Password reset failed due to unexpected error",
      errorCode: "RESET_FAILED",
    });
  }
};
