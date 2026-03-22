import { allowedOrigins } from "./allowed-origins.js";

export const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Required for HttpOnly cookie-based auth
  optionsSuccessStatus: 200,
};

// config/cors-config.js
export const corsConfig = {
  // Allowed HTTP methods (can be overridden by environment variable)
  allowedMethods:
    process.env.ALLOWED_METHODS || "GET, POST, PUT, DELETE, OPTIONS, PATCH",

  // Allowed headers (can be overridden by environment variable)
  allowedHeaders:
    process.env.ALLOWED_HEADERS ||
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key, X-Request-ID",

  // Exposed headers (optional)
  exposedHeaders: process.env.EXPOSED_HEADERS || "",

  // Preflight max age in seconds
  preflightMaxAge: process.env.PREFLIGHT_MAX_AGE || 86400, // 24 hours

  // Rate limiting configuration
  rateLimit: {
    windowMs: parseInt(process.env.CORS_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.CORS_RATE_LIMIT_MAX) || 100, // 100 requests per window
  },

  // Paths that bypass CORS checks
  bypassPaths: [
    "/assets",
    "/favicon.ico",
    "/health",
    "/robots.txt",
    ...(process.env.CORS_BYPASS_PATHS
      ? process.env.CORS_BYPASS_PATHS.split(",")
      : []),
  ],
};
