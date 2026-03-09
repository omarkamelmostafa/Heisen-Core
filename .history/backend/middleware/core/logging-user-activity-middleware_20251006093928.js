// loggingUserActivityMiddleware.js

import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs/promises";
import path from "path";
import {
  ensureDirectoryExists,
  ensureFileExists,
} from "../../utilities/utils.js";
import { logMessage } from "./logging-middleware.js";

const logDirName = "logs";
const userActivityLogFile = "user_activity.log";

// const DEFAULT_LOG_FORMAT = `${format(new Date(), "yyyyMMdd\tHH:mm:ss")}`;

// Log user activity
export const logUserActivity = async (userInfo, fileName, action) => {
  try {
    const logsDir = path.join(process.cwd(), logDirName);
    await ensureDirectoryExists(logsDir);
    await ensureFileExists(fileName, path.join(logsDir, userActivityLogFile));

    const dateTime = `${format(new Date(), "yyyyMMdd\tHH:mm:ss")}`;
    const logMessage = `${dateTime}\t${uuid()}\tUser\t${userInfo}\t${action}\n`;

    await fs.appendFile(path.join(logsDir, fileName), logMessage);
  } catch (err) {
    console.error("Error logging user activity:", err);
  }
};

// User activity middleware
export const createUserActivityLogger = ({ excludedRoutes = [] } = {}) => {
  return async (req, res, next) => {
    try {
      // console.log(`req.originalUrl: ${req.originalUrl}`);
      // console.log(`req.path: ${req.path}`);

      if (req && !excludedRoutes.includes(req.path)) {
        // if (req.user && !excludedRoutes.includes(req.path)) {
        // const userId = req.user.id; // Assuming user information is stored in the request object

        const loggedUserData = "req.user"; // Assuming user information is stored in the request object
        const action = `${req.method}\t${req.originalUrl}`;
        await logUserActivity(loggedUserData, "user_activity.log", action);
      }
    } catch (err) {
      logMessage(err, "error.log", "error");
      console.error("Error in user activity middleware:", err);
    }
    next();
  };
};
