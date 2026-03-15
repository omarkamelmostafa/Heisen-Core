// backend/middleware/security/rate-limiters.js
// Endpoint-specific rate limiters for auth routes (FR-029).
// All use Redis-backed express-rate-limit for persistence across restarts.

import { createRateLimiterMiddleware } from "./rate-limiter-middleware.js";

/**
 * Login: 5 requests per 15 minutes per IP
 */
export const loginLimiter = createRateLimiterMiddleware({
  windowMs: parseInt(process.env.RATE_LIMIT_LOGIN_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: Math.max(parseInt(process.env.RATE_LIMIT_LOGIN_MAX, 10) || 5, 5), // i need to make it 10 requests per 5 minutes per IP
  message: {
    status: "error",
    message: "Too many login attempts. Please try again in 15 minutes.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:login:",
});

/**
 * Register: 3 requests per hour per IP
 */
export const registerLimiter = createRateLimiterMiddleware({
  windowMs: parseInt(process.env.RATE_LIMIT_REGISTER_WINDOW_MS, 10) || 60 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_REGISTER_MAX, 10) || 3,
  message: {
    status: "error",
    message: "Too many registration attempts. Please try again later.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:register:",
});

/**
 * Forgot Password: 3 requests per hour per IP
 */
export const forgotPasswordLimiter = createRateLimiterMiddleware({
  windowMs: parseInt(process.env.RATE_LIMIT_FORGOT_WINDOW_MS, 10) || 60 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_FORGOT_MAX, 10) || 3,
  message: {
    status: "error",
    message: "Too many password reset attempts. Please try again later.",
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
    status: "error",
    message: "Too many refresh attempts. Please try again shortly.",
    errorCode: "RATE_LIMITED",
  },
  prefix: "rl:refresh:",
});
