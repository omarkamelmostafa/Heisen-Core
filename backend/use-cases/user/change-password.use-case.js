import User from "../../model/User.js";
import { hashPassword, comparePassword } from "../../utilities/auth/hash-utils.js";
import logger from "../../utilities/general/logger.js";

/**
 * Change Password Use Case
 *
 * @param {Object} dto
 * @param {string} dto.userId      - The user's ID
 * @param {string} dto.oldPassword - The user's current password
 * @param {string} dto.newPassword - The user's new password
 * @param {string} dto.confirmPassword - Confirmation of the new password (already validated by middleware)
 * @returns {Object} { success, statusCode, errorCode?, message }
 */
export async function changePasswordUseCase({ userId, oldPassword, newPassword, confirmPassword }) {
  try {
    const user = await User.findById(userId).select("+password +tokenVersion");

    if (!user) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
        errorCode: "USER_NOT_FOUND",
      };
    }

    const isOldPasswordCorrect = await comparePassword(oldPassword, user.password);
    if (!isOldPasswordCorrect) {
      return {
        success: false,
        statusCode: 400,
        message: "Current password is incorrect",
        errorCode: "INVALID_PASSWORD",
      };
    }

    const isSamePassword = await comparePassword(newPassword, user.password);
    if (isSamePassword) {
      return {
        success: false,
        statusCode: 400,
        message: "New password must be different from your current password",
        errorCode: "SAME_PASSWORD",
      };
    }

    user.password = await hashPassword(newPassword);
    await user.save();

    logger.info({ userId }, "User password changed successfully");

    return {
      success: true,
      statusCode: 200,
      message: "Password updated successfully",
    };
  } catch (error) {
    logger.error({ err: error, userId }, "Change password use-case error");

    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return {
        success: false,
        statusCode: 503,
        message: "Service temporarily unavailable. Please try again.",
        errorCode: "DATABASE_ERROR",
      };
    }

    return {
      success: false,
      statusCode: 500,
      message: "Password change failed due to unexpected error",
      errorCode: "CHANGE_FAILED",
    };
  }
}
