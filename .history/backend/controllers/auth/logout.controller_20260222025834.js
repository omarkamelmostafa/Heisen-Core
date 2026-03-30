import User from "../../model/User.js";
import {
  safeVerifyOrDecode,
  revokeByJti,
} from "../../utilities/auth/token-utils.js";
import { clearCookie } from "../../utilities/general/cookie-utils.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import { REFRESH_TOKEN_COOKIE_NAME } from "./auth-shared.js";

export const handleLogout = async (req, res) => {
  const cookieName = REFRESH_TOKEN_COOKIE_NAME;
  const refreshToken = req.cookies?.[cookieName];
  const accessToken = req.headers.authorization?.replace("Bearer ", "");

  try {
    // 1. Clear cookies immediately
    clearCookie(res, cookieName);

    let decodedRefresh = null;

    // 2. Process refresh token with Redis fallback
    if (refreshToken) {
      decodedRefresh = safeVerifyOrDecode(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        {
          issuer: process.env.JWT_ISSUER,
          audience: process.env.JWT_AUDIENCE,
        }
      );

      // Only blacklist if token is still valid
      if (decodedRefresh?.jti && decodedRefresh.exp > Date.now() / 1000) {
        try {
          await revokeByJti(decodedRefresh.jti, decodedRefresh.exp);
        } catch (redisError) {
          console.warn(
            "Redis unavailable for blacklisting:",
            redisError.message
          );
        }
      }
    }

    // 3. Process access token with Redis fallback
    if (accessToken) {
      const decodedAccess = safeVerifyOrDecode(
        accessToken,
        process.env.ACCESS_TOKEN_SECRET,
        {
          issuer: process.env.JWT_ISSUER,
          audience: process.env.JWT_AUDIENCE,
        }
      );

      if (decodedAccess?.jti && decodedAccess.exp > Date.now() / 1000) {
        try {
          await revokeByJti(decodedAccess.jti, decodedAccess.exp);
        } catch (redisError) {
          console.warn(
            "Redis unavailable for access token blacklisting:",
            redisError.message
          );
        }
      }
    }

    // 4. Invalidate database tokens (atomic operations)
    if (decodedRefresh?.userId) {
      const userId = decodedRefresh.userId;
      const logoutAll = String(req.query?.all) === "true";

      if (logoutAll) {
        await User.findByIdAndUpdate(userId, {
          $inc: { tokenVersion: 1 },
          $unset: { refreshToken: "" },
        }).exec();
      } else if (refreshToken) {
        await User.findOneAndUpdate(
          { _id: userId, refreshToken: refreshToken },
          { $unset: { refreshToken: "" } }
        ).exec();
      }
    }

    return apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error);
    clearCookie(res, REFRESH_TOKEN_COOKIE_NAME);

    return apiResponseManager(req, res, {
      statusCode: 200,
      success: true,
      message: "Logged out successfully",
    });
  }
};
