// backend/middleware/core/content-type-negotiation-middleware.js
import accepts from "accepts";
import logger from "../../utilities/general/logger.js";

// Define the supported content types
const supportedTypes = [
  "json",
  "html",
  "text/plain",
  "image/jpeg",
  "image/png",
  "image/gif",
  "audio/mpeg",
  "video/mp4",
  "application/javascript",
  "text/css",
  "application/xml",
  "application/pdf",
  "application/x-www-form-urlencoded",
];

// Helper function to detect device type from user agent
const detectDeviceType = (userAgent) => {
  if (!userAgent) return "unknown";

  const ua = userAgent.toLowerCase();
  if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
    return "mobile";
  } else if (/tablet/.test(ua)) {
    return "tablet";
  } else {
    return "desktop";
  }
};

// Helper function to detect browser from user agent
const detectBrowser = (userAgent) => {
  if (!userAgent) return "unknown";

  const ua = userAgent.toLowerCase();
  if (/chrome/.test(ua) && !/edg/.test(ua)) return "chrome";
  if (/firefox/.test(ua)) return "firefox";
  if (/safari/.test(ua) && !/chrome/.test(ua)) return "safari";
  if (/edg/.test(ua)) return "edge";
  if (/opera|opr/.test(ua)) return "opera";

  return "other";
};

export const contentTypeNegotiationMiddleware = (req, res, next) => {
  const accept = accepts(req);
  const preferredType = accept.type(supportedTypes);

  // Enhanced analytics logging
  const analyticsData = {
    preferredType: preferredType || "none",
    timestamp: new Date().toISOString(),
    url: req.originalUrl,
    method: req.method,
    userAgent: req.get("User-Agent"),
    deviceType: detectDeviceType(req.get("User-Agent")),
    browser: detectBrowser(req.get("User-Agent")),
    ip: req.ip || req.connection.remoteAddress,
    acceptedLanguages: req.get("Accept-Language"),
    acceptedEncodings: req.get("Accept-Encoding"),
  };

  // Log analytics for all requests
  logger.info(analyticsData, "Content negotiation analytics");

  // Optional: Log a simplified version to console for development
  if (process.env.NODE_ENV === "development") {

  }

  // console.log(
  //   `📊 Content Negotiation - Device: ${analyticsData.deviceType}, Browser: ${analyticsData.browser}, Preferred Type: ${analyticsData.preferredType}`
  // );

  // Set appropriate Content-Type header based on the negotiated type
  switch (preferredType) {
    case "json":
      res.setHeader("Content-Type", "application/json");
      break;
    case "html":
      res.setHeader("Content-Type", "text/html");
      break;
    case "text/plain":
      res.setHeader("Content-Type", "text/plain");
      break;
    case "image/jpeg":
      res.setHeader("Content-Type", "image/jpeg");
      break;
    case "image/png":
      res.setHeader("Content-Type", "image/png");
      break;
    case "image/gif":
      res.setHeader("Content-Type", "image/gif");
      break;
    case "audio/mpeg":
      res.setHeader("Content-Type", "audio/mpeg");
      break;
    case "video/mp4":
      res.setHeader("Content-Type", "video/mp4");
      break;
    case "application/javascript":
      res.setHeader("Content-Type", "application/javascript");
      break;
    case "text/css":
      res.setHeader("Content-Type", "text/css");
      break;
    case "application/xml":
      res.setHeader("Content-Type", "application/xml");
      break;
    case "application/pdf":
      res.setHeader("Content-Type", "application/pdf");
      break;
    case "application/x-www-form-urlencoded":
      res.setHeader("Content-Type", "application/x-www-form-urlencoded");
      break;
    default:
      // If the preferred type is not found, log an error and respond with an error status
      logger.warn({ url: req.url, acceptHeader: req.headers.accept }, "No acceptable content types found");
      return res
        .status(406)
        .json({ message: "No acceptable content types found." });
  }

  next();
};

// Optional: Export analytics functions for reuse
export const analyticsUtils = {
  detectDeviceType,
  detectBrowser,
};
