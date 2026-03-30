// backend/controllers/auth/logout-all.controller.js
import { logoutAllUseCase } from "../../use-cases/auth/index.js";
import { clearCookie } from "../../services/auth/cookie-service.js";
import { REFRESH_TOKEN_COOKIE_NAME, sendUseCaseResponse } from "./auth-shared.js";

/**
 * Logout All Devices Controller — Requires authenticated user (authTokenMiddleware).
 * Clears the current device's cookie and delegates to logoutAllUseCase.
 */
export const handleLogoutAll = async (req, res) => {
  // Clear current device cookie
  clearCookie(res, REFRESH_TOKEN_COOKIE_NAME);

  const result = await logoutAllUseCase({
    userId: req.user?.userId,
  });

  return sendUseCaseResponse(req, res, result);
};
