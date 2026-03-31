// backend/services/email/config/email.config.js
import dotenv from "dotenv";
dotenv.config();

export const EMAIL_CONFIG = {
<<<<<<< HEAD
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
=======
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
>>>>>>> 0f9bd8b (fix(tests): configure MongoDB Memory Server for offline binary usage)
    },
  },
  settings: {
    retryAttempts: 3,
    timeout: 10000,
    enableQueue: process.env.NODE_ENV === "production",
  },
};

export default EMAIL_CONFIG;
