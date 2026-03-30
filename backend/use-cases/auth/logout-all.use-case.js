// backend/use-cases/auth/logout-all.use-case.js

import User from "../../model/User.js";
import RefreshToken from "../../model/RefreshToken.js";
import logger from "../../utilities/general/logger.js";

/**
 * Logout All Devices Use Case — Requires authenticated user.
 *
 * Increments user's tokenVersion (invalidating all existing RefreshTokens on
 * next refresh attempt) and explicitly revokes all RefreshToken documents.
 *
 * @param {Object} dto
 * @param {string} dto.userId - From req.user (access token decoded)
 * @returns {Object} { success, statusCode, message }
 */
export async function logoutAllUseCase({ userId }) {
  try {
    if (!userId) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required.",
        errorCode: "NOT_AUTHENTICATED",
      };
    }

    // Increment tokenVersion → all existing refresh tokens become stale
    await User.findByIdAndUpdate(userId, {
      $inc: { tokenVersion: 1 },
    }).exec();

    // Explicitly revoke all RefreshToken documents for the user
    const result = await RefreshToken.updateMany(
      { user: userId, isRevoked: false },
      { isRevoked: true }
    );

    logger.info(
      { userId, revokedCount: result.modifiedCount },
      "All sessions revoked via logout-all"
    );

    return {
      success: true,
      statusCode: 200,
      message: "Logged out from all devices.",
    };
  } catch (error) {
    logger.error({ err: error, userId }, "Logout-all use-case error");

    return {
      success: false,
      statusCode: 500,
      message: "Failed to logout from all devices. Please try again.",
      errorCode: "INTERNAL_ERROR",
    };
  }
}
