import User from "../../model/User.js";
import { sanitizeUserForResponse } from "../../utilities/auth/user-data-utils.js";
import logger from "../../utilities/general/logger.js";

/**
 * Updates an authenticated user's profile (first and last name).
 * Maps camelCase firstName/lastName to lowercase firstname/lastname in MongoDB.
 * 
 * @param {Object} params - The transaction parameters
 * @param {string} params.userId - The ID of the user to update
 * @param {string} [params.firstname] - The new first name
 * @param {string} [params.lastname] - The new last name
 * @returns {Promise<Object>} The standard use-case response
 */
export async function updateProfileUseCase({ userId, firstname, lastname }) {
  try {
    const user = await User.findById(userId);

    if (!user || !user.isActive) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found or deactivated.",
        errorCode: "USER_NOT_FOUND",
      };
    }

    // Update only provided fields
    // Maps lowercase input (Project convention) to lowercase output (Mongoose fields)
    if (firstname !== undefined) user.firstname = firstname;
    if (lastname !== undefined) user.lastname = lastname;

    // Use .save() instead of findByIdAndUpdate to ensure pre-save middleware runs
    await user.save();

    logger.info({ userId }, "User profile updated successfully");

    return {
      success: true,
      statusCode: 200,
      message: "Profile updated successfully.",
      data: { user: sanitizeUserForResponse(user) },
    };
  } catch (error) {
    logger.error({ err: error, userId }, "Update profile use-case error");
    return {
      success: false,
      statusCode: 500,
      message: "Internal server error.",
      errorCode: "INTERNAL_ERROR",
    };
  }
}
