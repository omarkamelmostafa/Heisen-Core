// backend/use-cases/auth/forgot-password.use-case.js

import crypto from "crypto";
import User from "../../model/User.js";
import logger from "../../utilities/general/logger.js";

// ─── Rate Limiting Helpers (In-Memory — Task I2 will migrate to Redis) ─

const passwordResetAttempts = new Map();

const isPasswordResetRateLimited = async (email, ip) => {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxAttempts = 3;

  const emailKey = `email:${email}`;
  const ipKey = `ip:${ip}`;

  const emailAttempts = passwordResetAttempts.get(emailKey) || [];
  const ipAttempts = passwordResetAttempts.get(ipKey) || [];

  const recentEmailAttempts = emailAttempts.filter((time) => time > now - windowMs);
  const recentIPAttempts = ipAttempts.filter((time) => time > now - windowMs);

  const isEmailLimited = recentEmailAttempts.length >= maxAttempts;
  const isIPLimited = recentIPAttempts.length >= maxAttempts * 2;

  if (isEmailLimited || isIPLimited) {
    const oldestAttempt = Math.min(...recentEmailAttempts, ...recentIPAttempts);
    const timeRemainingMs = oldestAttempt + windowMs - now;
    const timeRemainingMinutes = Math.ceil(timeRemainingMs / (60 * 1000));

    return {
      rateLimited: true,
      timeRemainingMinutes,
      reason: isEmailLimited ? "email" : "ip",
    };
  }

  recentEmailAttempts.push(now);
  recentIPAttempts.push(now);
  passwordResetAttempts.set(emailKey, recentEmailAttempts);
  passwordResetAttempts.set(ipKey, recentIPAttempts);

  return { rateLimited: false };
};

/**
 * Forgot Password Use Case — Pure business logic, no req/res.
 *
 * @param {Object} dto
 * @param {string} dto.email
 * @param {string} dto.clientIP - For rate limiting and logging
 * @returns {Object} { success, statusCode, errorCode?, message, data? }
 */
export async function forgotPasswordUseCase({ email, clientIP }) {
  const successResponse = {
    success: true,
    statusCode: 200,
    message: "If the email exists, a password reset link has been sent.",
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

    // Rate limiting
    const rateLimitResult = await isPasswordResetRateLimited(email, clientIP);
    if (rateLimitResult.rateLimited) {
      return {
        success: false,
        statusCode: 429,
        message: `Too many password reset attempts. Please try again in ${rateLimitResult.timeRemainingMinutes} minutes.`,
        errorCode: "RATE_LIMITED",
        data: {
          retryAfter: rateLimitResult.timeRemainingMinutes * 60,
          reason: rateLimitResult.reason,
        },
      };
    }

    // Find user (security: always return same response)
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
    });

    if (!user) {
      logger.warn({ email, ip: clientIP }, "Password reset attempt for non-existent email");
      return successResponse;
    }

    // Already has active reset token
    if (user.resetPasswordToken && user.resetPasswordExpiresAt > new Date()) {
      logger.info({ email: user.email, ip: clientIP }, "Password reset already active for user");
      return successResponse;
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000);
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpiresAt = resetTokenExpiresAt;
    user.lastSecurityEvent = new Date();
    await user.save();

    // Queue email (non-blocking)
    setImmediate(async () => {
      try {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`;
        // TODO: Import and call sendPasswordResetEmail when email service is wired up
        logger.info({ email: user.email }, "Password reset email queued");
      } catch (emailError) {
        logger.error({ err: emailError, email: user.email }, "Failed to send password reset email");
      }
    });

    logger.info({ email: user.email, ip: clientIP }, "Password reset initiated");
    return successResponse;
  } catch (error) {
    logger.error({ err: error }, "Forgot password use-case error");
    // Security: always return same response to prevent enumeration
    return successResponse;
  }
}
