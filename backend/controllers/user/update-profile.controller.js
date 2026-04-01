// backend/controllers/user/update-profile.controller.js
import { updateProfileUseCase } from "../../use-cases/user/update-profile.use-case.js";
import { sendUseCaseResponse } from "../auth/auth-shared.js";

/**
 * Controller for PATCH /api/v1/user/me
 * Allows users to update their profile information.
 */
export const updateProfile = async (req, res) => {
  const userId = req.user.userId;
  const { firstname, lastname } = req.body;

  const result = await updateProfileUseCase({ userId, firstname, lastname });
  
  // Rule B9: Delegates to sendUseCaseResponse for consistent envelope
  return sendUseCaseResponse(req, res, result);
};
