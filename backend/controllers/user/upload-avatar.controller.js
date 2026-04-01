// backend/controllers/user/upload-avatar.controller.js
import { uploadAvatarUseCase } from "../../use-cases/user/upload-avatar.use-case.js";
import { sendUseCaseResponse } from "../auth/auth-shared.js";

/**
 * Controller for POST /api/v1/user/profile/avatar
 * Allows users to upload a profile avatar.
 */
export const handleUploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { buffer, mimetype } = req.file;

    const result = await uploadAvatarUseCase({
      userId,
      fileBuffer: buffer,
      mimetype,
    });

    return sendUseCaseResponse(req, res, result);
  } catch (error) {
    next(error);
  }
};