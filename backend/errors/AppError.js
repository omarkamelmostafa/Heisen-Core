// backend/errors/AppError.js

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

export default AppError;
