// backend/controllers/auth/login.controller.js
import { loginUseCase } from "../../use-cases/auth/index.js";
import { setCookie } from "../../services/auth/cookie-service.js";
import { REFRESH_TOKEN_COOKIE_NAME, ACCESS_TOKEN_COOKIE_NAME, sendUseCaseResponse } from "./auth-shared.js";

/**
 * Login Controller — Thin HTTP adapter.
 * Parses request, delegates to loginUseCase, sets cookies, formats response.
 */
export const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUseCase({ email, password });

  // Set cookies on success
  if (result.success && result.data) {
    // Set refresh token as httpOnly cookie (not accessible to JS)
    if (result.data.refreshToken) {
      setCookie(res, REFRESH_TOKEN_COOKIE_NAME, result.data.refreshToken, {
        maxAge: process.env.REFRESH_TOKEN_COOKIE_MAX_AGE || 24 * 60 * 60 * 1000,
      });
    }

    // Set access token as non-httpOnly cookie (frontend middleware needs to read it)
    if (result.data.accessToken) {
      setCookie(res, ACCESS_TOKEN_COOKIE_NAME, result.data.accessToken, {
        httpOnly: false,
        maxAge: 60 * 60 * 1000, // 1 hour (matches ACCESS_TOKEN_EXPIRY)
      });
    }

    // Remove tokens from response data (they're in cookies)
    const { refreshToken, ...responseData } = result.data;
    result.data = responseData;
  }

  return sendUseCaseResponse(req, res, result);
};

