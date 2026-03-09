// handleLogin,
// handleRegister,
// handleLogout,
// handleRefreshToken,

// handleVerifyEmail,
// handleForgotPassword,
// handleResetPassword,
// handleCheckAuth;
import crypto from "crypto";
import User from "../../model/User.js";
import bcrypt from "bcrypt";

import {
  generateTokens,
  refreshAccessToken,
  revokeByJti,
  safeVerifyOrDecode,
} from "../../utilities/auth/token-utils.js";
import {
  clearCookie,
  setCookie,
} from "../../utilities/general/cookie-utils.js";
import { sanitizeUserForResponse } from "../../utilities/auth/user-data-utils.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";

import { ensureDirectoryExists } from "../../utilities/utils.js";
import path from "path";
import { fileURLToPath } from "url";
import Role from "../../model/Role.js";

import jwt from "jsonwebtoken";
import { registrationTimestamps } from "../../middleware/security/rate-limiter-middleware.js";
import { CloudinaryService } from "../../services/cloudinaryService.js";
import { emitLogMessage } from "../../utilities/general/emit-log.js";

// handleRegister controller follows...


export const handleRegister = async (req, res) => {
  const { firstname, lastname, email, password, confirmPassword } = req.body;

  if (!firstname || !lastname || !email || !password || !confirmPassword) {
    return apiResponseManager(req, res, {
      statusCode: 400,
      success: false,
      message: "Validation Error: All required fields are missing.",
      errorCode: "BadRequest",
    });
  }

  if (password !== confirmPassword) {
    return apiResponseManager(req, res, {
      statusCode: 400,
      success: false,
      message: "Validation Error: Passwords do not match. Please try again.",
      errorCode: "Conflict",
    });
  }

  try {
    // Check for duplicate user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return apiResponseManager(req, res, {
        statusCode: 409,
        success: false,
        message: "User with this email already exists.",
        errorCode: "Conflict",
      });
    }

    // Rate limiting check
    const clientIP = req.ip;
    const rateLimitResult = await isRateLimited(email, clientIP);

    if (rateLimitResult.rateLimited) {
      return apiResponseManager(req, res, {
        statusCode: 429,
        success: false,
        message: `Too many registration attempts. Please try again in ${rateLimitResult.timeRemainingMinutes} minutes.`,
        errorCode: "TooManyRequests",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    let newUser;

    try {
      // Create user
      newUser = await User.create({
        firstname,
        lastname,
        email,
        password: passwordHash,
      });

      // Wait for Cloudinary to complete
      await CloudinaryService.createUserFolder(newUser._id.toString());
      console.log(`Cloudinary folders created for user: ${newUser._id}`);
    } catch (cloudinaryError) {
      console.error("Cloudinary folder creation failed:", cloudinaryError);
      // Delete user if Cloudinary failed
      if (newUser) {
        await User.findByIdAndDelete(newUser._id);
      }

      return apiResponseManager(req, res, {
        statusCode: 500,
        success: false,
        message:
          "Registration failed due to storage system error. Please try again.",
        errorCode: "InternalServerError",
      });
    }

    // Update rate limiting
    await updateRateLimit(email, clientIP);

    return apiResponseManager(req, res, {
      statusCode: 201,
      success: true,
      message: "User registered successfully!",
      data: {
        user: {
          id: newUser._id,
          firstname: newUser.firstname,
          lastname: newUser.lastname,
          email: newUser.email,
        },
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    return apiResponseManager(req, res, {
      statusCode: 500,
      success: false,
      message: "Registration failed. Please try again.",
      errorCode: "InternalServerError",
    });
  }
};

// Rate limiting helper functions
// const registrationTimestamps = new Map();

const isRateLimited = async (email, ip) => {
  const lastEmailAttempt = registrationTimestamps.get(email);
  const lastIPAttempt = registrationTimestamps.get(ip);
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000; // 5 minutes

  const isEmailRateLimited =
    lastEmailAttempt && lastEmailAttempt > fiveMinutesAgo;
  const isIPRateLimited = lastIPAttempt && lastIPAttempt > fiveMinutesAgo;

  if (isEmailRateLimited || isIPRateLimited) {
    // Calculate time remaining for better error message
    const latestAttempt = Math.max(lastEmailAttempt || 0, lastIPAttempt || 0);
    const timeRemaining = Math.ceil(
      (latestAttempt + 5 * 60 * 1000 - Date.now()) / 1000 / 60
    );

    return {
      rateLimited: true,
      timeRemainingMinutes: timeRemaining,
      reason: isEmailRateLimited ? "email" : "ip",
    };
  }

  return { rateLimited: false };
};

const updateRateLimit = (email, ip) => {
  registrationTimestamps.set(email, Date.now());
  registrationTimestamps.set(ip, Date.now());
};

// Cleanup function to prevent memory leaks
const cleanupExpiredRateLimits = () => {
  const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

  for (const [key, timestamp] of registrationTimestamps.entries()) {
    if (timestamp < fiveMinutesAgo) {
      registrationTimestamps.delete(key);
      console.log("Rate limit for", key, "has expired.");
    }
  }
};

// Run cleanup every 10 minutes
setInterval(cleanupExpiredRateLimits, 10 * 60 * 1000);

// Controller for user login

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
    setCookie(
      res,
      process.env.REFRESH_TOKEN_COOKIE_NAME || "refreshToken",
      refreshToken,
      {
        maxAge: process.env.REFRESH_TOKEN_COOKIE_MAX_AGE || 24 * 60 * 60 * 1000,
      }
    );

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

export const handleLogout = async (req, res) => {
  const cookieName =
    process.env.REFRESH_TOKEN_COOKIE_NAME?.replace(/"/g, "") || "refreshToken";
  const refreshToken = req.cookies?.refreshToken;
  const accessToken = req.headers.authorization?.replace("Bearer ", "");

  try {
    // 1. Clear cookies immediately
    clearCookie(res, cookieName);

    let decodedRefresh = null;

    // 2. Process refresh token with Redis fallback
    if (refreshToken) {
      decodedRefresh = safeVerifyOrDecode(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        {
          issuer: process.env.JWT_ISSUER,
          audience: process.env.JWT_AUDIENCE,
        }
      );

      // Only blacklist if token is still valid
      if (decodedRefresh?.jti && decodedRefresh.exp > Date.now() / 1000) {
        try {
          await revokeByJti(decodedRefresh.jti, decodedRefresh.exp); // ✅ AWAIT Redis call
        } catch (redisError) {
          console.warn(
            "Redis unavailable for blacklisting:",
            redisError.message
          );
        }
      }
    }

    // 3. Process access token with Redis fallback
    if (accessToken) {
      const decodedAccess = safeVerifyOrDecode(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        {
          issuer: process.env.JWT_ISSUER,
          audience: process.env.JWT_AUDIENCE,
        }
      );

      if (decodedAccess?.jti && decodedAccess.exp > Date.now() / 1000) {
        try {
          await revokeByJti(decodedAccess.jti, decodedAccess.exp); // ✅ AWAIT Redis call
        } catch (redisError) {
          console.warn(
            "Redis unavailable for access token blacklisting:",
            redisError.message
          );
        }
      }
    }

    // 4. Invalidate database tokens (atomic operations)
    if (decodedRefresh?.userId) {
      const userId = decodedRefresh.userId;
      const logoutAll = String(req.query?.all) === "true";

      if (logoutAll) {
        await User.findByIdAndUpdate(userId, {
          $inc: { tokenVersion: 1 },
          $unset: { refreshToken: "" },
        }).exec();
      } else if (refreshToken) {
        await User.findOneAndUpdate(
          { _id: userId, refreshToken: refreshToken },
          { $unset: { refreshToken: "" } }
        ).exec();
      }
    }

    return apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    clearCookie(res, "refreshToken");

    return apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "Logged out successfully",
    });
  }
};

export const handleRefreshToken = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    return apiResponseManager(req, res, {
      statusCode: 401,
      success: false,
      message: "Refresh token required",
      errorCode: "MISSING_REFRESH_TOKEN",
    });
  }

  try {
    // Verify and decode refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, {
      issuer: process.env.JWT_ISSUER,
      audience: process.env.JWT_AUDIENCE,
    });

    // ✅ FIXED: Find user by ID (not email)
    const user = await User.findById(decoded.userId).select(
      "+refreshToken +tokenVersion"
    );

    if (!user) {
      clearCookie(res, "refreshToken");
      return apiResponseManager(req, res, {
        statusCode: 401,
        success: false,
        message: "User not found",
        errorCode: "USER_NOT_FOUND",
      });
    }

    // ✅ Check token version (critical security fix)
    if (decoded.tokenVersion !== user.tokenVersion) {
      clearCookie(res, "refreshToken");
      user.refreshToken = null;
      await user.save();

      return apiResponseManager(req, res, {
        statusCode: 401,
        success: false,
        message: "Session expired. Please login again.",
        errorCode: "TOKEN_VERSION_MISMATCH",
      });
    }

    // Check if stored refresh token matches (prevent token reuse)
    if (user.refreshToken !== refreshToken) {
      clearCookie(res, "refreshToken");
      user.refreshToken = null;
      await user.save();

      // ✅ Log security event
      emitLogMessage(
        `Token reuse detected for user ${user._id} from IP ${req.ip}`,
        "info"
      );

      return apiResponseManager(req, res, {
        statusCode: 401,
        success: false,
        message: "Security alert: Invalid session detected.",
        errorCode: "TOKEN_REUSE_DETECTED",
      });
    }

    // Generate new tokens
    const {
      accessToken,
      refreshToken: newRefreshToken,
      accessTokenExpiresIn,
    } = await refreshAccessToken(refreshToken, user);

    // Update refresh token in database (rotation)
    user.refreshToken = newRefreshToken;
    await user.save();

    // Set new refresh token cookie with enhanced security
    setCookie(res, "refreshToken", newRefreshToken, {
      maxAge: process.env.REFRESH_TOKEN_COOKIE_MAX_AGE || 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh", // Limit cookie scope
    });

    return apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "Token refreshed successfully",
      data: {
        accessToken,
        tokenType: "Bearer",
        expiresIn: accessTokenExpiresIn,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    clearCookie(res, "refreshToken");

    // Enhanced error handling
    const errorMap = {
      TokenExpiredError: {
        message: "Refresh token expired",
        errorCode: "REFRESH_TOKEN_EXPIRED",
      },
      JsonWebTokenError: {
        message: "Invalid refresh token",
        errorCode: "INVALID_TOKEN",
      },
      NotBeforeError: {
        message: "Token not yet active",
        errorCode: "TOKEN_NOT_ACTIVE",
      },
    };

    const errorConfig = errorMap[error.name] || {
      message: "Session invalid. Please login again.",
      errorCode: "SESSION_INVALID",
    };

    return apiResponseManager(req, res, {
      statusCode: 401,
      success: false,
      ...errorConfig,
    });
  }
};

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
      console.warn(
        `Failed email verification attempt with code: ${code.substring(
          0,
          8
        )}...`
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

    // ✅ NON-BLOCKING: Send welcome email without delaying response
    setImmediate(async () => {
      try {
        await sendWelcomeEmail(
          user.email,
          `${user.firstname} ${user.lastname}`
        );
        console.log(`✅ Welcome email sent to: ${user.email}`);
      } catch (emailError) {
        console.error("❌ Failed to send welcome email:", emailError.message);
        // User is already verified - email failure is non-critical
      }
    });

    // ✅ IMMEDIATE RESPONSE - User doesn't wait for emails
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
    console.error("Email verification error:", error);

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

    // ✅ SECURITY: Always return same response structure
    const successResponse = {
      statusCode: 200,
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    };

    // Case 1: User doesn't exist
    if (!user) {
      console.warn(
        `Password reset attempt for non-existent email: ${email} from IP: ${clientIP}`
      );
      return apiResponseManager(req, res, successResponse);
    }

    // Case 2: User already has active reset token
    if (user.resetPasswordToken && user.resetPasswordExpiresAt > new Date()) {
      console.log(
        `Password reset already active for user: ${user.email} from IP: ${clientIP}`
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

    // ✅ NON-BLOCKING: Send email
    setImmediate(async () => {
      try {
        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}&id=${user._id}`;
        await sendPasswordResetEmail(user.email, resetUrl, user.firstname);
        console.log(`✅ Password reset email sent to: ${user.email}`);
      } catch (emailError) {
        console.error(
          "❌ Failed to send password reset email:",
          emailError.message
        );
        // User still gets success response - email is non-critical
      }
    });

    console.log(
      `Password reset initiated for user: ${user.email} from IP: ${clientIP}`
    );

    return apiResponseManager(req, res, successResponse);
  } catch (error) {
    console.error("Forgot password error:", error);

    // Even in error, return the same success response for security
    return apiResponseManager(req, res, {
      statusCode: 200, // Still 200 to prevent user enumeration
      success: true,
      message: "If the email exists, a password reset link has been sent.",
    });
  }
};

// Rate limiting helpers
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
      console.warn(
        `Invalid password reset token attempt: ${token.substring(0, 16)}...`
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

    // ✅ SECURITY: Reset login lock and attempts
    user.isLocked = false;
    user.lockUntil = undefined;
    user.loginAttempts = 0;

    // ✅ SECURITY: Invalidate all existing sessions
    user.tokenVersion += 1;
    user.refreshToken = null;

    // ✅ SECURITY: Update security timestamps
    user.lastPasswordChange = new Date();
    user.lastSecurityEvent = new Date();
    user.lastLogin = new Date(); // Optional: count as a login event

    await user.save();

    // ✅ NON-BLOCKING: Send success email without delaying response
    setImmediate(async () => {
      try {
        await sendResetSuccessEmail(user.email, user.firstname);
        console.log(`✅ Password reset success email sent to: ${user.email}`);
      } catch (emailError) {
        console.error(
          "❌ Failed to send password reset success email:",
          emailError.message
        );
        // Non-critical - password was still reset successfully
      }
    });

    // Log security event
    console.log(`Password reset completed for user: ${user.email}`);

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
    console.error("Reset password error:", error);

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

// export const handleRefreshToken = async (req, res) => {
//   const cookies = req?.cookies;
//   const cookieName = "jwt_client";

//   if (!cookies[cookieName]) {
//     return apiResponseManager(req, res, {
//       statusCode: 401,
//       success: false,
//       message: "Unauthorized",
//       errorDetails: "Unauthorized",
//       requestId: req?.requestId,
//     });
//   }

//   try {
//     const refreshToken = cookies[cookieName];
//     const foundUser = await User.findOne({ refreshToken });

//     if (!foundUser) {
//       clearCookie(res, cookieName);
//       return apiResponseManager(req, res, {
//         statusCode: 401,
//         success: false,
//         message: "Unauthorized",
//         errorDetails: "Unauthorized",
//         requestId: req?.requestId,
//       });
//     }

//     // Verify the refresh token
//     const decoded = await verifyJwt(
//       refreshToken,
//       process.env.REFRESH_TOKEN_SECRET
//     );

//     if (
//       foundUser.email !== decoded.email ||
//       foundUser._id.toString() !== decoded.userId
//     ) {
//       clearCookie(res, cookieName);
//       return apiResponseManager(req, res, {
//         statusCode: 401,
//         success: false,
//         message: "Forbidden",
//         errorDetails: "Forbidden",
//         requestId: req?.requestId,
//       });
//     }

//     // Generate new tokens (only access token will be returned)
//     const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
//       foundUser
//     );

//     // Optional: If you want to re-enable rotation, uncomment the following lines
//     await foundUser.updateOne({ refreshToken: newRefreshToken });
//     const cookieExpiry = 24 * 60 * 60 * 1000; // 24 hours
//     setCookie(res, cookieName, newRefreshToken, {
//       maxAge: cookieExpiry,
//       expires: new Date(Date.now() + cookieExpiry), // Set the expiration time of the cookie to 24 hours
//     });

//     const excludedFields = ["password", "refreshToken"];
//     const userDataObject = await sanitizeUserForResponse(
//       foundUser,
//       excludedFields
//     );

//     // Send back the new access token and user data
//     apiResponseManager(req, res, {
//       statusCode: 200,
//       success: true,
//       message: "Token refreshed successfully",
//       data: {
//         user: userDataObject,
//         accessToken,
//       },
//       requestId: req?.requestId,
//     });
//   } catch (error) {
//     console.error(error);
//     return apiResponseManager(req, res, {
//       statusCode: 500,
//       success: false,
//       message: "Internal Server Error",
//       errorDetails: error.message,
//       requestId: req?.requestId,
//     });
//   }
// };

// // Controller for logout

// export const handleLogout = async (req, res) => {
//   const cookieName = "jwt_client";

//   const cookies = req.cookies;
//   if (!cookies[cookieName]) {
//     return apiResponseManager(req, res, {
//       statusCode: 204,
//       success: false,
//       message: "Logout successful!",
//       errorDetails: "NoContent",
//       requestId: req?.requestId,
//     });
//   }

//   const refreshToken = cookies[cookieName];

//   // Is refreshToken in db?
//   const foundUser = await User.findOne({ refreshToken }).exec();
//   if (!foundUser) {
//     // clearCookie(res, cookieName);
//     return apiResponseManager(req, res, {
//       statusCode: 204,
//       success: false,
//       message: "Logout successful!",
//       errorDetails: "NoContent",
//       requestId: req?.requestId,
//     });
//   }

//   // Delete refreshToken in db
//   foundUser.refreshToken = "";
//   await foundUser.save();

//   // clearCookie(res, cookieName);
//   return apiResponseManager(req, res, {
//     statusCode: 204,
//     success: false,
//     message: "Logout successful!",
//     errorDetails: "NoContent",
//     requestId: req?.requestId,
//   });
// };

function verifyJwt(token, secret) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

// export const handleLogin = async (req, res) => {
//   const { email, password: providedPassword } = req.body;

//   if (!email || !providedPassword) {
//     return apiResponseManager(req, res, {
//       statusCode: 400,
//       success: false,
//       message: "Email and password are required.",
//       errorDetails: "Missing fields",
//     });
//   }

//   try {
//     const foundUser = await User.findOne({ email }).exec();

//     // Avoid revealing whether email or password is incorrect
//     if (!foundUser) {
//       return apiResponseManager(req, res, {
//         statusCode: 404,
//         success: false,
//         message: "Invalid email or password.",
//         errorDetails: "Invalid credentials",
//       });
//     }

//     const match = await bcrypt.compare(providedPassword, foundUser.password);

//     if (!match) {
//       return apiResponseManager(req, res, {
//         statusCode: 401,
//         success: false,
//         message: "Invalid email or password.",
//         errorDetails: "Invalid credentials",
//       });
//     }

//     const { accessToken, refreshToken } = await generateTokens(foundUser);

//     const excludedFields = ["password", "refreshToken"];
//     const userDataObject = await sanitizeUserForResponse(foundUser, excludedFields);

//     const cookieName = `jwt_client`;
//     const cookieExpiry = 24 * 60 * 60 * 1000; // 24 hours

//     setCookie(res, cookieName, refreshToken, {
//       maxAge: cookieExpiry,
//       expires: new Date(Date.now() + cookieExpiry), // Set the expiration time of the cookie to 24 hours
//     });

//     // Update the refresh token in the database
//     foundUser.refreshToken = refreshToken;
//     await foundUser.save();

//     return apiResponseManager(req, res, {
//       statusCode: 200,
//       success: true,
//       message: "Login successful",
//       data: {
//         user: userDataObject,
//         accessToken,
//       },
//     });
//   } catch (error) {
//     console.error("Error in login process: ", error);
//     return apiResponseManager(req, res, {
//       statusCode: 500,
//       success: false,
//       message: "Internal Server Error while logging in.",
//       errorDetails: "Internal Server Error",
//     });
//   }
// };

// httpOnly: true, which means the cookie is only accessible through HTTP requests and not through JavaScript.
// sameSite: "None", which indicates that the cookie can be sent in cross-origin requests.
// secure: true, which means the cookie will only be sent over HTTPS.
// maxAge: 24 * 60 * 60 * 1000, which sets the expiration time of the cookie to 24 hours.

// Controller for refresh token

// Enhanced refresh token endpoint

// 🔍 MINOR IMPROVEMENTS NEEDED
// 1. Monitoring & Observability
// javascript
// // Add these metrics:
// - Failed login attempts per IP
// - Token refresh frequency per user
// - Blacklist size monitoring
// - Registration success/failure rates
// 2. Enhanced Validation
// javascript
// // Consider adding:
// - Device fingerprinting for suspicious logins
// - Geographic location checks
// - User-agent validation
// 3. Backup Security Layers
// javascript
// // Optional enhancements:
// - 2FA integration hooks
// - Suspicious activity alerts
// - Session length limits
// 🎯 ARCHITECTURE SCORE: 9/10
