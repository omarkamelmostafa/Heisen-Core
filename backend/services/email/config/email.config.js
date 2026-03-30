// backend/services/email/config/email.config.js
import dotenv from "dotenv";
dotenv.config();

export const EMAIL_CONFIG = {
  provider: "ethereal",
  ethereal: {
    host: process.env.ETHEREAL_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.ETHEREAL_PORT) || 587,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
    sender: {
      email: process.env.MAIL_FROM_ADDRESS || "noreply@example.com",
      name: process.env.MAIL_FROM_NAME || "New Starter Kit",
    },
  },
  settings: {
    retryAttempts: 3,
    timeout: 10000,
    enableQueue: process.env.NODE_ENV === "production",
  },
};

export default EMAIL_CONFIG;
