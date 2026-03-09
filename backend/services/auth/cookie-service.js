// backend/services/auth/cookie-service.js
// Centralized cookie management for auth-related HTTP cookies.

/**
 * Default cookie options for auth cookies.
 */
const AUTH_COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax",
  path: "/",
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};

/**
 * Set a cookie on the response with auth-safe defaults.
 * @param {import('express').Response} res
 * @param {string} cookieName
 * @param {string} value
 * @param {object} options - Overrides for default cookie options
 */
export const setCookie = (res, cookieName, value, options = {}) => {
  const cookieOptions = { ...AUTH_COOKIE_DEFAULTS, ...options };
  res.cookie(cookieName, value, cookieOptions);
};

/**
 * Clear a cookie by expiring it immediately.
 * @param {import('express').Response} res
 * @param {string} cookieName
 */
export const clearCookie = (res, cookieName) => {
  res.cookie(cookieName, "", {
    httpOnly: true,
    secure: true,
    sameSite: "Lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
};
