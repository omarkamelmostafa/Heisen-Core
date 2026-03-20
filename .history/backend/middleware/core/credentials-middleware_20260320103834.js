import { allowedOrigins } from "../../config/allowed-origins.js";
import logger from "../../utilities/general/logger.js";

export const credentialsMiddleware = (req, res, next) => {
  const origin = (JSON.stringify(req.headers.origin));
  const userAgent = req.get("User-Agent") || "Unknown";
  const ip = req.ip || req.connection.remoteAddress;

  // Bypass credentials handling for static assets and health checks
  if (shouldBypassCredentials(req)) {
    logger.debug({ url: req.url }, "CORS bypassed for non-browser request");
    return next();
  }

  // If the origin is in the allowedOrigins list, apply CORS and credentials headers
  if (allowedOrigins.includes(origin)) {
    applyCORSHeaders(res, origin);

    logger.info({ origin, ip }, "CORS allowed");

    // Handle preflight requests (OPTIONS method)
    if (req.method === "OPTIONS") {
      logger.debug({ origin: req.headers.origin }, "Preflight request handled");
      return res.sendStatus(200);
    }
  } else if (origin) {
    // Log rejected origins for debugging and security monitoring
    logRejectedOrigin(req, origin, ip, userAgent);
  }

  next();
};

// Helper function to check if request should bypass credentials
const shouldBypassCredentials = (req) => {
  const bypassPaths = [
    "/assets",
    "/favicon.ico",
    "/health",
    "/robots.txt",
    "/public",
  ];

  return bypassPaths.some((path) => req.url.startsWith(path));
};

// Helper function to apply CORS headers
const applyCORSHeaders = (res, origin) => {
  res.header("Access-Control-Allow-Origin", origin);
  res.header("Access-Control-Allow-Credentials", "true");
  res.header(
    "Access-Control-Allow-Methods",
    process.env.ALLOWED_METHODS || "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  res.header(
    "Access-Control-Allow-Headers",
    process.env.ALLOWED_HEADERS ||
    "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key"
  );

  // Optional: Add exposed headers if needed
  if (process.env.EXPOSED_HEADERS) {
    res.header("Access-Control-Expose-Headers", process.env.EXPOSED_HEADERS);
  }
};

// Helper function to log rejected origins
const logRejectedOrigin = (req, origin, ip, userAgent) => {
  const logData = {
    timestamp: new Date().toISOString(),
    rejectedOrigin: origin,
    ip: ip,
    userAgent: userAgent,
    path: req.path,
    method: req.method,
    referer: req.get("Referer"),
    allowedOrigins: allowedOrigins,
  };

  // Security log for potential threats
  logger.warn({ origin, ip }, "CORS rejected");

  // Detailed analytics for debugging
  logger.info({ origin, ip, method: req.method, url: req.url, userAgent, allowedOrigins }, "Rejected origin details");

  // Console warning for development
  if (process.env.NODE_ENV === "development") {
    console.warn(`🚫 CORS Rejected: ${origin} trying to access ${req.path}`);
  }
};

// import { allowedOrigins } from "../config/allowed-origins.js";

// export const credentials = (req, res, next) => {
// Bypass credentials handling for static assets like /assets/* and /favicon.ico
// if (req.url.startsWith("/assets") || req.url === "/favicon.ico") {
//   console.log(
//     "Bypassing credentials handling for static assets or favicon.",
//     req.url
//   );
//   return next(); // Skip credentials check for assets and favicon
// }

//   const origin = req.headers.origin;

// If the origin is in the allowedOrigins list, apply CORS and credentials headers
//   if (allowedOrigins.includes(origin)) {
//     res.header("Access-Control-Allow-Origin", origin); // Set the allowed origin
//     res.header("Access-Control-Allow-Credentials", "true"); // Allow credentials
//     res.header(
//       "Access-Control-Allow-Methods",
//       "GET, POST, PUT, DELETE, OPTIONS"
//     ); // Allowed HTTP methods

//     res.header(
//       "Access-Control-Allow-Headers",
//       "Origin, X-Requested-With, Content-Type, Accept, Authorization"
//     ); // Allowed headers, including Authorization

//     // Handle preflight requests (OPTIONS method)
//     if (req.method === "OPTIONS") {
//       return res.sendStatus(200); // Respond to preflight with 200 OK
//     }
//   }
//   next();
// };
