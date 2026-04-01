// backend/utilities/general/emit-log.js
import chalk from "chalk";
import logger from "./logger.js";

/**
 * Emits a styled log message to the console and captures it via the structured Logger.
 *
 * @param {string} message - The message to log.
 * @param {"error" | "info" | "success"} [level="info"] - The log level.
 * @param {Object} [customColors={}] - Optional custom chalk styles per level.
 * @param {boolean} [includeTimestamp=true] - Whether to include a timestamp.
 */
export const emitLogMessage = (
  message,
  level = "info",
  customColors = {},
  includeTimestamp = true
) => {
  // Map emit-log levels to pino levels
  const pinoLevel = level === "success" ? "info" : level;

  // Capture in structured logger
  logger[pinoLevel]({
    source: "emitLogMessage",
    success: level === "success"
  }, message);

  // Define and validate supported log levels for console output
  const validLevels = ["error", "info", "success"];
  if (!validLevels.includes(level)) {
    console.warn(`[WARN] Invalid log level: "${level}". Defaulting to info.`);
    level = "info";
  }

  // Modernized and consistent default color scheme
  const defaultColors = {
    error: chalk.bgRed.bold.white,
    info: chalk.bgBlueBright.bold.white,
    success: chalk.bgGreen.bold.black,
  };

  // Resolve chalk style: prioritize custom over default
  const style = customColors[level] || defaultColors[level];

  // Generate timestamp only once
  const timestamp = includeTimestamp
    ? chalk.dim(`[${new Date().toLocaleTimeString()}]`)
    : "";

  const label = chalk.reset.bold(`[${level.toUpperCase()}]`);
  const formattedMessage = `${timestamp ? `${timestamp} ` : ""}${label} ${message}`;

  // Emit the "pretty" log to the console
  console.log(style(` ${formattedMessage} `));
};

