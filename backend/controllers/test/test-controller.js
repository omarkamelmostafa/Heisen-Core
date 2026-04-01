// backend/controllers/test/test-controller.js

import { getSanitizationStats } from "../../middleware/security/sanitize-middleware.js";
import { logHelmetConfig } from "../../middleware/security/helmet-middleware.js";

// Health check
export const healthCheck = (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
};

// Test error handling
export const testError = (req, res, next) => {
  // Simulate different types of errors based on query params
  const errorType = req.query.type || "generic";

  switch (errorType) {
    case "validation":
      const validationError = new Error("Validation failed");
      validationError.status = 400;
      validationError.details = { email: "Invalid email format" };
      throw validationError;

    case "database":
      const dbError = new Error("Database connection failed");
      dbError.status = 503;
      throw dbError;

    case "authentication":
      const authError = new Error("Authentication required");
      authError.status = 401;
      throw authError;

    case "async":
      return Promise.reject(new Error("Async error demonstration"));

    default:
      res.status(500).json({
        message: "This is a test error!",
        requestId: req.requestId,
        timestamp: new Date().toISOString(),
      });
  }
};

// Test Helmet security headers
export const testHelmet = (req, res) => {
  const securityHeaders = {
    message: "Helmet Security Headers Test",
    instructions: "Check response headers in browser dev tools → Network tab",
    yourRequest: {
      ip: req.ip,
      userAgent: req.get("User-Agent"),
      requestId: req.requestId,
    },
    expectedHeaders: {
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "X-XSS-Protection": "1; mode=block",
      "Strict-Transport-Security":
        "max-age=31536000; includeSubDomains; preload",
      "Content-Security-Policy": "Present",
      "X-Powered-By": "Hidden (should not appear)",
    },
    actualHeaders: {
      "X-Content-Type-Options": res.get("X-Content-Type-Options"),
      "X-Frame-Options": res.get("X-Frame-Options"),
      "X-XSS-Protection": res.get("X-XSS-Protection"),
      "Strict-Transport-Security": res.get("Strict-Transport-Security"),
      "Content-Security-Policy": res.get("Content-Security-Policy")
        ? "Present"
        : "Missing",
      "X-Powered-By": res.get("X-Powered-By") || "HIDDEN ✅",
    },
    helmetConfig: logHelmetConfig(),
  };

  res.json(securityHeaders);
};

// Test Sanitize middleware
export const testSanitize = (req, res) => {
  const testResults = {
    message: "Sanitize Middleware Test",
    instructions: "Check server logs for sanitization details",
    receivedData: {
      body: req.body,
      query: req.query,
      params: req.params,
      headers: {
        "user-agent": req.get("User-Agent"),
        referer: req.get("Referer"),
      },
    },
    sanitizationStats: getSanitizationStats(),
    testPayloads: {
      example1: 'Send: { "name": "John<script>alert(\'xss\')</script>" }',
      example2: "Visit: /test/sanitize?search=<img src=x onerror=alert(1)>",
      example3: 'POST with: <div onclick="malicious()">Click</div>',
    },
  };

  res.json(testResults);
};

// Test dangerous input specifically
export const testDangerousInput = (req, res) => {
  const dangerousData = {
    message: "Dangerous Input Test - Check logs for sanitization!",
    warning: "This endpoint accepts dangerous input to test sanitization",
    received: {
      body: req.body,
      query: req.query,
      params: req.params,
    },
    securityStatus: "If you see this response, sanitization worked! ✅",
    nextSteps: [
      "Check security.log for sanitization entries",
      "Check sanitization-audit.log for detailed reports",
      "Verify dangerous code was removed/neutralized",
    ],
  };

  res.json(dangerousData);
};

// Test both middlewares together
export const testSecurityComprehensive = (req, res) => {
  const comprehensiveTest = {
    title: "Comprehensive Security Test",
    description: "Testing both Helmet and Sanitize middlewares together",

    helmet: {
      status: "Active",
      headers: {
        "X-Frame-Options": res.get("X-Frame-Options"),
        "X-XSS-Protection": res.get("X-XSS-Protection"),
        "Content-Security-Policy": res.get("Content-Security-Policy")
          ? "Active"
          : "Inactive",
      },
    },

    sanitize: {
      status: "Active",
      stats: getSanitizationStats(),
      receivedInput: {
        query:
          Object.keys(req.query).length > 0 ? req.query : "No query parameters",
        body:
          Object.keys(req.body).length > 0
            ? "Data received (check logs)"
            : "No body data",
      },
    },

    requestInfo: {
      requestId: req.requestId,
      ip: req.ip,
      method: req.method,
      url: req.originalUrl,
      timestamp: new Date().toISOString(),
    },

    testInstructions: {
      step1: "Send malicious data to test sanitization",
      step2: "Check response headers for Helmet protection",
      step3: "Review server logs for security events",
    },
  };

  res.json(comprehensiveTest);
};

// Get security statistics
export const getSecurityStats = (req, res) => {
  const stats = {
    sanitization: getSanitizationStats(),
    server: {
      uptime: process.uptime(),
      nodeVersion: process.version,
      platform: process.platform,
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || "development",
    },
    timestamp: new Date().toISOString(),
  };

  res.json(stats);
};
