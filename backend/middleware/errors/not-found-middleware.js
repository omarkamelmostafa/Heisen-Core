// backend/middleware/errors/not-found-middleware.js
import { apiResponseManager } from "../../utilities/general/response-manager.js";

export const notFoundMiddleware = (req, res) => {
  return apiResponseManager(req, res, {
    statusCode: 404,
    success: false,
    message: "Route not found",
    errorCode: "ROUTE_NOT_FOUND",
  });
};
