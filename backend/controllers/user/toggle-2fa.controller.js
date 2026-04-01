// backend/controllers/user/toggle-2fa.controller.js
import { toggle2faUseCase } from "../../use-cases/user/toggle-2fa.use-case.js";
import { sendUseCaseResponse } from "../auth/auth-shared.js";

export const handleToggle2fa = async (req, res, next) => {
  try {
    const { enable, currentPassword } = req.body;
    const userId = req.user.userId;

    const result = await toggle2faUseCase({
      userId,
      enable,
      currentPassword,
    });

    return sendUseCaseResponse(req, res, result);
  } catch (error) {
    next(error);
  }
};
