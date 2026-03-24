// backend/middleware/auth/authTokenMiddleware.js
// Verifies the access token from the Authorization: Bearer <token> header.
// Checks the Redis blacklist for revoked JTIs.

import jwt from "jsonwebtoken";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import { isTokenRevoked } from "../../services/auth/token-service.js";
import logger from "../../utilities/general/logger.js";

export const authTokenMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];

  // Check if Authorization header is missing or invalid
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return apiResponseManager(req, res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized - Missing or invalid token",
      errorDetails: "Token not provided or invalid format",
      errorCode: "NO_ACCESS_TOKEN",
      requestId: req?.requestId,
    });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return apiResponseManager(req, res, {
      statusCode: 401,
      success: false,
      message: "Unauthorized - No token provided",
      errorDetails: "Token not provided",
      errorCode: "NO_ACCESS_TOKEN",
      requestId: req?.requestId,
    });
  }

  // Token verification
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    if (decoded?.UserInfo?.type !== "access") {
      return apiResponseManager(req, res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized - Invalid token type",
        errorDetails: "Invalid token type",
        errorCode: "TOKEN_INVALID",
        requestId: req?.requestId,
      });
    }

    // Check JTI blacklist (Redis)
    if (decoded.jti) {
      const revoked = await isTokenRevoked(decoded.jti);
      if (revoked) {
        return apiResponseManager(req, res, {
          statusCode: 401,
          success: false,
          message: "Unauthorized - Token has been revoked",
          errorDetails: "Token revoked",
          errorCode: "TOKEN_INVALID",
          requestId: req?.requestId,
        });
      }
    }

    req.user = decoded.UserInfo; // Attach decoded user info to the request
    next();
  } catch (err) {
    if (err instanceof jwt.TokenExpiredError) {
      logger.debug("Access token expired — client should refresh");
      return apiResponseManager(req, res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized - Expired Token",
        errorDetails: "access token expired",
        errorCode: "TOKEN_EXPIRED",
        requestId: req?.requestId,
      });
    } else if (err instanceof jwt.JsonWebTokenError) {
      return apiResponseManager(req, res, {
        statusCode: 401,
        success: false,
        message: "Unauthorized - Invalid token",
        errorDetails: "Invalid token",
        errorCode: "TOKEN_INVALID",
        requestId: req?.requestId,
      });
    } else {
      return apiResponseManager(req, res, {
        statusCode: 500,
        success: false,
        message: "Internal server error",
        errorDetails: "Error verifying token",
        requestId: req?.requestId,
      });
    }
  }
};
