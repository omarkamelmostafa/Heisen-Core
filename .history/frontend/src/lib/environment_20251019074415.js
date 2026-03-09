// lib/environment.js
export const isDevelopment =
  typeof process !== "undefined" && process.env.NODE_ENV === "development";

export const isProduction =
  typeof process !== "undefined" && process.env.NODE_ENV === "production";

console.log("Environment debug:", {
  NODE_ENV: process.env.NODE_ENV,
  isDevelopment,
  isProduction,
});
