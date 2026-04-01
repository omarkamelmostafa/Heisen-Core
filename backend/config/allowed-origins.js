// backend/config/allowed-origins.js

// Load allowed origins from environment variable with fallbacks
export const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
  : [
    "http://localhost:3000", // client port
    "http://localhost:4000", // server port
    "http://localhost:5000", // scraper server port
    "http://localhost:5173", // Vite dev server
    "https://www.yourapp.com",
  ];

