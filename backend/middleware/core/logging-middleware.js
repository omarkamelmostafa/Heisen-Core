import { format } from "date-fns";
import fs from "fs/promises";
import path from "path";
import {
  ensureDirectoryExists,
  ensureFileExists,
} from "./../../utilities/utils.js";
import logger from "./../../utilities/general/logger.js";

const logDirName = "logs";

/**
 * Legacy logMessage function.
 * @deprecated Use the new structured Logger instead.
 */
export const logMessage = async (message, fileName, level = "info") => {
  // Validate the log level.
  if (!["error", "warn", "info", "debug", "success"].includes(level)) {
    throw new Error(`Invalid log level: ${level}`);
  }

  const dateTime = `${format(new Date(), "yyyyMMdd\tHH:mm:ss")}`;
  const logLevel = level.toLowerCase();
  const logItem = `${dateTime}\t[${logLevel}]\t${message}\n`;

  try {
    const logsDir = path.join(process.cwd(), logDirName);
    await ensureDirectoryExists(logsDir);
    await ensureFileExists(fileName, path.join(logDirName, fileName));
    await fs.appendFile(path.join(logsDir, fileName), logItem);
  } catch (err) {
    console.error(err);
  }
};

export const createLoggingMiddleware = (req, res, next) => {
  const startTime = Date.now();

  // Log request start
  logger.info({
    requestId: req.requestId,
    method: req.method,
    url: req.originalUrl,
    origin: req.headers.origin,
  }, "Request started");

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const logLevel = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "info";

    logger[logLevel]({
      requestId: req.requestId,
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      statusMessage: res.statusMessage,
      responseTime: `${duration}ms`,
    }, "Request finished");

    // Also call legacy logMessage for errors to maintain existing file logs during transition
    if (res.statusCode >= 400) {
      logMessage(
        `requestId: ${req.requestId}\tstatusCode: ${res.statusCode}\tmethod: ${req.method}\tstatusMessage: ${res.statusMessage}\toriginalUrl: ${req.originalUrl}`,
        "error.log",
        "error"
      );
    }
  });
  next();
};
// // Conditionally log response details only if status code is 429
// if (res.statusCode === 429) {
//   logMessage(
//     `${res.statusCode}\t${res.statusMessage}\t${req.method}\t${req.originalUrl}`,
//     "error.log",
//     "error"
//   );
//   // console.log(
//   //   `${res.statusCode}\t${res.statusMessage}\t${req.method}\t${req.originalUrl}`
//   // );
// }
// else
// Log any errors
