// backend/controllers/auth/refresh.controller.js
import { refreshTokenUseCase } from "../../use-cases/auth/index.js";
import { clearCookie, setCookie } from "../../services/auth/cookie-service.js";
import { REFRESH_TOKEN_COOKIE_NAME, sendUseCaseResponse } from "./auth-shared.js";

/**
 * Refresh Token Controller — Thin HTTP adapter.
 * Reads cookie, delegates to refreshTokenUseCase, sets new cookie, formats response.
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

  // Set new refresh token cookie on success
  if (result.success && result.data?.newRefreshToken) {
    setCookie(res, REFRESH_TOKEN_COOKIE_NAME, result.data.newRefreshToken, {
      maxAge: process.env.REFRESH_TOKEN_COOKIE_MAX_AGE || 24 * 60 * 60 * 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
    });

    // Remove newRefreshToken from response (it's in the cookie)
    const { newRefreshToken, ...responseData } = result.data;
    result.data = responseData;
  }

  return sendUseCaseResponse(req, res, result);
};
