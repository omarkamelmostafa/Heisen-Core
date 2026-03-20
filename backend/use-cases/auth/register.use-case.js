// backend/use-cases/auth/register.use-case.js

import User from "../../model/User.js";
import { hashPassword } from "../../utilities/auth/hash-utils.js";
import { CloudinaryService } from "../../services/cloudinaryService.js";
import logger from "../../utilities/general/logger.js";
import { EmailService } from "../../services/email/email.service.js";
import crypto from "crypto";
import { generateVerificationCode } from "../../utilities/auth/crypto-utils.js";

const emailService = new EmailService();

/**
 * Register Use Case — Pure business logic, no req/res.
 *
 * @param {Object} dto
 * @param {string} dto.firstname
 * @param {string} dto.lastname
 * @param {string} dto.email
 * @param {string} dto.password
 * @param {string} dto.confirmPassword
 * @param {string} dto.clientIP - Client IP for logging
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
      errorCode: "BAD_REQUEST",
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      statusCode: 400,
      message: "Validation Error: Passwords do not match. Please try again.",
      errorCode: "CONFLICT",
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
        errorCode: "CONFLICT",
      };
    }

    // Create user with hashed password and verification token
    const passwordHash = await hashPassword(password);

    // Generate verification token — store hashed, send raw in email URL
    // Fix: Generate a purely numeric 6-digit code for the frontend UI format
    const rawVerificationToken = generateVerificationCode();
    const hashedVerificationToken = crypto
      .createHash("sha256")
      .update(rawVerificationToken)
      .digest("hex");
    const verificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000
    ); // 24 hours

    let newUser;

    try {
      newUser = await User.create({
        firstname,
        lastname,
        email,
        password: passwordHash,
        verificationToken: hashedVerificationToken,
        verificationTokenExpiresAt,
      });

      const [cloudinaryResult, emailResult] = await Promise.all([
        CloudinaryService.createUserFolder(newUser._id.toString())
          .then(() => ({ success: true }))
          .catch((err) => ({ success: false, error: err })),

        emailService.sendVerificationEmail(newUser, rawVerificationToken)
          .then(() => ({ success: true }))
          .catch((err) => ({ success: false, error: err })),
      ]);

      // Handle Cloudinary result
      if (cloudinaryResult.success) {
        logger.info(
          { userId: newUser._id },
          "Cloudinary folders created for user"
        );
      } else {
        // Log error and throw to trigger existing catch block (deletes user)
        logger.error(
          { err: cloudinaryResult.error, userId: newUser._id },
          "Failed to create Cloudinary folders"
        );
        throw cloudinaryResult.error;
      }

      // Handle Email result
      const emailSent = emailResult.success;
      if (emailSent) {
        logger.info({ userId: newUser._id }, "Verification email sent");
      } else {
        logger.error(
          { err: emailResult.error, userId: newUser._id, email: newUser.email },
          "Failed to send verification email"
        );
      }

      logger.info({ userId: newUser._id, ip: clientIP }, "User registered");

      return {
        success: true,
        statusCode: 201,
        message: emailSent
          ? "Registration successful. Please check your email to verify your account."
          : "Account created successfully. We couldn't send the verification email — please use Resend Code on the verification page.",
        data: {
          user: {
            uuid: newUser.uuid,
            email: newUser.email,
            isVerified: false,
          },
          emailSent,
        },
      };
    } catch (cloudinaryError) {
      if (newUser) {
        await User.findByIdAndDelete(newUser._id);
      }

      return {
        success: false,
        statusCode: 500,
        message:
          "Registration failed due to storage system error. Please try again.",
        errorCode: "INTERNAL_ERROR",
      };
    }
  } catch (error) {
    logger.error({ err: error, email }, "Registration use-case error");

    return {
      success: false,
      statusCode: 500,
      message: "Registration failed. Please try again.",
      errorCode: "INTERNAL_ERROR",
    };
  }
}
