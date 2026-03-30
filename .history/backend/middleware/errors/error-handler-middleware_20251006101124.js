// error-handler-middleware.js

import { logMessage } from "../core/logging-middleware.js";

export const errorHandlerMiddleware = (err, req, res, next) => {
  // Log the error to file
  logMessage(`${err.statusCode}\t${err.message}`, "error.log", "error");

  // Set appropriate response status code based on error type
  const statusCode = err.statusCode || 500; // Default to 500 for internal server errors

  // Construct a user-friendly error response based on environment
  const errorMessage =
    process.env.NODE_ENV === "production"
      ? "An internal server error occurred." // Generic message in production
      : err.message; // Detailed message in development

  res.status(statusCode).json({ message: errorMessage });

  // Handle other errors
  // next(err);
};
