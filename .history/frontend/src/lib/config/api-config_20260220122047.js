// frontend/src/lib/config/api-config.js

/**
 * Advanced API Configuration
 * Comprehensive configuration for production-grade applications
 */

// ========================== 🌐 API Configuration ==========================

export const API_CONFIG = {
  // Base URL Configuration
  BASE_URL:
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  API_VERSION: process.env.NEXT_PUBLIC_API_VERSION || "1",
  API_PREFIX: "/api",

  // Full API URL construction
  get FULL_BASE_URL() {
    return `${this.BASE_URL}${this.API_PREFIX}/v${this.API_VERSION}`;
  },


  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Request Configuration
  TIMEOUT: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT, 10) || 30000, // Default: 30 seconds
  RETRY_ATTEMPTS: parseInt(process.env.NEXT_PUBLIC_API_RETRIES, 10) || 3,
  RETRY_DELAY: parseInt(process.env.NEXT_PUBLIC_API_RETRY_DELAY, 10) || 1000,
  MAX_CONTENT_LENGTH: 50 * 1024 * 1024, // 50MB
  MAX_BODY_LENGTH: 50 * 1024 * 1024, // 50MB

  // Cache Configuration
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  CACHE_ENABLED: true,

  // Security Configuration
  CSRF_ENABLED: true,
  XSS_PROTECTION: true,
  CONTENT_SECURITY_POLICY: true,

  // Performance Configuration
  REQUEST_DEBOUNCE: 300, // ms
  CONCURRENT_REQUESTS: 5,
  BATCH_REQUESTS: true,
  BATCH_INTERVAL: 100, // ms




  // Environment Specific Settings
  ENV: process.env.NODE_ENV || 'development',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
};


// ========================== 📋 HTTP Status Codes ==========================

export const HTTP_STATUS = {
  // 1xx Informational
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  PROCESSING: 102,
  EARLY_HINTS: 103,

  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION: 203,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,
  MULTI_STATUS: 207,
  ALREADY_REPORTED: 208,
  IM_USED: 226,

  // 3xx Redirection
  MULTIPLE_CHOICES: 300,
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  SEE_OTHER: 303,
  NOT_MODIFIED: 304,
  USE_PROXY: 305,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  PROXY_AUTHENTICATION_REQUIRED: 407,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  LENGTH_REQUIRED: 411,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  URI_TOO_LONG: 414,
  UNSUPPORTED_MEDIA_TYPE: 415,
  RANGE_NOT_SATISFIABLE: 416,
  EXPECTATION_FAILED: 417,
  IM_A_TEAPOT: 418,
  MISDIRECTED_REQUEST: 421,
  UNPROCESSABLE_ENTITY: 422,
  LOCKED: 423,
  FAILED_DEPENDENCY: 424,
  TOO_EARLY: 425,
  UPGRADE_REQUIRED: 426,
  PRECONDITION_REQUIRED: 428,
  TOO_MANY_REQUESTS: 429,
  REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
  UNAVAILABLE_FOR_LEGAL_REASONS: 451,

  // 5xx Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
  HTTP_VERSION_NOT_SUPPORTED: 505,
  VARIANT_ALSO_NEGOTIATES: 506,
  INSUFFICIENT_STORAGE: 507,
  LOOP_DETECTED: 508,
  NOT_EXTENDED: 510,
  NETWORK_AUTHENTICATION_REQUIRED: 511,
};

// ========================== 🚨 Error Messages ==========================

export const ERROR_MESSAGES = {
  // Network Errors
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  NETWORK_OFFLINE: "You appear to be offline. Please check your connection.",
  NETWORK_TIMEOUT: "Network timeout. Please try again.",

  // HTTP Status Based Errors
  [HTTP_STATUS.BAD_REQUEST]: "Invalid request. Please check your input.",
  [HTTP_STATUS.UNAUTHORIZED]: "Session expired. Please login again.",
  [HTTP_STATUS.FORBIDDEN]: "You don't have permission to perform this action.",
  [HTTP_STATUS.NOT_FOUND]: "The requested resource was not found.",
  [HTTP_STATUS.METHOD_NOT_ALLOWED]: "This action is not allowed.",
  [HTTP_STATUS.REQUEST_TIMEOUT]: "Request timeout. Please try again.",
  [HTTP_STATUS.CONFLICT]: "This action conflicts with existing data.",
  [HTTP_STATUS.UNPROCESSABLE_ENTITY]: "Unable to process your request. Please check your data.",
  [HTTP_STATUS.TOO_MANY_REQUESTS]: "Too many requests. Please slow down.",
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: "Internal server error. Please try again later.",
  [HTTP_STATUS.BAD_GATEWAY]: "Bad gateway. Please try again later.",
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: "Service temporarily unavailable. Please try again later.",
  [HTTP_STATUS.GATEWAY_TIMEOUT]: "Gateway timeout. Please try again.",

  // Application Specific Errors
  VALIDATION_ERROR: "Please check your input and try again.",
  AUTHENTICATION_ERROR: "Authentication failed. Please check your credentials.",
  AUTHORIZATION_ERROR: "You are not authorized to perform this action.",
  SESSION_EXPIRED: "Your session has expired. Please login again.",
  TOKEN_EXPIRED: "Your access token has expired. Please refresh your session.",
  RATE_LIMITED: "You've made too many requests. Please wait and try again.",
  QUOTA_EXCEEDED: "You've exceeded your usage quota. Please upgrade your plan.",

  // File & Upload Errors
  FILE_TOO_LARGE: "File size is too large. Please choose a smaller file.",
  UNSUPPORTED_FILE_TYPE: "File type is not supported. Please choose a different file.",
  UPLOAD_FAILED: "File upload failed. Please try again.",

  // Payment & Subscription Errors
  PAYMENT_FAILED: "Payment processing failed. Please check your payment details.",
  PAYMENT_REQUIRED: "Payment is required to access this feature.",
  SUBSCRIPTION_EXPIRED: "Your subscription has expired. Please renew to continue.",
  TRIAL_EXPIRED: "Your trial period has ended. Please upgrade to continue.",

  // System & Maintenance Errors
  MAINTENANCE_MODE: "System is under maintenance. Please try again later.",
  FEATURE_DISABLED: "This feature is currently disabled.",
  API_DEPRECATED: "This API version is deprecated. Please upgrade.",

  // Generic Errors
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  DEFAULT_ERROR: "Something went wrong. Please try again.",

  // ========================== 🧠 Helper: Get Error Message ==========================
  // Helper method to get appropriate error message
  getMessage: function (statusCode, customMessage = null) {
    if (customMessage) return customMessage;
    return this[statusCode] || this.DEFAULT_ERROR;
  }
};



// ======================== 🔧 Request Configuration ======================

export const REQUEST_CONFIG = {
  // Default headers
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },

  // File upload headers
  UPLOAD_HEADERS: {
    'Content-Type': 'multipart/form-data',
  },

  // Cache strategies
  CACHE_STRATEGIES: {
    NETWORK_FIRST: 'network-first',
    CACHE_FIRST: 'cache-first',
    CACHE_ONLY: 'cache-only',
    NETWORK_ONLY: 'network-only',
  },
};

// ====================== 📡 Response Handling ======================

export const RESPONSE_HANDLERS = {
  // Success status codes
  SUCCESS_CODES: [200, 201, 202, 204],

  // Retryable status codes
  RETRYABLE_CODES: [408, 429, 500, 502, 503, 504],

  // Codes that should trigger auth refresh
  AUTH_ERROR_CODES: [401, 403],

  // Codes that indicate client error (no retry)
  CLIENT_ERROR_CODES: [400, 402, 404, 405, 406, 407, 409, 410, 411, 412, 413, 414, 415, 416, 417, 418, 421, 422, 423, 424, 425, 426, 428, 431, 451],
};

// ========================== 🛠️ Utilities ==========================


// Helper to check if status is successful
export const isSuccessStatus = (status) =>
  RESPONSE_HANDLERS.SUCCESS_CODES.includes(status);

// Helper to check if status should trigger retry
export const isRetryableStatus = (status) =>
  RESPONSE_HANDLERS.RETRYABLE_CODES.includes(status);

// Helper to check if status is client error
export const isClientError = (status) =>
  RESPONSE_HANDLERS.CLIENT_ERROR_CODES.includes(status);

// Helper to get full API endpoint
export const getApiEndpoint = (path = "") => {
  const base = API_CONFIG.FULL_BASE_URL.replace(/\/+$/, "");
  const endpoint = path.replace(/^\/+/, "");
  return `${base}/${endpoint}`;
};


// Helper to get appropriate error message
export const getErrorMessage = (error, defaultMessage = null) => {
  if (error?.response?.status) {
    return ERROR_MESSAGES.getMessage(error.response.status, defaultMessage);
  }
  if (error?.message?.includes('Network Error')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }
  if (error?.message?.includes('timeout')) {
    return ERROR_MESSAGES.NETWORK_TIMEOUT;
  }
  return defaultMessage || ERROR_MESSAGES.DEFAULT_ERROR;
};

// Export default configuration
export default API_CONFIG;


