import { resend2faUseCase } from "../../use-cases/auth/resend-2fa.use-case.js";
import { sendUseCaseResponse } from "./auth-shared.js";

export const handleResend2fa = async (req, res, next) => {
  try {
    const { tempToken } = req.body;

    const result = await resend2faUseCase({ tempToken });

    return sendUseCaseResponse(req, res, result);
  } catch (error) {
    next(error);
  }
};
