// // lib/environment.js
// export const isDevelopment =
//   typeof process !== "undefined" && process.env.NODE_ENV === "development";

// export const isProduction =
//   typeof process !== "undefined" && process.env.NODE_ENV === "production";

// console.log("Environment debug:", {
//   NODE_ENV: process.env.NODE_ENV,
//   isDevelopment,
//   isProduction,
// });




// lib/environment.js

// Method 1: Check if we're in a browser (client-side)
export const isDevelopment = 
  typeof window !== 'undefined' 
    ? // Client-side: use global variable or URL detection
      window.location.hostname === 'localhost' || 
      process.env.NODE_ENV === 'development'
    : // Server-side: use process.env
      process.env.NODE_ENV === 'development';

// Method 2: Simple check (most reliable)
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

console.log('Environment check:', {
  hasProcess: typeof process !== 'undefined',
  hasWindow: typeof window !== 'undefined', 
  NODE_ENV: process.env.NODE_ENV,
  isDevelopment,
  hostname: typeof window !== 'undefined' ? window.location.hostname : 'no window'
});