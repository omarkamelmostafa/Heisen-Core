// rateLimiterMiddleware.js
import rateLimit from "express-rate-limit";

// // Rate limiting middleware configuration
// const rateLimitOptions = {
//   windowMs: 10 * 60 * 1000, // 10 minutes
//   max: 10000, // Max 10000 requests per windowMs
//   message: "Too many requests from this IP, please try again later.",
// };

// // Creating the rate limiting middleware
// export const rateLimiterMiddleware = rateLimit(rateLimitOptions);

// Rate limiting middleware configuration
export function createRateLimiterMiddleware(options = {}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    max: options.max || 10000, // Max 100 requests per windowMs
    message: "Too many requests from this IP, please try again later.",
    ...options,
  });
}

// middleware/rate-limiter-middleware.js

/**
 * 🧩 registrationTimestamps is an in-memory rate-limiting store.
 * It tracks the timestamp of the last registration attempt per email or IP address.
 *
 * Structure example:
 * registrationTimestamps = Map {
 *   "user@example.com" => 1728123456789, // Timestamp of last attempt
 *   "192.168.1.10" => 1728123456790      // Timestamp of last IP attempt
 * }
 *
 * Used in: handleRegister controller
 */
export const registrationTimestamps = new Map();
