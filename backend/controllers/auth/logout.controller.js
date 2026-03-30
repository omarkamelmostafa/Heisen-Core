// backend/controllers/auth/logout.controller.js
import { logoutUseCase } from "../../use-cases/auth/index.js";
import { clearCookie } from "../../services/auth/cookie-service.js";
import { REFRESH_TOKEN_COOKIE_NAME, sendUseCaseResponse } from "./auth-shared.js";

/**
 * Logout Controller — Thin HTTP adapter.
 * Clears cookie immediately, delegates to logoutUseCase for server-side cleanup.
 */
export const handleLogout = async (req, res) => {
  // Always clear cookie first (HTTP concern)
  clearCookie(res, REFRESH_TOKEN_COOKIE_NAME);

  const refreshToken = req.cookies?.[REFRESH_TOKEN_COOKIE_NAME];
  const accessToken = req.headers.authorization?.replace("Bearer ", "");

  const result = await logoutUseCase({ refreshToken, accessToken });

  return sendUseCaseResponse(req, res, result);
};
