// backend/services/auth/cookie-service.js
// Centralized cookie management for auth-related HTTP cookies.

/**
 * Default cookie options for auth cookies.
 * Path restricted to / per FR-011 — the browser only
 * sends the refresh token cookie when calling the refresh endpoint.
 */
const AUTH_COOKIE_DEFAULTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
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
 * Uses the same path as AUTH_COOKIE_DEFAULTS so the browser matches the cookie.
 * @param {import('express').Response} res
 * @param {string} cookieName
 */
export const clearCookie = (res, cookieName) => {
  res.cookie(cookieName, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Lax",
    path: "/",
    ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
    expires: new Date(0),
    maxAge: 0,
  });
};
