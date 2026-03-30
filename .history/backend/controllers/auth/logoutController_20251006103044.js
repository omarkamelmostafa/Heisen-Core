import User from "../../model/User.js";
import { apiResponseManager } from "../../utilities/apiResponseManager.js";
import { clearCookie } from "../../utilities/cookieUtils.js";

export const handleLogout = async (req, res) => {
  const cookieName = "jwt_client";

  const cookies = req.cookies;
  if (!cookies[cookieName]) {
    return apiResponseManager(req, res, {
      statusCode: 204,
      success: false,
      message: "Logout successful!",
      errorDetails: "NoContent",
      requestId: req?.requestId,
    });
  }

  const refreshToken = cookies[cookieName];

  // Is refreshToken in db?
  const foundUser = await User.findOne({ refreshToken }).exec();
  if (!foundUser) {
    // clearCookie(res, cookieName);
    return apiResponseManager(req, res, {
      statusCode: 204,
      success: false,
      message: "Logout successful!",
      errorDetails: "NoContent",
      requestId: req?.requestId,
    });
  }

  // Delete refreshToken in db
  foundUser.refreshToken = "";
  await foundUser.save();

  // clearCookie(res, cookieName);
  return apiResponseManager(req, res, {
    statusCode: 204,
    success: false,
    message: "Logout successful!",
    errorDetails: "NoContent",
    requestId: req?.requestId,
  });
};
