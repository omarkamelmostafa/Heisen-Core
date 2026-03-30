import { allowedOrigins } from "./allowed-origins.js";

export const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true, // Required for HttpOnly cookie-based auth
  optionsSuccessStatus: 200,
};
