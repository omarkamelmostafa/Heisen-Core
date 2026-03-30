import User from "../../model/User.js";
import jwt from "jsonwebtoken";
import { generateTokens } from "../../utilities/auth/token-utils.js";
import { processUserData } from "../../utilities/auth/user-data-utils.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import {
  clearCookie,
  setCookie,
} from "../../utilities/general/cookie-utils.js";

function verifyJwt(token, secret) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) {
        reject(err);
      } else {
        resolve(decoded);
      }
    });
  });
}

export const handleRefreshToken = async (req, res) => {
  const cookies = req?.cookies;
  const cookieName = "jwt_client";

  if (!cookies[cookieName]) {
    return apiResponseManager(req, res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized",
      errorDetails: "Unauthorized",
      requestId: req?.requestId,
    });
  }

  try {
    const refreshToken = cookies[cookieName];
    const foundUser = await User.findOne({ refreshToken });

    if (!foundUser) {
      clearCookie(res, cookieName);
      return apiResponseManager(req, res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized",
        errorDetails: "Unauthorized",
        requestId: req?.requestId,
      });
    }

    // Verify the refresh token
    const decoded = await verifyJwt(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    if (
      foundUser.email !== decoded.email ||
      foundUser._id.toString() !== decoded.userId
    ) {
      clearCookie(res, cookieName);
      return apiResponseManager(req, res, {
        statusCode: 401,
        success: false,
        message: "Forbidden",
        errorDetails: "Forbidden",
        requestId: req?.requestId,
      });
    }

    // Generate new tokens (only access token will be returned)
    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      foundUser
    );

    // Optional: If you want to re-enable rotation, uncomment the following lines
    await foundUser.updateOne({ refreshToken: newRefreshToken });
    const cookieExpiry = 24 * 60 * 60 * 1000; // 24 hours
    setCookie(res, cookieName, newRefreshToken, {
      maxAge: cookieExpiry,
      expires: new Date(Date.now() + cookieExpiry), // Set the expiration time of the cookie to 24 hours
    });

    const excludedFields = ["password", "refreshToken"];
    const userDataObject = await processUserData(foundUser, excludedFields);

    // Send back the new access token and user data
    apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "Token refreshed successfully",
      data: {
        user: userDataObject,
        accessToken,
      },
      requestId: req?.requestId,
    });
  } catch (error) {
    console.error(error);
    return apiResponseManager(req, res, {
      statusCode: 500,
      success: false,
      message: "Internal Server Error",
      errorDetails: error.message,
      requestId: req?.requestId,
    });
  }
};
