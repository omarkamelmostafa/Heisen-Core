// frontend/src/lib/config/route-config.js

/**
 * Route Configuration
 * Centralized definition of routes and their access levels.
 */

// Routes that are accessible only to unauthenticated users (e.g., login, signup)
export const AUTH_ROUTES = [
  "/login",
  "/signup",
  "/verify-email",
  "/forgot-password",
  "/reset-password",
];

// Routes that require authentication (e.g., dashboard, settings)
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/app",
  "/settings",
  "/profile",
];

// Routes that are always accessible regardless of authentication state
export const PUBLIC_ROUTES = [
  "/",
  "/about",
  "/contact",
  "/terms",
  "/privacy",
];

/**
 * Helper to check route type
 */
export const isAuthRoute = (path) => AUTH_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
export const isProtectedRoute = (path) => PROTECTED_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
export const isPublicRoute = (path) => PUBLIC_ROUTES.some(route => path === route || path.startsWith(`${route}/`));
