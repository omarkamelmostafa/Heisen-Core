// backend/use-cases/auth/login.use-case.js

import User from "../../model/User.js";
import { comparePassword } from "../../utilities/auth/hash-utils.js";
import { generateTokens } from "../../services/auth/token-service.js";
import { sanitizeUserForResponse } from "../../utilities/auth/user-data-utils.js";
import logger from "../../utilities/general/logger.js";

/**
 * Login Use Case — Pure business logic, no req/res.
 *
 * @param {Object} dto
 * @param {string} dto.email
 * @param {string} dto.password
 * @param {string} dto.userAgent - User-Agent header for session identification
 * @param {string} dto.ipAddress - Client IP for session identification
 * @returns {Object} { success, statusCode, errorCode?, message, data? }
 */
export async function loginUseCase({ email, password, userAgent, ipAddress }) {
  // Input validation
  if (!email || !password) {
    return {
      success: false,
      statusCode: 400,
      message: "Email and password are required.",
      errorCode: "MISSING_CREDENTIALS",
    };
  }

  try {
    const foundUser = await User.findByEmailWithSecurity(email);

    // Generic error response — same for wrong email AND wrong password (FR-028)
    const invalidCredentials = {
      success: false,
      statusCode: 401,
      message: "Invalid email or password.",
      errorCode: "INVALID_CREDENTIALS",
    };

    if (!foundUser) return invalidCredentials;

    // Account active check
    if (!foundUser.isActive) {
      return {
        success: false,
        statusCode: 403,
        message: "Account is deactivated. Please contact support.",
        errorCode: "ACCOUNT_DEACTIVATED",
      };
    }

    // Email verification check (FR-005)
    if (!foundUser.isVerified) {
      return {
        success: false,
        statusCode: 403,
        message:
          "Please verify your email address before logging in. Check your inbox for the verification link.",
        errorCode: "ACCOUNT_NOT_VERIFIED",
      };
    }

    // Password verification
    const match = await comparePassword(password, foundUser.password);
    if (!match) {
      return invalidCredentials;
    }

    // Success path — generate tokens (creates RefreshToken document in DB)
    const { accessToken, refreshTokenValue, accessTokenExpiresIn } =
      await generateTokens(foundUser, userAgent, ipAddress);

    // Update last login
    foundUser.lastLogin = new Date();
    await foundUser.save();

    const userData = sanitizeUserForResponse(foundUser);

    logger.info({ userId: foundUser._id, ip: ipAddress }, "User logged in");

    return {
      success: true,
      statusCode: 200,
      message: "Login successful",
      data: {
        user: userData,
        accessToken,
        refreshTokenValue,
        expiresIn: accessTokenExpiresIn,
      },
    };
  } catch (error) {
    logger.error({ err: error, email }, "Login use-case error");

    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return {
        success: false,
        statusCode: 503,
        message: "Service temporarily unavailable. Please try again later.",
        errorCode: "DATABASE_ERROR",
      };
    }

    return {
      success: false,
      statusCode: 500,
      message: "Internal server error during login.",
      errorCode: "INTERNAL_ERROR",
    };
  }
}
