// backend/use-cases/auth/register.use-case.js

import User from "../../model/User.js";
import bcrypt from "bcrypt";
import { CloudinaryService } from "../../services/cloudinaryService.js";
import logger from "../../utilities/general/logger.js";
import { EmailService } from "../../services/email/email.service.js";
import crypto from "crypto";

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

    // Create user with hashed password and verification token
    const passwordHash = await bcrypt.hash(password, 12);

    // Generate verification token — store hashed, send raw in email URL
    // Fix: Generate a purely numeric 6-digit code for the frontend UI format
    const rawVerificationToken = crypto.randomInt(100000, 999999).toString();
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

      await CloudinaryService.createUserFolder(newUser._id.toString());
      logger.info(
        { userId: newUser._id },
        "Cloudinary folders created for user"
      );

      // Send verification email (non-blocking) AFTER Cloudinary succeeds
      setImmediate(async () => {
        try {
          await emailService.sendVerificationEmail(
            newUser,
            rawVerificationToken
          );
          logger.info({ userId: newUser._id }, "Verification email sent");
        } catch (emailError) {
          logger.error(
            { err: emailError, userId: newUser._id },
            "Failed to send verification email"
          );
        }
      });
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
        message:
          "Registration failed due to storage system error. Please try again.",
        errorCode: "InternalServerError",
      };
    }

    logger.info({ userId: newUser._id, ip: clientIP }, "User registered");

    return {
      success: true,
      statusCode: 201,
      message:
        "Registration successful. Please check your email to verify your account.",
      data: {
        user: {
          uuid: newUser.uuid,
          email: newUser.email,
          isVerified: false,
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
