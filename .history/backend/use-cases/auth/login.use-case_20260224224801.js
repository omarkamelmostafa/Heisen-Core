// backend/use-cases/auth/login.use-case.js

import User from "../../model/User.js";
import bcrypt from "bcrypt";
import { generateTokens } from "../../services/auth/token-service.js";
import { sanitizeUserForResponse } from "../../utilities/auth/user-data-utils.js";
import logger from "../../utilities/general/logger.js";

/**
 * Login Use Case — Pure business logic, no req/res.
 *
 * @param {Object} dto
 * @param {string} dto.email
 * @param {string} dto.password
 * @returns {Object} { success, statusCode, errorCode?, message, data? }
 */
export async function loginUseCase({ email, password }) {
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

    // Account lock check
    if (foundUser.isAccountLocked()) {
      const timeLeft = Math.ceil((foundUser.lockUntil - new Date()) / 60000);
      return {
        success: false,
        statusCode: 423,
        message: `Account temporarily locked. Try again in ${timeLeft} minutes.`,
        errorCode: "ACCOUNT_LOCKED",
      };
    }

    // Password verification
    const match = await bcrypt.compare(password, foundUser.password);
    if (!match) {
      await foundUser.incrementLoginAttempts();
      return invalidCredentials;
    }

    // Success path
    await foundUser.resetLoginAttempts();

    const { accessToken, refreshToken, accessTokenExpiresIn } =
      await generateTokens(foundUser);

    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    const userData = sanitizeUserForResponse(foundUser);

    return {
      success: true,
      statusCode: 200,
      message: "Login successful",
      data: { user: userData, accessToken, refreshToken, expiresIn: accessTokenExpiresIn },
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
