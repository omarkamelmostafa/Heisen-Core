// frontend/src/lib/config/__mocks__/api-config.js

export const API_CONFIG = {
  BASE_URL: "http://test.local",
  API_VERSION: "1",
  API_PREFIX: "/api",
  get FULL_BASE_URL() {
    return "http://test.local/api/v1";
  },
  HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  TIMEOUT: 12345,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  ENV: "test",
  IS_DEVELOPMENT: false,
  IS_PRODUCTION: false,
  IS_TEST: true,
};

export const HTTP_STATUS = {
  CONTINUE: 100,
  SWITCHING_PROTOCOLS: 101,
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your internet connection.",
  [HTTP_STATUS.UNAUTHORIZED]: "Session expired. Please login again.",
  [HTTP_STATUS.FORBIDDEN]: "You don't have permission to perform this action.",
  [HTTP_STATUS.NOT_FOUND]: "The requested resource was not found.",
  [HTTP_STATUS.TOO_MANY_REQUESTS]: "Too many requests. Please slow down.",
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: "Internal server error. Please try again later.",
  [HTTP_STATUS.BAD_GATEWAY]: "Bad gateway. Please try again later.",
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: "Service temporarily unavailable. Please try again later.",
  [HTTP_STATUS.GATEWAY_TIMEOUT]: "Gateway timeout. Please try again.",
  VALIDATION_ERROR: "Please check your input and try again.",
  AUTHENTICATION_ERROR: "Authentication failed. Please check your credentials.",
  AUTHORIZATION_ERROR: "You are not authorized to perform this action.",
  SESSION_EXPIRED: "Your session has expired. Please login again.",
  TOKEN_EXPIRED: "Your access token has expired. Please refresh your session.",
  RATE_LIMITED: "You've made too many requests. Please wait and try again.",
  UNKNOWN_ERROR: "An unexpected error occurred. Please try again.",
  DEFAULT_ERROR: "Something went wrong. Please try again.",
  getMessage: function (statusCode, customMessage = null) {
    if (customMessage) return customMessage;
    return this[statusCode] || this.DEFAULT_ERROR;
  }
};

export default API_CONFIG;
