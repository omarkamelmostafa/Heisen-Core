// lib/environment.js

export const isDevelopment =
  typeof process !== "undefined" &&
  !!process?.env?.NODE_ENV &&
  process.env.NODE_ENV.trim() === "development";

export const isProduction =
  typeof process !== "undefined" &&
  !!process?.env?.NODE_ENV &&
  process.env.NODE_ENV.trim() === "production";

console.log(isDevelopment);
