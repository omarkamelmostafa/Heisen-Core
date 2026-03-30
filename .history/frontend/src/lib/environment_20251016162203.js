// lib/environment.js
// ...existing code...
export const isDevelopment =
  typeof process !== "undefined" &&
  !!process?.env?.NEXT_PUBLIC_APP_ENV &&
  process.env.NEXT_PUBLIC_APP_ENV.trim() === "development";

export const isProduction =
  typeof process !== "undefined" &&
  !!process?.env?.NEXT_PUBLIC_APP_ENV &&
  process.env.NEXT_PUBLIC_APP_ENV.trim() === "production";