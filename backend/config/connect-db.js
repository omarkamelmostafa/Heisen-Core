// backend/config/connect-db.js
/**
 * Configuration module for MongoDB database connection with environment switching
 */

import mongoose from "mongoose";
import { emitLogMessage } from "../utilities/general/emit-log.js";
import dotenv from "dotenv";
dotenv.config();

// Database connection modes
const DB_MODES = {
  LOCAL: "local",
  ATLAS: "atlas",
};

// Database configurations
const databaseConfigs = {
  [DB_MODES.LOCAL]: {
    host: process.env.DB_LOCAL_HOST || "127.0.0.1",
    port: process.env.DB_LOCAL_PORT || 27017,
    database: process.env.DB_LOCAL_NAME || "fantasy-coach",
    user: process.env.DB_LOCAL_USER || "",
    password: process.env.DB_LOCAL_PASSWORD || "",
  },
  [DB_MODES.ATLAS]: {
    uri: process.env.DATABASE_URI,
    database: process.env.DB_ATLAS_NAME || "fantasy-coach",
  },
};

// Determine connection mode (default to local if not specified)
const getConnectionMode = () => {
  return process.env.DB_CONNECTION_MODE?.toLowerCase() === DB_MODES.ATLAS
    ? DB_MODES.ATLAS
    : DB_MODES.LOCAL;
};

// Construct connection string based on mode
const getConnectionString = (mode) => {
  switch (mode) {
    case DB_MODES.ATLAS:
      if (!databaseConfigs.atlas.uri) {
        throw new Error(
          "DATABASE_URI environment variable is required for Atlas connection"
        );
      }
      return databaseConfigs.atlas.uri;

    case DB_MODES.LOCAL:
    default:
      const config = databaseConfigs.local;
      if (config.user && config.password) {
        return `mongodb://${encodeURIComponent(
          config.user
        )}:${encodeURIComponent(config.password)}@${config.host}:${config.port
          }/${config.database}`;
      }
      return `mongodb://${config.host}:${config.port}/${config.database}`;
  }
};

// Get connection options
const getConnectionOptions = () => {
  return {
    retryWrites: true,
    w: "majority",
    appName: "fantasy-coach-app",
  };
};

// Export a function to connect to the MongoDB database
export const connectToMongo = async () => {
  try {
    const connectionMode = getConnectionMode();
    const connectionString = getConnectionString(connectionMode);
    const options = getConnectionOptions();

    emitLogMessage(
      `Attempting to connect to ${connectionMode.toUpperCase()} database...`,
      "info"
    );

    await mongoose.connect(connectionString, options);

    emitLogMessage(
      `✅ Successfully connected to ${connectionMode.toUpperCase()} MongoDB!`,
      "success"
    );
    emitLogMessage(
      `📊 Database: ${mongoose.connection.db?.databaseName || "Unknown"}`,
      "info"
    );
    emitLogMessage(`🌐 Host: ${mongoose.connection.host || "Unknown"}`, "info");
  } catch (error) {
    emitLogMessage(
      `❌ Error while connecting to database: ${error.message}`,
      "error"
    );
    throw error; // Re-throw to handle in calling code
  }
};

// Utility functions for connection management
export const disconnectFromMongo = async () => {
  try {
    await mongoose.disconnect();
    emitLogMessage("✅ Disconnected from MongoDB", "success");
  } catch (error) {
    emitLogMessage(
      `❌ Error disconnecting from database: ${error.message}`,
      "error"
    );
    throw error;
  }
};

export const getConnectionStatus = () => {
  return mongoose.connection.readyState;
};

// Connection event listeners for better monitoring
mongoose.connection.on("disconnected", () => {
  emitLogMessage("📡 MongoDB disconnected", "info");

  // Exponential backoff reconnection
  let reconnectAttempts = 0;
  const maxReconnectAttempts = 10;
  const baseDelay = 1000;

  const attemptReconnect = () => {
    reconnectAttempts++;
    emitLogMessage(`MongoDB reconnection attempt ${reconnectAttempts}/${maxReconnectAttempts}`, "info");

    const connectionMode = getConnectionMode();
    const connectionString = getConnectionString(connectionMode);
    const options = getConnectionOptions();

    mongoose.connect(connectionString, options)
      .then(() => {
        emitLogMessage("MongoDB reconnected successfully", "success");
        reconnectAttempts = 0;
      })
      .catch((error) => {
        if (reconnectAttempts >= maxReconnectAttempts) {
          emitLogMessage(`Failed to reconnect after ${maxReconnectAttempts} attempts: ${error.message}`, "error");
          return;
        }
        const nextDelay = Math.min(baseDelay * Math.pow(2, reconnectAttempts), 30000);
        emitLogMessage(`Reconnection failed, retrying in ${nextDelay / 1000}s...`, "warn");
        setTimeout(attemptReconnect, nextDelay);
      });
  };

  const initialDelay = Math.min(baseDelay * Math.pow(2, reconnectAttempts), 30000);
  setTimeout(attemptReconnect, initialDelay);
});

mongoose.connection.on("connected", () => {
  emitLogMessage("MongoDB connected", "info");
});

mongoose.connection.on("error", (error) => {
  emitLogMessage(`MongoDB connection error: ${error.message}`, "error");
});

mongoose.connection.on("reconnected", () => {
  emitLogMessage("🔁 MongoDB reconnected", "success");
});
