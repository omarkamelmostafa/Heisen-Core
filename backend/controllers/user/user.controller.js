// backend/controllers/user/user.controller.js
import User from "../../model/User.js";
import { sanitizeUserForResponse } from "../../utilities/auth/user-data-utils.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import logger from "../../utilities/general/logger.js";

/**
 * Get Current User Controller
 * Returns the sanitized user profile for the authenticated session.
 */
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId);

    if (!user || (!user.isActive)) {
      return apiResponseManager(req, res, {
        statusCode: 404,
        success: false,
        message: "User not found or deactivated.",
        errorCode: "USER_NOT_FOUND"
      });
    }

    const userData = sanitizeUserForResponse(user);

    return apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "Current user retrieved successfully",
      data: {
        user: userData
      }
    });
  } catch (error) {
    logger.error({ err: error, userId: req.user?.userId }, "Error fetching current user");
    return apiResponseManager(req, res, {
      statusCode: 500,
      success: false,
      message: "Internal server error",
      errorCode: "INTERNAL_ERROR"
    });
  }
};
