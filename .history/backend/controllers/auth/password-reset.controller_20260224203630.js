// backend/controllers/auth/password-reset.controller.js
import { forgotPasswordUseCase, resetPasswordUseCase } from "../../use-cases/auth/index.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";

/**
 * Forgot Password Controller — Thin HTTP adapter.
 */
export const handleForgotPassword = async (req, res) => {
  const { email } = req.body;

  const result = await forgotPasswordUseCase({
    email,
    clientIP: req.ip,
  });

  return apiResponseManager(req, res, {
    statusCode: result.statusCode,
    success: result.success,
    message: result.message,
    ...(result.errorCode && { errorCode: result.errorCode }),
    ...(result.data && { data: result.data }),
  });
};

/**
 * Reset Password Controller — Thin HTTP adapter.
 */
export const handleResetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const result = await resetPasswordUseCase({ token, password });

  return apiResponseManager(req, res, {
    statusCode: result.statusCode,
    success: result.success,
    message: result.message,
    ...(result.errorCode && { errorCode: result.errorCode }),
    ...(result.data && { data: result.data }),
  });
};
