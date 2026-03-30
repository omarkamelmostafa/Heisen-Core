// backend/controllers/auth/refresh.controller.js
import { refreshTokenUseCase } from "../../use-cases/auth/index.js";
import { clearCookie, setRefreshTokenCookie } from "../../services/auth/cookie-service.js";
import { REFRESH_TOKEN_COOKIE_NAME, sendUseCaseResponse } from "./auth-shared.js";

/**
 * Refresh Token Controller — Thin HTTP adapter.
 * Reads cookie, delegates to refreshTokenUseCase, sets new cookie on success.
 * Access token is returned in the response body only (FR-010: memory-only).
 */
export const handleRefreshToken = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  const result = await refreshTokenUseCase({
    refreshToken,
    userAgent: req.headers["user-agent"] || "",
    ipAddress: req.ip,
  });

  // Clear cookie on failure if use case signals it
  if (result.clearCookie) {
    clearCookie(res, REFRESH_TOKEN_COOKIE_NAME);
  }

  if (result.success && result.data) {
    // Set new refresh token cookie (httpOnly, path-restricted) with rememberMe
    if (result.data.newRefreshToken) {
      setRefreshTokenCookie(res, result.data.newRefreshToken, result.data.rememberMe);

      // Remove newRefreshToken from response (it's in the cookie)
      const { newRefreshToken, ...responseData } = result.data;
      result.data = responseData;
    }
  }

  return sendUseCaseResponse(req, res, result);
};