
import dotenv from "dotenv";
dotenv.config();

export const EMAIL_CONFIG = {
  provider: "mailtrap",
  mailtrap: {
    /* 
    OLD CONFIG (Production API):
    endpoint: "https://send.api.mailtrap.io",
    token: process.env.MAILTRAP_TOKEN,
    sender: { email: "hello@demomailtrap.co", name: "Fantasy Coach" }
    */

    // NEW CONFIG (Sandbox/Testing API):
    endpoint: process.env.MAILTRAP_ENDPOINT || "https://sandbox.api.mailtrap.io",
    token: process.env.MAILTRAP_TOKEN,
    testInboxId: parseInt(process.env.MAILTRAP_TEST_INBOX_ID) || 4440644,
    sender: {
      email: "hello@example.com", // Mailtrap Sandbox default
      name: "Fantasy Coach",
    },
  },
  settings: {
    retryAttempts: 3,
    timeout: 10000,
    enableQueue: process.env.NODE_ENV === "production",
  },
};

export default EMAIL_CONFIG;
