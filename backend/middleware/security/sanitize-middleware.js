import xss from "xss";
import logger from "../../utilities/general/logger.js";

// XSS configuration options
const xssOptions = {
  whiteList: {}, // Empty object means no HTML tags are allowed
  stripIgnoreTag: true, // Strip HTML tags instead of escaping
  stripIgnoreTagBody: ["script", "style", "iframe", "object", "embed"], // Strip these tags completely
  allowCommentTag: false, // Disallow HTML comments
  css: false, // Disable CSS filtering
  onIgnoreTag: (tag, html, options) => {
    // Custom handling for ignored tags
    return ""; // Completely remove any tags not in whitelist
  },
  onTagAttr: (tag, name, value, isWhiteAttr) => {
    // Remove all attributes including event handlers
    return "";
  },
};

// Relaxed configuration for specific endpoints that need HTML
export const xssConfigurations = {
  strict: xssOptions, // Default - no HTML allowed

  relaxed: {
    whiteList: {
      // Allow basic text formatting
      b: [],
      i: [],
      em: [],
      strong: [],
      u: [],
      br: [],
      p: [],
      div: [],
      span: [],
    },
    stripIgnoreTag: true,
    css: false,
    onTagAttr: (tag, name, value, isWhiteAttr) => {
      // Only allow class and style attributes
      if (name === "class" || name === "style") {
        return `${name}="${xss.escapeAttrValue(value)}"`;
      }
      return "";
    },
  },

  html: {
    whiteList: {
      // Allow common HTML tags for rich content
      p: ["class"],
      div: ["class"],
      span: ["class"],
      h1: [],
      h2: [],
      h3: [],
      h4: [],
      h5: [],
      h6: [],
      b: [],
      i: [],
      u: [],
      em: [],
      strong: [],
      code: [],
      pre: [],
      blockquote: [],
      ul: [],
      ol: [],
      li: [],
      br: [],
      hr: [],
      a: ["href", "title", "target"], // Allow links with specific attributes
      img: ["src", "alt", "title", "width", "height"],
    },
    stripIgnoreTag: true,
    css: false,
    onTagAttr: (tag, name, value, isWhiteAttr) => {
      // Sanitize URL attributes
      if (name === "href" || name === "src") {
        if (value.startsWith("javascript:") || value.startsWith("data:")) {
          return ""; // Remove dangerous protocols
        }
        return `${name}="${xss.escapeAttrValue(value)}"`;
      }
      return `${name}="${xss.escapeAttrValue(value)}"`;
    },
  },
};

// Sanitization statistics for monitoring
let sanitizationStats = {
  totalRequests: 0,
  sanitizedRequests: 0,
  totalSanitizations: 0,
  highRiskBlocks: 0,
  lastReset: new Date().toISOString(),
};

// High-risk patterns that indicate potential attacks
const highRiskPatterns = [
  "script",
  "javascript:",
  "vbscript:",
  "expression(",
  "onload=",
  "onerror=",
  "onclick=",
  "onmouseover=",
  "eval(",
  "alert(",
  "document.cookie",
  "window.location",
  "<iframe",
  "<object",
  "base64",
  "data:text/html",
];

// Recursive sanitization function with detailed logging
const sanitizeInput = (input, path = "root", config = xssOptions) => {
  const sanitizationLog = [];

  const sanitizeRecursive = (value, currentPath) => {
    if (typeof value === "string") {
      const originalValue = value;
      const sanitizedValue = xss(value, config);

      // Check if sanitization changed the value
      if (originalValue !== sanitizedValue) {
        const riskLevel = assessRiskLevel(originalValue);

        sanitizationLog.push({
          path: currentPath,
          original: truncateForLog(originalValue),
          sanitized: truncateForLog(sanitizedValue),
          riskLevel: riskLevel,
          timestamp: new Date().toISOString(),
          type: "XSS sanitized",
        });

        if (riskLevel === "HIGH") {
          sanitizationStats.highRiskBlocks++;
        }
      }
      return sanitizedValue;
    } else if (Array.isArray(value)) {
      return value.map((element, index) =>
        sanitizeRecursive(element, `${currentPath}[${index}]`)
      );
    } else if (typeof value === "object" && value !== null) {
      const sanitizedObject = Array.isArray(value) ? [] : {};
      Object.keys(value).forEach((key) => {
        sanitizedObject[key] = sanitizeRecursive(
          value[key],
          `${currentPath}.${key}`
        );
      });
      return sanitizedObject;
    }

    return value;
  };

  const result = sanitizeRecursive(input, path);
  return { result, sanitizationLog };
};

// Assess risk level of a string
const assessRiskLevel = (value) => {
  const lowerValue = value.toLowerCase();
  const highRiskCount = highRiskPatterns.filter((pattern) =>
    lowerValue.includes(pattern.toLowerCase())
  ).length;

  if (highRiskCount >= 2) return "HIGH";
  if (highRiskCount >= 1) return "MEDIUM";
  return "LOW";
};

// Truncate long values for logging
const truncateForLog = (value, maxLength = 200) => {
  if (typeof value === "string" && value.length > maxLength) {
    return value.substring(0, maxLength) + "... [truncated]";
  }
  return value;
};

// Main sanitization middleware
export const createSanitizeMiddleware = (req, res, next) => {
  const requestId = req.requestId || "unknown";
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get("User-Agent") || "Unknown";

  sanitizationStats.totalRequests++;
  let totalSanitizations = 0;
  const requestSanitizationLog = [];
  let maxRiskLevel = "LOW";

  // Determine appropriate XSS configuration based on route
  const getConfigForRoute = () => {
    // Use relaxed config for specific endpoints that need HTML
    if (
      req.path.includes("/rich-content") ||
      req.path.includes("/admin/editor")
    ) {
      return xssConfigurations.relaxed;
    }
    // Default to strict config
    return xssConfigurations.strict;
  };

  const currentConfig = getConfigForRoute();

  // Sanitize request body
  if (req.body && Object.keys(req.body).length > 0) {
    const { result, sanitizationLog } = sanitizeInput(
      req.body,
      "body",
      currentConfig
    );
    req.body = result;
    requestSanitizationLog.push(...sanitizationLog);
    totalSanitizations += sanitizationLog.length;

    // Update max risk level
    sanitizationLog.forEach((log) => {
      if (log.riskLevel === "HIGH") maxRiskLevel = "HIGH";
      else if (log.riskLevel === "MEDIUM" && maxRiskLevel !== "HIGH")
        maxRiskLevel = "MEDIUM";
    });
  }

  // Sanitize query parameters
  if (req.query && Object.keys(req.query).length > 0) {
    const { result, sanitizationLog } = sanitizeInput(
      req.query,
      "query",
      currentConfig
    );
    req.query = result;
    requestSanitizationLog.push(...sanitizationLog);
    totalSanitizations += sanitizationLog.length;
  }

  // Sanitize URL parameters
  if (req.params && Object.keys(req.params).length > 0) {
    const { result, sanitizationLog } = sanitizeInput(
      req.params,
      "params",
      currentConfig
    );
    req.params = result;
    requestSanitizationLog.push(...sanitizationLog);
    totalSanitizations += sanitizationLog.length;
  }

  // Log sanitization activity if anything was sanitized
  if (totalSanitizations > 0) {
    sanitizationStats.sanitizedRequests++;
    sanitizationStats.totalSanitizations += totalSanitizations;

    const securityEvent = {
      timestamp: new Date().toISOString(),
      requestId: requestId,
      ip: ip,
      method: req.method,
      url: req.originalUrl,
      userAgent: userAgent,
      totalSanitizations: totalSanitizations,
      riskLevel: maxRiskLevel,
      configUsed:
        currentConfig === xssConfigurations.strict ? "strict" : "relaxed",
      sanitizationDetails: requestSanitizationLog,
    };

    // Log based on risk level
    const logLevel =
      maxRiskLevel === "HIGH"
        ? "error"
        : maxRiskLevel === "MEDIUM"
        ? "warn"
        : "info";

    logger[logLevel](
      { riskLevel: maxRiskLevel, totalSanitizations, requestId },
      "XSS sanitization applied"
    );

    // Detailed audit log
    logger.info({ securityEvent }, "Sanitization audit");

    // Development console output
    if (process.env.NODE_ENV === "development" && totalSanitizations > 0) {
      const emoji = maxRiskLevel === "HIGH" ? "🚨" : "🛡️";
      console.log(
        `${emoji} XSS Protection: Sanitized ${totalSanitizations} items (${maxRiskLevel} risk) in ${requestId}`
      );
    }
  }

  // Add security headers that complement sanitization
  enhanceSecurityHeaders(res);

  next();
};

// Enhance security headers
const enhanceSecurityHeaders = (res) => {
  res.header("X-Content-Type-Options", "nosniff");
  res.header("X-Frame-Options", "DENY");
  res.header("X-XSS-Protection", "1; mode=block");
  res.header("Referrer-Policy", "strict-origin-when-cross-origin");
};

// Export utility functions
export const getSanitizationStats = () => ({
  ...sanitizationStats,
  sanitizationRate:
    sanitizationStats.totalRequests > 0
      ? (
          (sanitizationStats.sanitizedRequests /
            sanitizationStats.totalRequests) *
          100
        ).toFixed(2) + "%"
      : "0%",
  averageSanitizationsPerRequest:
    sanitizationStats.sanitizedRequests > 0
      ? (
          sanitizationStats.totalSanitizations /
          sanitizationStats.sanitizedRequests
        ).toFixed(2)
      : "0",
});

export const resetSanitizationStats = () => {
  sanitizationStats = {
    totalRequests: 0,
    sanitizedRequests: 0,
    totalSanitizations: 0,
    highRiskBlocks: 0,
    lastReset: new Date().toISOString(),
  };
};

// Export for testing
export { assessRiskLevel, highRiskPatterns };

// sanitize-middleware.js
// import xss from "xss";

// // Recursive sanitization function
// const sanitizeInput = (input) => {
//   if (typeof input === "string") {
//     // Sanitize string values
//     return xss(input);
//   } else if (Array.isArray(input)) {
//     // Recursively sanitize array elements
//     return input.map((element) => sanitizeInput(element));
//   } else if (typeof input === "object" && input !== null) {
//     // Recursively sanitize object values
//     Object.keys(input).forEach((key) => {
//       input[key] = sanitizeInput(input[key]);
//     });
//     return input;
//   }
//   // Return non-string, non-object, and non-array inputs as is
//   return input;
// };

// // Middleware to apply sanitization to all incoming requests
// export const createSanitizeMiddleware = (req, res, next) => {
//   // Sanitize the request body if present
//   if (req.body) {
//     req.body = sanitizeInput(req.body);
//   }

//   // Sanitize query parameters if present
//   if (req.query) {
//     req.query = sanitizeInput(req.query);
//   }

//   // Sanitize URL parameters if present
//   if (req.params) {
//     req.params = sanitizeInput(req.params);
//   }

//   next();
// };
