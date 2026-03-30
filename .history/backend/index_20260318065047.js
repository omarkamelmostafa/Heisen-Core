import dotenv from "dotenv";
import { validateEnv } from "./config/validate-env.js";


import app from "./app.js";



import { initCloudinary } from "./config/cloudinary.js";
// Load env vars before doing anything else
dotenv.config();

// Validate env vars
validateEnv();





 
 




// // Load Cloudinary configuration (must be after dotenv.config())
// await import("./config/cloudinary.js");



// const { default: app } = await import("./app.js");

// ⚙️ Configuration
import {
  connectToMongo,
  disconnectFromMongo,
  getConnectionStatus,
} from "./config/connect-db.js";

// 🧰 Utilities
import { emitLogMessage } from "./utilities/general/emit-log.js";

/* ========================
   🚀 SERVER INITIALIZATION
   ======================== */

// Enhanced server startup with better connection handling
const startServer = async () => {
  try {
    // Attempt database connection
    await connectToMongo();

    // Verify connection is actually established
    const connectionStatus = getConnectionStatus();
    if (connectionStatus !== 1) {
      throw new Error("Database connection not established properly");
    }

    emitLogMessage("✅ Database connection verified", "success");

    // Optional: Database seeding (uncomment if needed)
    // await seedUsers();

    const PORT = process.env.PORT || 4000;

    server = app.listen(PORT, () => {
      emitLogMessage(`🚀 Server started on port ${PORT}`, "success");
      emitLogMessage(
        `📊 Health check available at http://localhost:${PORT}/test/health`,
        "info"
      );
      emitLogMessage(
        `🌐 Database mode: ${process.env.DB_CONNECTION_MODE || "local"}`,
        "info"
      );
    });

    // Enhanced error handling for server
    server.on("error", (error) => {
      emitLogMessage(`❌ Error starting server: ${error.message}`, "error");
      process.exit(1);
    });

    return server;
  } catch (error) {
    emitLogMessage(`❌ Startup failed: ${error.message}`, "error");
    process.exit(1);
  }
};

// Graceful shutdown handler
const gracefulShutdown = async (signal) => {
  emitLogMessage(`🛑 Received ${signal}, shutting down gracefully...`, "info");

  try {
    // 1. Close server first (stop accepting new requests)
    if (server) {
      await new Promise((resolve) => server.close(resolve));
      emitLogMessage("✅ HTTP server closed", "success");
    }

    // 2. Disconnect from database
    await disconnectFromMongo();
    emitLogMessage("✅ Database connection closed", "success");

    emitLogMessage("✅ Shutdown completed", "success");
    process.exit(0);
  } catch (error) {
    emitLogMessage(`Error during shutdown: ${error.message}`, "error");
    process.exit(1);
  }
};

// Start the server
let server;
startServer().then((runningServer) => {
  server = runningServer;
});

// Enhanced graceful shutdown handling
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Handle uncaught exceptions and unhandled rejections
process.on("uncaughtException", (error) => {
  emitLogMessage(`💥 Uncaught Exception: ${error.message}`, "error");
  process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
  emitLogMessage(
    `💥 Unhandled Rejection at: ${promise}, reason: ${reason}`,
    "error"
  );
  process.exit(1);
});
