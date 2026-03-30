import pino from "pino";

/**
 * Centralized Logger Service using Pino.
 * Provides structured JSON output for production and readable output for development.
 * 
 * Usage:
 * import logger from "./utilities/general/logger.js";
 * logger.info("message");
 * logger.error({ err }, "error message");
 * logger.info({ metadata: "data" }, "message with metadata");
 */

const isProduction = process.env.NODE_ENV === "production";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  // In production, we want standard JSON output for external log aggregators
  // In development, we use simplified transport if pino-pretty isn't available
  transport: isProduction
    ? undefined
    : {
      target: "pino-pretty",
      options: {
        colorize: true,
        translateTime: "HH:mm:ss",
        ignore: "pid,hostname",
      },
    },
  base: {
    env: process.env.NODE_ENV,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
