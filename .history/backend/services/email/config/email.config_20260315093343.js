import dotenv from "dotenv";
dotenv.config();

export const EMAIL_CONFIG = {
  provider: "mailtrap", // Can be 'sendgrid', 'ses' in future
  mailtrap: {
    endpoint: process.env.MAILTRAP_ENDPOINT,
    token: process.env.MAILTRAP_TOKEN,
    sender: {
      email: "he@demomailtrap.co",
      name: "Fantasy Coach", // Updated from "Burak"
    },
  },
  settings: {
    retryAttempts: 3,
    timeout: 10000,
    enableQueue: process.env.NODE_ENV === "production",
  },
};

export default EMAIL_CONFIG;
