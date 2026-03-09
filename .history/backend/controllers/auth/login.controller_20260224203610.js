// backend/controllers/auth/login.controller.js
import { loginUseCase } from "../../use-cases/auth/index.js";
import { setCookie } from "../../utilities/general/cookie-utils.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import { REFRESH_TOKEN_COOKIE_NAME } from "./auth-shared.js";

/**
 * Login Controller — Thin HTTP adapter.
 * Parses request, delegates to loginUseCase, sets cookie, formats response.
 */
export const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUseCase({ email, password });

  // Set refresh token cookie on success
  if (result.success && result.data?.refreshToken) {
    setCookie(res, REFRESH_TOKEN_COOKIE_NAME, result.data.refreshToken, {
      maxAge: process.env.REFRESH_TOKEN_COOKIE_MAX_AGE || 24 * 60 * 60 * 1000,
    });

    // Remove refreshToken from response data (it's in the cookie)
    const { refreshToken, ...responseData } = result.data;
    result.data = responseData;
  }

  return apiResponseManager(req, res, {
    statusCode: result.statusCode,
    success: result.success,
    message: result.message,
    ...(result.errorCode && { errorCode: result.errorCode }),
    ...(result.data && { data: result.data }),
  });
};
