// backend/controllers/auth/verify-email.controller.js
import { verifyEmailUseCase } from "../../use-cases/auth/index.js";
import { sendUseCaseResponse } from "./auth-shared.js";

/**
 * Verify Email Controller — Thin HTTP adapter.
 */
export const handleVerifyEmail = async (req, res) => {
  const { code } = req.body;

  const result = await verifyEmailUseCase({ code });

  return sendUseCaseResponse(req, res, result);
};
