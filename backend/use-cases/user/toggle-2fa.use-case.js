import User from "../../model/User.js";
import { comparePassword } from "../../utilities/auth/hash-utils.js";
import logger from "../../utilities/general/logger.js";

export async function toggle2faUseCase({ userId, enable, currentPassword }) {
  try {
    const user = await User.findById(userId).select("+password +twoFactorEnabled");

    if (!user) {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
        errorCode: "USER_NOT_FOUND",
      };
    }

    const isPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      return {
        success: false,
        statusCode: 400,
        message: "Current password is incorrect",
        errorCode: "INVALID_PASSWORD",
      };
    }

    if (user.twoFactorEnabled === enable) {
      return {
        success: false,
        statusCode: 400,
        message: enable
          ? "Two-factor authentication is already enabled"
          : "Two-factor authentication is already disabled",
        errorCode: "TWO_FACTOR_NO_CHANGE",
      };
    }

    user.twoFactorEnabled = enable;

    if (!enable) {
      user.twoFactorCode = undefined;
      user.twoFactorExpiry = undefined;
    }

    user.lastSecurityEvent = new Date();
    await user.save();

    logger.info(
      { userId, twoFactorEnabled: enable },
      `Two-factor authentication ${enable ? "enabled" : "disabled"}`
    );

    return {
      success: true,
      statusCode: 200,
      message: enable
        ? "Two-factor authentication has been enabled"
        : "Two-factor authentication has been disabled",
      data: {
        twoFactorEnabled: enable,
      },
    };
  } catch (error) {
    logger.error({ err: error, userId }, "Toggle 2FA error");

    if (error.name === "MongoError" || error.name === "MongoServerError") {
      return {
        success: false,
        statusCode: 503,
        message: "Service temporarily unavailable",
        errorCode: "DATABASE_ERROR",
      };
    }

    return {
      success: false,
      statusCode: 500,
      message: "Failed to update two-factor authentication",
      errorCode: "TWO_FACTOR_TOGGLE_FAILED",
    };
  }
}
