// backend/controllers/auth/verify-email.controller.js
import { verifyEmailUseCase } from "../../use-cases/auth/index.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";

/**
 * Verify Email Controller — Thin HTTP adapter.
 */
export const handleVerifyEmail = async (req, res) => {
  const { code } = req.body;

  const result = await verifyEmailUseCase({ code });

  return apiResponseManager(req, res, {
    statusCode: result.statusCode,
    success: result.success,
    message: result.message,
    ...(result.errorCode && { errorCode: result.errorCode }),
    ...(result.data && { data: result.data }),
  });
};
