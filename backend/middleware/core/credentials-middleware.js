// credentials-middleware.js

import { allowedOrigins } from "../../config/allowed-origins.js";
import { logMessage } from "./logging-middleware.js";

export const credentialsMiddleware = (req, res, next) => {
  const origin = req.headers.origin;
  const userAgent = req.get("User-Agent") || "Unknown";
  const ip = req.ip || req.connection.remoteAddress;

  // Bypass credentials handling for static assets and health checks
  if (shouldBypassCredentials(req)) {
    logMessage(
      `CORS bypassed for static asset: ${req.method} ${req.url}`,
      "cors.log",
      "debug"
    );
    return next();
  }

  // If the origin is in the allowedOrigins list, apply CORS and credentials headers
  if (allowedOrigins.includes(origin)) {
    applyCORSHeaders(res, origin);

    logMessage(
      `CORS allowed - Origin: ${origin}, IP: ${ip}, Path: ${req.path}`,
      "cors.log",
      "info"
    );

    // Handle preflight requests (OPTIONS method)
    if (req.method === "OPTIONS") {
      logMessage(
        `Preflight request handled - Origin: ${origin}, Path: ${req.path}`,
        "cors.log",
        "debug"
      );
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
  logMessage(
    `CORS REJECTED - Origin: ${origin}, IP: ${ip}, Path: ${req.path}`,
    "security.log",
    "warn"
  );

  // Detailed analytics for debugging
  logMessage(
    `Rejected origin details: ${JSON.stringify(logData)}`,
    "cors-analytics.log",
    "info"
  );

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
