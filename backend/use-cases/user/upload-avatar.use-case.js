// backend/use-cases/user/upload-avatar.use-case.js
import User from "../../model/User.js";
import { CloudinaryService } from "../../services/cloudinaryService.js";
import { sanitizeUserForResponse } from "../../utilities/auth/user-data-utils.js";
import logger from "../../utilities/general/logger.js";

/**
 * Uploads a profile avatar for an authenticated user.
 * Handles deletion of existing avatar and upload of new one.
 *
 * @param {Object} params - The transaction parameters
 * @param {string} params.userId - The ID of the user
 * @param {Buffer} params.fileBuffer - The file buffer
 * @param {string} params.mimetype - The file mimetype
 * @returns {Promise<Object>} The standard use-case response
 */
export async function uploadAvatarUseCase({ userId, fileBuffer, mimetype }) {
  try {
    const user = await User.findById(userId);

    if (!user) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
        errorCode: "USER_NOT_FOUND",
      };
    }

    // Delete existing avatar if present
    if (user.avatar && user.avatar.publicId) {
      CloudinaryService.deleteImage(user.avatar.publicId);
    }

    // Upload new avatar
    const { url, publicId } = await CloudinaryService.uploadAvatar(userId, fileBuffer, mimetype);

    // Update user
    user.avatar = { url, publicId };
    await user.save();

    logger.info({ userId }, "Profile photo updated successfully");

    return {
      success: true,
      statusCode: 200,
      message: "Profile photo updated successfully",
      data: { user: sanitizeUserForResponse(user) },
    };
  } catch (error) {
    if (error.message && error.message.includes("upload")) {
      return {
        success: false,
        statusCode: 500,
        message: "Failed to upload image. Please try again.",
        errorCode: "UPLOAD_FAILED",
      };
    }

    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return {
        success: false,
        statusCode: 503,
        message: "Service temporarily unavailable",
        errorCode: "DATABASE_ERROR",
      };
    }

    logger.error({ err: error, userId }, "Upload avatar use-case error");

    return {
      success: false,
      statusCode: 500,
      message: "Failed to update profile photo",
      errorCode: "AVATAR_UPDATE_FAILED",
    };
  }
}