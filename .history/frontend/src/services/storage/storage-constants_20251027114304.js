// frontend/src/services/storage/storage-constants.js

// Token and storage constants
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  REFRESH_TOKEN: "refresh_token",
  TOKEN_EXPIRY: "token_expiry",
  USER_DATA: "user_data",
};

// Cookie configuration
export const COOKIE_CONFIG = {
  PATH: "/",
  SECURE: process.env.NODE_ENV === "production",
  SAME_SITE: "strict",
  // HttpOnly cookies are handled by backend
};

// Token expiry buffers (in milliseconds)
export const TOKEN_BUFFERS = {
  ACCESS_TOKEN_REFRESH_BUFFER: 5 * 60 * 1000, // 5 minutes before expiry
  REFRESH_TOKEN_EXPIRY_BUFFER: 24 * 60 * 60 * 1000, // 24 hours
};
