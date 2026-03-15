import rateLimit from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redis from "../../config/redis.js";

// Rate limiting middleware configuration
export function createRateLimiterMiddleware(options = {}) {
  return rateLimit({
    windowMs: options.windowMs || 15 * 60 * 1000, // 15 minutes
    limit: options.max || options.limit || 10000, // Max requests
    message: "Too many requests from this IP, please try again later.",
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    // Redis store configuration
    store: new RedisStore({
      sendCommand: (...args) => redis.call(...args),
      prefix: options.prefix || "rl:", // Prefix for redis keys
    }),
    ...options,
  });
}

// 🧩 registration rate limiting logic has moved to auth-controller.js using direct Redis commands

