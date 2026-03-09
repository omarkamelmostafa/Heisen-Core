// backend/controllers/auth/refresh.controller.js
import { refreshTokenUseCase } from "../../use-cases/auth/index.js";
import { clearCookie, setCookie } from "../../services/auth/cookie-service.js";
import { REFRESH_TOKEN_COOKIE_NAME, ACCESS_TOKEN_COOKIE_NAME, sendUseCaseResponse } from "./auth-shared.js";

/**
 * Refresh Token Controller — Thin HTTP adapter.
 * Reads cookie, delegates to refreshTokenUseCase, sets new cookies, formats response.
 */
export const handleRefreshToken = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];

  const result = await refreshTokenUseCase({
    refreshToken,
    clientIP: req.ip,
  });

  // Clear cookie on failure if use case signals it
  if (result.clearCookie) {
    clearCookie(res, REFRESH_TOKEN_COOKIE_NAME);
  }

  if (result.success && result.data) {
    // Set new refresh token cookie (httpOnly)
    if (result.data.newRefreshToken) {
      setCookie(res, REFRESH_TOKEN_COOKIE_NAME, result.data.newRefreshToken, {
        maxAge: process.env.REFRESH_TOKEN_COOKIE_MAX_AGE || 24 * 60 * 60 * 1000,
      });

      // Remove newRefreshToken from response (it's in the cookie)
      const { newRefreshToken, ...responseData } = result.data;
      result.data = responseData;
    }

    // Set new access token as non-httpOnly cookie (frontend middleware needs to read it)
    if (result.data.accessToken) {
      setCookie(res, ACCESS_TOKEN_COOKIE_NAME, result.data.accessToken, {
        httpOnly: false,
        maxAge: 60 * 60 * 1000, // 1 hour (matches ACCESS_TOKEN_EXPIRY)
      });
    }
  }

  return sendUseCaseResponse(req, res, result);
};

