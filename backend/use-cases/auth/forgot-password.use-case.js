// backend/use-cases/auth/forgot-password.use-case.js

import crypto from "crypto";
import User from "../../model/User.js";
import redis from "../../config/redis.js";
import logger from "../../utilities/general/logger.js";
import { EmailService } from "../../services/email/email.service.js";

const emailService = new EmailService();

// ─── Rate Limiting Helpers (Redis-backed) ───────────────────────────

const WINDOW_SECONDS = 15 * 60; // 15 minutes
const MAX_EMAIL_ATTEMPTS = 3;   // 3 attempts per email per window
const MAX_IP_ATTEMPTS = 6;      // 6 attempts per IP per window

const isPasswordResetRateLimited = async (email, ip) => {
  const emailKey = `pwd_reset_limit:email:${email}`;
  const ipKey = `pwd_reset_limit:ip:${ip}`;

  const [emailCount, ipCount, emailTTL, ipTTL] = await Promise.all([
    redis.get(emailKey),
    redis.get(ipKey),
    redis.ttl(emailKey),
    redis.ttl(ipKey),
  ]);

  const emailAttempts = parseInt(emailCount || 0);
  const ipAttempts = parseInt(ipCount || 0);

  const isEmailLimited = emailAttempts >= MAX_EMAIL_ATTEMPTS;
  const isIPLimited = ipAttempts >= MAX_IP_ATTEMPTS;

  if (isEmailLimited || isIPLimited) {
    const ttl = isEmailLimited ? emailTTL : ipTTL;
    const timeRemainingMinutes = Math.ceil(Math.max(ttl, 0) / 60) || 1;

    return {
      rateLimited: true,
      timeRemainingMinutes,
      reason: isEmailLimited ? "email" : "ip",
    };
  }

  // Increment counters with auto-expiry
  const pipeline = redis.pipeline();
  pipeline.incr(emailKey);
  pipeline.expire(emailKey, WINDOW_SECONDS);
  pipeline.incr(ipKey);
  pipeline.expire(ipKey, WINDOW_SECONDS);
  await pipeline.exec();

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
        await emailService.sendPasswordResetEmail(user, resetUrl);
        logger.info({ email: user.email }, "Password reset email sent");
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
