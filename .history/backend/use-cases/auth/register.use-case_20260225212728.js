// backend/use-cases/auth/register.use-case.js

import User from "../../model/User.js";
import bcrypt from "bcrypt";
import { CloudinaryService } from "../../services/cloudinaryService.js";
import redis from "../../config/redis.js";
import logger from "../../utilities/general/logger.js";
import { EmailService } from "../../services/email/email.service.js";
import crypto from "crypto";

const emailService = new EmailService();

// ─── Rate Limiting Helpers (Redis-backed) ───────────────────────────

const isRateLimited = async (email, ip) => {
  const emailKey = `reg_limit:email:${email}`;
  const ipKey = `reg_limit:ip:${ip}`;

  const [lastEmailAttempt, lastIPAttempt] = await Promise.all([
    redis.get(emailKey),
    redis.get(ipKey),
  ]);

  if (lastEmailAttempt || lastIPAttempt) {
    const latestAttempt = Math.max(
      parseInt(lastEmailAttempt || 0),
      parseInt(lastIPAttempt || 0)
    );
    const timeRemaining = Math.ceil(
      (latestAttempt + 5 * 60 * 1000 - Date.now()) / 1000 / 60
    );

    return {
      rateLimited: true,
      timeRemainingMinutes: timeRemaining > 0 ? timeRemaining : 1,
    };
  }

  return { rateLimited: false };
};

const updateRateLimit = async (email, ip) => {
  const emailKey = `reg_limit:email:${email}`;
  const ipKey = `reg_limit:ip:${ip}`;
  const now = Date.now().toString();

  await Promise.all([
    redis.set(emailKey, now, "EX", 300),
    redis.set(ipKey, now, "EX", 300),
  ]);
};

/**
 * Register Use Case — Pure business logic, no req/res.
 *
 * @param {Object} dto
 * @param {string} dto.firstname
 * @param {string} dto.lastname
 * @param {string} dto.email
 * @param {string} dto.password
 * @param {string} dto.confirmPassword
 * @param {string} dto.clientIP - Client IP for rate limiting
 * @returns {Object} { success, statusCode, errorCode?, message, data? }
 */
export async function registerUseCase({
  firstname,
  lastname,
  email,
  password,
  confirmPassword,
  clientIP,
}) {
  // Input validation
  if (!firstname || !lastname || !email || !password || !confirmPassword) {
    return {
      success: false,
      statusCode: 400,
      message: "Validation Error: All required fields are missing.",
      errorCode: "BadRequest",
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      statusCode: 400,
      message: "Validation Error: Passwords do not match. Please try again.",
      errorCode: "Conflict",
    };
  }

  try {
    // Duplicate check
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return {
        success: false,
        statusCode: 409,
        message: "User with this email already exists.",
        errorCode: "Conflict",
      };
    }

    // Rate limiting
    const rateLimitResult = await isRateLimited(email, clientIP);
    if (rateLimitResult.rateLimited) {
      return {
        success: false,
        statusCode: 429,
        message: `Too many registration attempts. Please try again in ${rateLimitResult.timeRemainingMinutes} minutes.`,
        errorCode: "TooManyRequests",
      };
    }

    // Create user
    const passwordHash = await bcrypt.hash(password, 12);
    let newUser;

    try {
      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      newUser = await User.create({
        firstname,
        lastname,
        email,
        password: passwordHash,
        verificationToken,
        verificationTokenExpiresAt,
      });

      // Send verification email (non-blocking)
      setImmediate(async () => {
        try {
          await emailService.sendVerificationEmail(newUser, verificationToken);
          logger.info({ userId: newUser._id }, "Verification email sent");
        } catch (emailError) {
          logger.error({ err: emailError, userId: newUser._id }, "Failed to send verification email");
        }
      });

      await CloudinaryService.createUserFolder(newUser._id.toString());
      logger.info({ userId: newUser._id }, "Cloudinary folders created for user");
    } catch (cloudinaryError) {
      logger.error(
        { err: cloudinaryError, userId: newUser?._id },
        "Cloudinary folder creation failed"
      );
      if (newUser) {
        await User.findByIdAndDelete(newUser._id);
      }

      return {
        success: false,
        statusCode: 500,
        message: "Registration failed due to storage system error. Please try again.",
        errorCode: "InternalServerError",
      };
    }

    // Update rate limiting
    await updateRateLimit(email, clientIP);

    return {
      success: true,
      statusCode: 201,
      message: "User registered successfully!",
      data: {
        user: {
          id: newUser._id,
          firstname: newUser.firstname,
          lastname: newUser.lastname,
          email: newUser.email,
        },
      },
    };
  } catch (error) {
    logger.error({ err: error, email }, "Registration use-case error");

    return {
      success: false,
      statusCode: 500,
      message: "Registration failed. Please try again.",
      errorCode: "InternalServerError",
    };
  }
}
