import User from "../../model/User.js";
import bcrypt from "bcrypt";
import { generateTokens } from "../../utilities/auth/token-utils.js";
import { setCookie } from "../../utilities/general/cookie-utils.js";
import { sanitizeUserForResponse } from "../../utilities/auth/user-data-utils.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import { REFRESH_TOKEN_COOKIE_NAME } from "./auth-shared.js";

export const handleLogin = async (req, res) => {
  const { email, password: providedPassword } = req.body;

  try {
    // Input validation
    if (!email || !providedPassword) {
      return apiResponseManager(req, res, {
        statusCode: 400,
        success: false,
        message: "Email and password are required.",
        errorCode: "MISSING_CREDENTIALS",
      });
    }

    // Find user with security fields using the new static method
    const foundUser = await User.findByEmailWithSecurity(email);

    // Security: Generic error message to prevent user enumeration
    const invalidCredentialsResponse = {
      statusCode: 401,
      success: false,
      message: "Invalid email or password.",
      errorCode: "INVALID_CREDENTIALS",
    };

    if (!foundUser) {
      return apiResponseManager(req, res, invalidCredentialsResponse);
    }

    // Check if account is active
    if (!foundUser.isActive) {
      return apiResponseManager(req, res, {
        statusCode: 403,
        success: false,
        message: "Account is deactivated. Please contact support.",
        errorCode: "ACCOUNT_DEACTIVATED",
      });
    }

    // Check if account is temporarily locked using the new instance method
    if (foundUser.isAccountLocked()) {
      const timeLeft = Math.ceil((foundUser.lockUntil - new Date()) / 60000); // minutes left
      return apiResponseManager(req, res, {
        statusCode: 423,
        success: false,
        message: `Account temporarily locked. Try again in ${timeLeft} minutes.`,
        errorCode: "ACCOUNT_LOCKED",
      });
    }

    // Verify password
    const match = await bcrypt.compare(providedPassword, foundUser.password);

    if (!match) {
      // Use the new instance method to handle failed login
      await foundUser.incrementLoginAttempts();
      return apiResponseManager(req, res, invalidCredentialsResponse);
    }

    // Reset login attempts and update last login using the new instance method
    await foundUser.resetLoginAttempts();

    // Generate tokens with enhanced security
    const { accessToken, refreshToken, accessTokenExpiresIn } =
      await generateTokens(foundUser);

    // Store refresh token in database (automatically clears other sessions due to pre-save hook)
    foundUser.refreshToken = refreshToken;
    await foundUser.save();

    // Set HTTP-only cookie for refresh token (7 days for better UX)
    setCookie(res, REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
      maxAge: process.env.REFRESH_TOKEN_COOKIE_MAX_AGE || 24 * 60 * 60 * 1000,
    });

    // Prepare user data for response
    const userData = sanitizeUserForResponse(foundUser);

    return apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "Login successful",
      data: {
        user: userData,
        accessToken,
        expiresIn: accessTokenExpiresIn,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Different error handling based on error type
    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return apiResponseManager(req, res, {
        statusCode: 503,
        success: false,
        message: "Service temporarily unavailable. Please try again later.",
        errorCode: "DATABASE_ERROR",
      });
    }

    return apiResponseManager(req, res, {
      statusCode: 500,
      success: false,
      message: "Internal server error during login.",
      errorCode: "INTERNAL_ERROR",
    });
  }
};
