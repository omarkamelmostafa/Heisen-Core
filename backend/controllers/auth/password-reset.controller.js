// backend/controllers/auth/password-reset.controller.js
import { forgotPasswordUseCase, resetPasswordUseCase } from "../../use-cases/auth/index.js";
import { sendUseCaseResponse } from "./auth-shared.js";

/**
 * Forgot Password Controller — Thin HTTP adapter.
 */
export const handleForgotPassword = async (req, res) => {
  const { email } = req.body;

  const result = await forgotPasswordUseCase({
    email,
    clientIP: req.ip,
    origin: req.headers.origin || req.headers.referer,
  });

  return sendUseCaseResponse(req, res, result);
};

/**
 * Reset Password Controller — Thin HTTP adapter.
 */
export const handleResetPassword = async (req, res) => {
  const { token, password } = req.body;

  const result = await resetPasswordUseCase({ token, password });

  return sendUseCaseResponse(req, res, result);
};
