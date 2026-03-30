// backend/middleware/security/rate-limiters.js
// Endpoint-specific rate limiters for auth routes (FR-029).
// All use Redis-backed express-rate-limit for persistence across restarts.

import { createRateLimiterMiddleware } from "./rate-limiter-middleware.js";

/**
 * Login: 10 requests per 5 minutes per IP
 */
export const loginLimiter = createRateLimiterMiddleware({
  windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS, 10) || 5 * 60 * 1000,
  max: Math.max(parseInt(process.env.RATE_LIMIT_LOGIN_MAX, 10) || 10, 10), // 10 requests per 5 minutes per IP
  message: {
    text: "Too many login attempts. Please try again in 15 minutes.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:login:",
});

/**
 * Register: 5 requests per hour per IP
 */
export const registerLimiter = createRateLimiterMiddleware({
  windowMs: parseInt(process.env.RATE_LIMIT_REGISTER_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_REGISTER_MAX, 10) || 5, // 5 requests per hour per IP 
  message: {
    text: "Too many registration attempts. Please try again later.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:register:",
});

/**
 * Forgot Password: 3 requests per hour per IP
 */
export const forgotPasswordLimiter = createRateLimiterMiddleware({
  windowMs: parseInt(process.env.RATE_LIMIT_FORGOT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_FORGOT_MAX, 10) || 3,
  message: {
    text: "Too many password reset attempts. Please try again later.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:forgot:",
});

/**
 * Refresh Token: 30 requests per minute per IP
 */
export const refreshLimiter = createRateLimiterMiddleware({
  windowMs: parseInt(process.env.RATE_LIMIT_REFRESH_WINDOW_MS, 10) || 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_REFRESH_MAX, 10) || 30,
  message: {
    text: "Too many refresh attempts. Please try again shortly.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:refresh:",
});

/**
 * Reset Password: 3 requests per hour per IP
 */
export const resetPasswordLimiter = createRateLimiterMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    text: "Too many password reset attempts. Please try again in 15 minutes.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:reset:",
});

/**
 * Verify Email: 10 requests per hour per IP
 */
export const verifyEmailLimiter = createRateLimiterMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    text: "Too many verification attempts. Please try again in 15 minutes.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:verify:",
});

/**
 * Resend Verification: 3 requests per hour per IP
 */
export const resendVerificationLimiter = createRateLimiterMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: {
    text: "Too many resend attempts. Please try again in 15 minutes.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:resend:",
});

/**
 * User Me: 60 requests per hour per IP
 */
export const userMeLimiter = createRateLimiterMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: {
    text: "Too many requests. Please try again later.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:userme:",
});

/**
 * Health: 30 requests per hour per IP
 */
export const healthLimiter = createRateLimiterMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    text: "Too many health check requests.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:health:",
});

/**
 * Logout: 30 requests per hour per IP
 */
export const logoutLimiter = createRateLimiterMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    text: "Too many logout attempts. Please try again later.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:logout:",
});

export const updateProfileLimiter = createRateLimiterMiddleware({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    text: "Too many profile update attempts. Please try again later.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:updateprofile:",
});

export const emailChangeLimiter = createRateLimiterMiddleware({
  windowMs: 60 * 60 * 1000,
  max: 3,
  message: {
    text: "Too many email change requests. Please try again later.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:emailchange:",
});
