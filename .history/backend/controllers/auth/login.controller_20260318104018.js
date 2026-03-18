// backend/controllers/auth/login.controller.js
import { loginUseCase } from "../../use-cases/auth/index.js";
import { setCookie } from "../../services/auth/cookie-service.js";
import { REFRESH_TOKEN_COOKIE_NAME, sendUseCaseResponse } from "./auth-shared.js";

/**
 * Login Controller — Thin HTTP adapter.
 * Parses request, delegates to loginUseCase, sets refresh token cookie, returns
 * access token in response body (NOT as a cookie — FR-010: memory-only).
 */
export const handleLogin = async (req, res) => {
  const { email, password } = req.body;

  const result = await loginUseCase({
    email,
    password,
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip,
  });

  // Set refresh token as HttpOnly cookie on success
  if (result.success && result.data) {
    if (result.data.refreshTokenValue) {
      setCookie(res, REFRESH_TOKEN_COOKIE_NAME, result.data.refreshTokenValue);

      // Remove raw token from response data (it's in the cookie)
      const { refreshTokenValue, ...responseData } = result.data;
      result.data = responseData;
    }
  }

  return sendUseCaseResponse(req, res, result);
};
