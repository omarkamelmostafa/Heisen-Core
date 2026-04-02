// backend/config/connect-db.js
// /**
//  * Configuration module for MongoDB database connection with environment switching
//  */
import mongoose from "mongoose";
import { emitLogMessage } from "../utilities/general/emit-log.js";
import dotenv from "dotenv";
dotenv.config();

const DB_MODES = {
  LOCAL: "local",
  ATLAS: "atlas",
};

const databaseConfigs = {
  [DB_MODES.LOCAL]: {
    host: process.env.DB_LOCAL_HOST || "127.0.0.1",
    port: process.env.DB_LOCAL_PORT || 27017,
    database: process.env.DB_LOCAL_NAME || "HEISEN-CORE",
    user: process.env.DB_LOCAL_USER || "",
    password: process.env.DB_LOCAL_PASSWORD || "",
  },
  [DB_MODES.ATLAS]: {
    uri: process.env.DATABASE_URI,
    database: process.env.DB_ATLAS_NAME || "HEISEN-CORE",
  },
};

const getConnectionMode = () => {
  return process.env.DB_CONNECTION_MODE?.toLowerCase() === DB_MODES.ATLAS
    ? DB_MODES.ATLAS
    : DB_MODES.LOCAL;
};

const getConnectionString = (mode) => {
  switch (mode) {
    case DB_MODES.ATLAS:
      if (!databaseConfigs[DB_MODES.ATLAS].uri) {
        throw new Error(
          "DATABASE_URI environment variable is required for Atlas connection"
        );
      }
      return databaseConfigs[DB_MODES.ATLAS].uri;

    case DB_MODES.LOCAL:
    default: {
      const config = databaseConfigs[DB_MODES.LOCAL];
      if (config.user && config.password) {
        return `mongodb://${encodeURIComponent(config.user)}:${encodeURIComponent(
          config.password
        )}@${config.host}:${config.port}/${config.database}`;
      }
      return `mongodb://${config.host}:${config.port}/${config.database}`;
    }
  }
};

const getConnectionOptions = () => ({
  retryWrites: true,
  w: "majority",
  appName: "heisen-core-app",
});

// --- reconnect state ---
let reconnectTimer = null;
let reconnectAttempts = 0;
let isReconnecting = false;

const clearReconnectTimer = () => {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
};

const startReconnectLoop = () => {
  if (isReconnecting) return; // prevent duplicate loops
  isReconnecting = true;

  const attemptReconnect = async () => {
    reconnectAttempts += 1;

    emitLogMessage(
      `🔄 MongoDB reconnect attempt #${reconnectAttempts}...`,
      "info"
    );

    try {
      const connectionMode = getConnectionMode();
      const connectionString = getConnectionString(connectionMode);
      const options = getConnectionOptions();

      await mongoose.connect(connectionString, options);

      emitLogMessage("✅ MongoDB reconnected successfully", "success");
      reconnectAttempts = 0;
      isReconnecting = false;
      clearReconnectTimer();
    } catch (error) {
      emitLogMessage(
        `❌ Reconnect attempt #${reconnectAttempts} failed: ${error.message}`,
        "error"
      );

      reconnectTimer = setTimeout(attemptReconnect, 1000);
    }
  };

  reconnectTimer = setTimeout(attemptReconnect, 1000);
};

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
    throw error;
  }
};

export const disconnectFromMongo = async () => {
  try {
    clearReconnectTimer();
    isReconnecting = false;
    reconnectAttempts = 0;

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

export const getConnectionStatus = () => mongoose.connection.readyState;

// --- event listeners ---
mongoose.connection.on("disconnected", () => {
  emitLogMessage("📡 MongoDB disconnected", "info");
  startReconnectLoop();
});

mongoose.connection.on("connected", () => {
  emitLogMessage("MongoDB connected", "info");
  clearReconnectTimer();
  isReconnecting = false;
  reconnectAttempts = 0;
});

mongoose.connection.on("error", (error) => {
  emitLogMessage(`MongoDB connection error: ${error.message}`, "error");
});

mongoose.connection.on("reconnected", () => {
  emitLogMessage("🔁 MongoDB reconnected", "success");
  clearReconnectTimer();
  isReconnecting = false;
  reconnectAttempts = 0;
});