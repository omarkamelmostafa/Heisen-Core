// helmet-middleware.js

import helmet from "helmet";

// Production configuration with enhanced security
const productionConfig = {
  // ✅ CONTENT SECURITY POLICY
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // No 'unsafe-inline' - sanitization handles this
      styleSrc: ["'self'", "'unsafe-inline'"], // CSS often needs inline styles
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests:
        process.env.NODE_ENV === "production" ? [] : null,
    },
  },

  // ✅ CROSS-ORIGIN POLICIES
  crossOriginEmbedderPolicy: false, // Can enable if you don't need cross-origin embeds
  crossOriginOpenerPolicy: { policy: "same-origin" },
  crossOriginResourcePolicy: { policy: "same-origin" },

  // ✅ DNS & CLICKJACKING PROTECTION
  dnsPrefetchControl: { allow: false },
  frameguard: { action: "deny" }, // Prevents clickjacking

  // ✅ INFORMATION HIDING
  hidePoweredBy: true, // Remove X-Powered-By header

  // ✅ HTTPS ENFORCEMENT
  hsts: {
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true,
  },

  // ✅ INTERNET EXPLORER PROTECTIONS
  ieNoOpen: true,

  // ✅ MIME TYPE SECURITY
  noSniff: true, // Prevent MIME type sniffing

  // ✅ REFERRER POLICY
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },

  // ✅ XSS PROTECTION
  xssFilter: true, // Browser XSS filter

  // ✅ MODERN FEATURE CONTROL
  permissionsPolicy: {
    features: {
      camera: ["'none'"],
      microphone: ["'none'"],
      geolocation: ["'none'"],
      payment: ["'none'"],
      usb: ["'none'"],
      magnetometer: ["'none'"],
      accelerometer: ["'none'"],
      gyroscope: ["'none'"],
    },
  },
};

// Development configuration (more permissive)
const developmentConfig = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'", "http://localhost:*"],
      scriptSrc: ["'self'", "'unsafe-inline'", "http://localhost:*"], // Allow inline for dev
      styleSrc: ["'self'", "'unsafe-inline'", "http://localhost:*"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
      fontSrc: ["'self'", "data:", "https:", "http:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'self'", "http://localhost:*"],
    },
  },
  hsts: false, // Don't force HTTPS in development
  crossOriginResourcePolicy: { policy: "cross-origin" }, // More permissive for dev
};

// Choose configuration based on environment
const isProduction = process.env.NODE_ENV === "production";
const finalConfig = isProduction
  ? productionConfig
  : {
      ...productionConfig,
      ...developmentConfig,
    };

// Create and export the helmet middleware
export const helmetMiddleware = helmet(finalConfig);

// Export configurations for testing and transparency
export const helmetConfig = {
  production: productionConfig,
  development: developmentConfig,
  current: finalConfig,
  environment: process.env.NODE_ENV || "development",
};

// Helper function to log helmet configuration
export const logHelmetConfig = () => {
  const configSummary = {
    environment: helmetConfig.environment,
    cspEnabled: !!finalConfig.contentSecurityPolicy,
    hstsEnabled: !!finalConfig.hsts,
    crossOriginPolicy: finalConfig.crossOriginResourcePolicy?.policy,
  };

  console.log("🛡️ Helmet Security Configuration:");
  console.log(JSON.stringify(configSummary, null, 2));

  return configSummary;
};
