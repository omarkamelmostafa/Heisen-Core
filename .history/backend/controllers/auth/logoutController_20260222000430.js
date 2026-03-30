import User from "../../model/User.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import { clearCookie } from "../../utilities/general/cookie-utils.js";

export const handleLogout = async (req, res) => {
  const cookieName =
    process.env.REFRESH_TOKEN_COOKIE_NAME?.replace(/"/g, "") || "refreshToken";

  const cookies = req.cookies;
  if (!cookies[cookieName]) {
    return apiResponseManager(req, res, {
      statusCode: 204,
      success: true,
      message: "Logout successful! (No session found)",
      requestId: req?.requestId,
    });
  }

  const refreshToken = cookies[cookieName];

  try {
    // 1. Clear cookie immediately
    clearCookie(res, cookieName);

    // 2. Is refreshToken in db?
    const foundUser = await User.findOne({ refreshToken }).exec();
    if (!foundUser) {
      return apiResponseManager(req, res, {
        statusCode: 204,
        success: true,
        message: "Logout successful!",
        requestId: req?.requestId,
      });
    }

    // 3. Delete refreshToken in db
    foundUser.refreshToken = "";
    await foundUser.save();

    return apiResponseManager(req, res, {
      statusCode: 204,
      success: true,
      message: "Logout successful!",
      requestId: req?.requestId,
    });
  } catch (error) {
    return apiResponseManager(req, res, {
      statusCode: 500,
      success: false,
      message: "An error occurred during logout.",
      errorDetails: error.message,
      requestId: req?.requestId,
    });
  }
};

