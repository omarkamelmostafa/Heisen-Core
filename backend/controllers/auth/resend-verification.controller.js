// backend/controllers/auth/resend-verification.controller.js
import { resendVerificationUseCase } from "../../use-cases/auth/index.js";
import { sendUseCaseResponse } from "./auth-shared.js";

/**
 * Resend Verification Email Controller — Thin HTTP adapter.
 */
export const handleResendVerification = async (req, res) => {
  const { email } = req.body;

  const result = await resendVerificationUseCase({ email });

  return sendUseCaseResponse(req, res, result);
};
