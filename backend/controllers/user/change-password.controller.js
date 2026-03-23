import { changePasswordUseCase } from "../../use-cases/user/change-password.use-case.js";
import { sendUseCaseResponse } from "../auth/auth-shared.js";

/**
 * Change Password Controller — Thin HTTP adapter.
 */
export const handleChangePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const result = await changePasswordUseCase({
      userId,
      oldPassword,
      newPassword,
    });

    return sendUseCaseResponse(req, res, result);
  } catch (error) {
    next(error);
  }
};
