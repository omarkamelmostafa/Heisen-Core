// loggingMiddleware.js

import { format } from "date-fns";
import { v4 as uuid } from "uuid";
import fs from "fs/promises";
import path from "path";
import {
  ensureDirectoryExists,
  ensureFileExists,
} from "./../../utilities/utils.js";

const logDirName = "logs";

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
  logMessage(
    // `${req.requestId}\t${req.method}\t${req.headers.origin}\t${req.originalUrl}`,
    `requestId: ${req.requestId}\tmethod: ${req.method}\torigin: ${req.headers.origin}\toriginalUrl: ${req.originalUrl}`,
    "app.log",
    "info"
  );
  console.log(
    `${req.method}\t${req.originalUrl}\t${format(new Date(), "HH:mm:ss")}`
  );

  res.on("finish", () => {
    if (res.statusCode >= 400 && res.statusCode < 600) {
      logMessage(
        `requestId: ${req.requestId}\tstatusCode: ${res.statusCode}\tmethod: ${req.method}\tstatusMessage: ${res.statusMessage}\toriginalUrl: ${req.originalUrl}`,
        "error.log",
        "error"
      );
      // console.log(
      //   `${res.statusCode}\t${res.statusMessage}\t${req.method}\t${req.originalUrl}`
      // );
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
