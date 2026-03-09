// lib/environment.js
"use client";

// Method 1: Simple check (most reliable)
export const isDevelopment = process.env.NEXT_PUBLIC_APP_ENV === "development";

export const isProduction = process.env.NEXT_PUBLIC_APP_ENV === "production";
