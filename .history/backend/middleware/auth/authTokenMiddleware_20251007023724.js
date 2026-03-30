import jwt from "jsonwebtoken";
import { clearCookie } from "../../utilities/general/cookie-utils.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import { handleRefreshToken } from "../../controllers/auth/refreshTokenController.js";

export const authTokenMiddleware = (req, res, next) => {
  let authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const cookieName = "jwt_client";

  // Bypass /assets route to avoid clearing cookies for static files
  // if (req.url.startsWith("/assets") || req.url === "/favicon.ico") {
  //   console.log("Bypassing authentication for Request URL: ", req.url); // Log the request URL
  //   return next(); // Skip auth for assets and favicon
  // }

  // Check if Authorization header is missing or invalid
  // !authHeader.substring(7).trim() ||
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Clear cookie on missing or invalid token
    // clearCookie(res, cookieName);
    return apiResponseManager(req, res, {
      statusCode: 401, // 401 Unauthorized
      success: false,
      message: "Unauthorized - Missing or invalid token",
      errorDetails: "Token not provided or invalid format",
      requestId: req?.requestId,
    });
  }

  let token = authHeader.substring(7).trim(); // Extract token after 'Bearer ' prefix
  // Handle missing token case
  if (!token) {
    // clearCookie(res, cookieName); // Clear cookie when token is missing
    return apiResponseManager(req, res, {
      statusCode: 401, // 401 Unauthorized
      success: false,
      message: "Unauthorized - No token provided",
      errorDetails: "Token not provided",
      requestId: req?.requestId,
    });
  }

  // Token verification
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    req.user = decoded.UserInfo; // Attach decoded user info to the request
    // if the token has expired, check the cookie and refreh token and grant him a new access token

    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      // Handle expired token
      console.log(
        "Access token expired. Attempting to refresh token from client cookie."
      );
      return apiResponseManager(req, res, {
        statusCode: 401, // 401 Unauthorized
        success: false,
        message: "Unauthorized - Expired Token",
        errorDetails: "access token expired",
        requestId: req?.requestId,
      });
    } else if (err instanceof jwt.JsonWebTokenError) {
      // Handle other JWT errors (invalid signature, malformed, etc.)
      // clearCookie(res, cookieName); // Clear cookie for invalid tokens
      return apiResponseManager(req, res, {
        statusCode: 401, // 401 Unauthorized
        success: false,
        message: "Unauthorized - Invalid token",
        errorDetails: "Invalid token",
        requestId: req?.requestId,
      });
    } else {
      // Handle any other errors
      return apiResponseManager(req, res, {
        statusCode: 500, // 500 Internal Server Error
        success: false,
        message: "Internal server error",
        errorDetails: "Error verifying token",
        requestId: req?.requestId,
      });
    }
  }
};

// console.log("req.user: ", req.user);
// req.user:  {
//   userId: '66e80b0a6ee3f4ac08a20665',
//   email: 'gus@bb.com',
//   uuid: '3f6bab7a-2963-4614-8150-f9d425bbe7b2'
// }
