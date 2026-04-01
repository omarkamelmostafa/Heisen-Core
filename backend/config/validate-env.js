// backend/config/validate-env.js
import logger from "../utilities/general/logger.js";

const REQUIRED = [
  {
    name: "ACCESS_TOKEN_SECRET",
    message: "JWT access tokens cannot be signed. Auth will crash.",
  },
  {
    name: "REFRESH_TOKEN_SECRET",
    message: "JWT refresh tokens cannot be signed. Auth will crash.",
  },
];

const RECOMMENDED = [
  {
    name: "ETHEREAL_HOST",
    message: "Email sending will fail. Registration and password reset affected.",
  },
  {
    name: "ETHEREAL_PORT",
    message: "Email sending will fail. Registration and password reset affected.",
  },
  {
    name: "ETHEREAL_USER",
    message: "Email sending will fail. Registration and password reset affected.",
  },
  {
    name: "ETHEREAL_PASS",
    message: "Email sending will fail. Registration and password reset affected.",
  },
  {
    name: "ALLOWED_ORIGINS",
    default: "http://localhost:3000",
    message: "CORS will only allow localhost:3000.",
  },
  {
    name: "FRONTEND_URL",
    message: "FRONTEND_URL is not set. Defaulting to http://localhost:3000",
  },
];

export function validateEnv() {
  const missing = [];
  const warnings = [];

  for (const variable of REQUIRED) {
    if (!process.env[variable.name]) {
      missing.push(`  ✖ ${variable.name}: ${variable.message}`);
    }
  }

  for (const variable of RECOMMENDED) {
    if (!process.env[variable.name]) {
      warnings.push(`  ⚠ ${variable.name}: ${variable.message}`);
    }
  }

  if (warnings.length > 0) {
    logger.warn(
      `\n━━━ Environment Warnings ━━━\n${warnings.join("\n")}\n`
    );
  }

  if (missing.length > 0) {
    logger.error(
      `\n━━━ Missing Required Environment Variables ━━━\n${missing.join("\n")}\n`
    );
    throw new Error(
      "Server cannot start: missing required environment variables. See logs above."
    );
  }

  logger.info("Environment validation passed");
}
