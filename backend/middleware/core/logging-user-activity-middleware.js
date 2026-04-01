// backend/middleware/core/logging-user-activity-middleware.js
import logger from "../../utilities/general/logger.js";
export const createUserActivityLogger = ({ excludedRoutes = [] } = {}) => {
  return async (req, res, next) => {
    try {
      if (req && !excludedRoutes.includes(req.path)) {
        // Attempt to get user info from request if it exists (e.g. from auth middleware)
        const user = req.user || { id: "anonymous", email: "anonymous" };

        logger.info({
          requestId: req.requestId,
          userId: user.id || user._id,
          userEmail: user.email,
          method: req.method,
          url: req.originalUrl,
          path: req.path,
          action: "user_activity"
        }, "User activity");
      }
    } catch (err) {
      logger.error({ err, requestId: req.requestId }, "Error in user activity middleware");
    }
    next();
  };
};
