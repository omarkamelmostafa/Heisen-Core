import { AppError } from "../../errors/AppError.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import logger from "../../utilities/general/logger.js";

/**
 * Global error handler middleware.
 * - Detects AppError instances and formats structured responses via apiResponseManager.
 * - Falls back to a generic 500 for unexpected (non-operational) errors.
 */
export const errorHandlerMiddleware = (err, req, res, next) => {
  // Log every error to the pino logger
  const statusCode = err.statusCode || 500;
  logger.error({ err, statusCode, url: req.originalUrl }, "Unhandled error");

  // If headers are already sent, delegate to Express default handler
  if (res.headersSent) {
    return next(err);
  }

  // ── Operational errors (AppError subclasses) ──────────────────────
  if (err instanceof AppError && err.isOperational) {
    const responsePayload = {
      statusCode: err.statusCode,
      success: false,
      message: err.message,
      errorCode: err.errorCode,
    };

    // Attach retry info for RateLimitError
    if (err.retryAfterSeconds) {
      responsePayload.data = {
        retryAfter: err.retryAfterSeconds,
        reason: err.reason,
      };
    }

    return apiResponseManager(req, res, responsePayload);
  }

  // ── Unexpected / programmer errors ────────────────────────────────
  const message =
    process.env.NODE_ENV === "production"
      ? "An internal server error occurred."
      : err.message;

  return apiResponseManager(req, res, {
    statusCode: 500,
    success: false,
    message,
    errorCode: "INTERNAL_ERROR",
  });
};
