// backend/controllers/user/email-change.controller.js
import { sendUseCaseResponse } from "../auth/auth-shared.js";
import { requestEmailChangeUseCase } from "../../use-cases/user/request-email-change.use-case.js";
import { confirmEmailChangeUseCase } from "../../use-cases/user/confirm-email-change.use-case.js";

export async function handleRequestEmailChange(req, res) {
  const { newEmail, currentPassword } = req.body;
  const userId = req.user.userId;

  // Build backend base URL using req.protocol + host (trust proxy is set)
  const apiBaseUrl = `${req.protocol}://${req.get('host')}`;

  const result = await requestEmailChangeUseCase({
    userId,
    newEmail,
    currentPassword,
    apiBaseUrl,
  });

  return sendUseCaseResponse(req, res, result);
}

export async function handleConfirmEmailChange(req, res) {
  const { token } = req.params;

  const result = await confirmEmailChangeUseCase({ token });

  return res.redirect(result.redirectUrl);
}
