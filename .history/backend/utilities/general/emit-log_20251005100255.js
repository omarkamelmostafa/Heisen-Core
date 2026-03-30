import chalk from "chalk";

/**
 * Emits a styled log message to the console with optional timestamp and custom colors.
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
  // Define and validate supported log levels
  const validLevels = ["error", "info", "success"];
  if (!validLevels.includes(level)) {
    throw new Error(
      `Invalid log level: "${level}". Expected one of: ${validLevels.join(
        ", "
      )}`
    );
  }

  // Modernized and consistent default color scheme
  const defaultColors = {
    error: chalk.bgRed.bold.white,
    info: chalk.bgBlueBright.bold.white,
    success: chalk.bgGreen.bold.black,
  };

  // Resolve chalk style: prioritize custom over default
  const style = customColors[level] || defaultColors[level];

  // Generate timestamp only once (performance & clarity)
  const timestamp = includeTimestamp
    ? chalk.dim(`[${new Date().toLocaleTimeString()}]`)
    : "";

  // Build structured and visually balanced message
  // const label = chalk.reset.bold(`[${level.toUpperCase()}]`);
  const label = chalk.reset.bold(
    `[${level
      .toUpperCase()
      .toUpperCase()
      .replace(
        /./,
        (c) => customColors[level]?.[c] || defaultColors[level]?.[c] || c
      )}]`
  );
  const formattedMessage = `${
    timestamp ? `${timestamp} ` : ""
  }${label} ${message}`;

  // Emit the log to the console in one clean output
  console.log(style(` ${formattedMessage} `));
};
