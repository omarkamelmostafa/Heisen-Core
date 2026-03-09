// ─── Centralized Error Code Constants ────────────────────────────────
// Import these constants instead of hard-coding error code strings.
// All values are frozen to prevent accidental mutation at runtime.

// ─── Authentication & Session ───────────────────────────────────────

export const AUTH = Object.freeze({
  MISSING_CREDENTIALS: "MISSING_CREDENTIALS",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCOUNT_DEACTIVATED: "ACCOUNT_DEACTIVATED",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  MISSING_REFRESH_TOKEN: "MISSING_REFRESH_TOKEN",
  REFRESH_TOKEN_EXPIRED: "REFRESH_TOKEN_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",
  TOKEN_NOT_ACTIVE: "TOKEN_NOT_ACTIVE",
  TOKEN_VERSION_MISMATCH: "TOKEN_VERSION_MISMATCH",
  TOKEN_REUSE_DETECTED: "TOKEN_REUSE_DETECTED",
  SESSION_INVALID: "SESSION_INVALID",
  USER_NOT_FOUND: "USER_NOT_FOUND",
});

// ─── Validation ─────────────────────────────────────────────────────

export const VALIDATION = Object.freeze({
  BAD_REQUEST: "BAD_REQUEST",
  MISSING_FIELDS: "MISSING_FIELDS",
  PASSWORDS_MISMATCH: "PASSWORDS_MISMATCH",
  INVALID_EMAIL: "INVALID_EMAIL",
  MISSING_PASSWORD: "MISSING_PASSWORD",
  PASSWORD_SAME_AS_CURRENT: "PASSWORD_SAME_AS_CURRENT",
  MISSING_VERIFICATION_CODE: "MISSING_VERIFICATION_CODE",
  INVALID_VERIFICATION_CODE: "INVALID_VERIFICATION_CODE",
  INVALID_RESET_TOKEN: "INVALID_RESET_TOKEN",
});

// ─── Resource ───────────────────────────────────────────────────────

export const RESOURCE = Object.freeze({
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  USER_EXISTS: "USER_EXISTS",
});

// ─── Rate Limiting ──────────────────────────────────────────────────

export const RATE_LIMIT = Object.freeze({
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  REGISTRATION_RATE_LIMITED: "REGISTRATION_RATE_LIMITED",
  PASSWORD_RESET_RATE_LIMITED: "PASSWORD_RESET_RATE_LIMITED",
});

// ─── Server / Infrastructure ────────────────────────────────────────

export const SERVER = Object.freeze({
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
  VERIFICATION_FAILED: "VERIFICATION_FAILED",
  RESET_FAILED: "RESET_FAILED",
});
