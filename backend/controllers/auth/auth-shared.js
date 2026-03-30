// backend/controllers/auth/auth-shared.js
// Shared constants and re-exports for auth controllers.

export const REFRESH_TOKEN_COOKIE_NAME =
  process.env.REFRESH_TOKEN_COOKIE_NAME?.replace(/"/g, "") || "refresh_token";

import { apiResponseManager } from "../../utilities/general/response-manager.js";

/**
 * Standard response formatter for use-case results.
 * Replaces the identical apiResponseManager call duplicated across all auth controllers.
 */
export const sendUseCaseResponse = (req, res, result) => {
  return apiResponseManager(req, res, {
    statusCode: result.statusCode,
    success: result.success,
    message: result.message,
    ...(result.errorCode && { errorCode: result.errorCode }),
    ...(result.data && { data: result.data }),
  });
};
