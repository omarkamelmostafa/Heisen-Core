// backend/services/email/config/email.config.js
import dotenv from "dotenv";
dotenv.config();

export const EMAIL_CONFIG = {
  provider: "mailtrap",
  mailtrap: {
    host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
    port: parseInt(process.env.MAILTRAP_PORT) || 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
    sender: {
      email: process.env.MAIL_FROM_ADDRESS || "noreply@fantasycoach.com",
      name: process.env.MAIL_FROM_NAME || "Fantasy Coach",
    },
  },
  settings: {
    retryAttempts: 3,
    timeout: 10000,
    enableQueue: process.env.NODE_ENV === "production",
  },
};

export default EMAIL_CONFIG;
