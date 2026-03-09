// lib/environment.js

export const isDevelopment =
  typeof process !== "undefined" &&
  !!process?.env?.NODE_ENV &&
  process.env.NODE_ENV.trim() === "development";

export const isProduction =
  typeof process !== "undefined" &&
  !!process?.env?.NODE_ENV &&
  process.env.NODE_ENV.trim() === "production";



  // lib/environment.js
// Use NODE_ENV which is properly set by Next.js
export const isDevelopment = process.env.NODE_ENV === 'development';