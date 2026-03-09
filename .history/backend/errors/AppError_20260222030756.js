// ─── Base Error Class ───────────────────────────────────────────────

/**
 * Base application error. All custom errors extend this class.
 * `isOperational` distinguishes expected errors (bad input, auth failures)
 * from unexpected programming bugs.
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = "INTERNAL_ERROR") {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── 400 — Validation / Bad Request ─────────────────────────────────

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errorCode = "VALIDATION_ERROR") {
    super(message, 400, errorCode);
  }
}

// ─── 401 — Authentication ───────────────────────────────────────────

export class AuthError extends AppError {
  constructor(
    message = "Authentication failed",
    errorCode = "AUTH_ERROR"
  ) {
    super(message, 401, errorCode);
  }
}

// ─── 403 — Forbidden / Authorization ────────────────────────────────

export class ForbiddenError extends AppError {
  constructor(message = "Access denied", errorCode = "FORBIDDEN") {
    super(message, 403, errorCode);
  }
}

// ─── 404 — Not Found ────────────────────────────────────────────────

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", errorCode = "NOT_FOUND") {
    super(message, 404, errorCode);
  }
}

// ─── 409 — Conflict ─────────────────────────────────────────────────

export class ConflictError extends AppError {
  constructor(message = "Resource conflict", errorCode = "CONFLICT") {
    super(message, 409, errorCode);
  }
}

// ─── 429 — Rate Limit ───────────────────────────────────────────────

export class RateLimitError extends AppError {
  /**
   * @param {string} message
   * @param {string} errorCode
   * @param {object} [retryInfo] - Optional { retryAfterSeconds, reason }
   */
  constructor(
    message = "Too many requests",
    errorCode = "RATE_LIMITED",
    retryInfo = {}
  ) {
    super(message, 429, errorCode);
    this.retryAfterSeconds = retryInfo.retryAfterSeconds ?? null;
    this.reason = retryInfo.reason ?? null;
  }
}

// ─── 503 — Database / External Service ──────────────────────────────

export class DatabaseError extends AppError {
  constructor(
    message = "Service temporarily unavailable",
    errorCode = "DATABASE_ERROR"
  ) {
    super(message, 503, errorCode);
  }
}
