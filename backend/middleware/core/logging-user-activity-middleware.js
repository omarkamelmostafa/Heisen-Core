import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs/promises";
import path from "path";
import {
  ensureDirectoryExists,
  ensureFileExists,
} from "../../utilities/utils.js";
import logger from "../../utilities/general/logger.js";

const logDirName = "logs";
const userActivityLogFile = "user_activity.log";

/**
 * Legacy logUserActivity function.
 * @deprecated Use the new structured Logger instead.
 */
export const logUserActivity = async (userInfo, fileName, action) => {
  try {
    const logsDir = path.join(process.cwd(), logDirName);
    await ensureDirectoryExists(logsDir);
    await ensureFileExists(fileName, path.join(logsDir, userActivityLogFile));

    const dateTime = `${format(new Date(), "yyyyMMdd\tHH:mm:ss")}`;
    const logItem = `${dateTime}\t${uuid()}\tUser\t${userInfo}\t${action}\n`;

    await fs.appendFile(path.join(logsDir, fileName), logItem);
  } catch (err) {
    console.error("Error logging user activity:", err);
  }
};

// User activity middleware
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
