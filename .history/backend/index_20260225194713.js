import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";

// ⚙️ Configuration
import {
  connectToMongo,
  disconnectFromMongo,
  getConnectionStatus,
} from "./config/connect-db.js";

// 🧩 Middleware Imports
// 🔐 Security Middlewares
import {
  helmetMiddleware,
  createRateLimiterMiddleware,
  createSanitizeMiddleware,
} from "./middleware/security/index.js";
import {
  credentialsMiddleware,
  createApiVersionMiddleware,
} from "./middleware/core/index.js";

// 📊 Logging & Monitoring Middlewares
import {
  createRequestIdMiddleware,
  createLoggingMiddleware,
  createUserActivityLogger,
} from "./middleware/core/index.js";

// 🔄 Processing Middlewares
import {
  bodyParserMiddleware,
  contentTypeNegotiationMiddleware,
} from "./middleware/core/index.js";

// ⚡ Error Handling
import {
  errorHandlerMiddleware,
  notFoundMiddleware,
} from "./middleware/errors/index.js";

// 🚦 Route Handlers
import authRoutes from "./routes/auth/auth-routes.js";
import healthRoutes from "./routes/health/health-routes.js";

import testRoutes from "./routes/test/test-routes.js";

// 🧰 Utilities
import { emitLogMessage } from "./utilities/general/emit-log.js";

// 🌍 Environment & Core Dependencies
import "./config/cloudinary.js";

// 🔧 Initialization
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

/* ========================
   🛡️ SECURITY MIDDLEWARES
   ======================== */
app.use(createApiVersionMiddleware({ currentVersion: "1" })); // API version headers
app.use(helmetMiddleware); // Security headers
app.use(createRateLimiterMiddleware()); // Rate limiting
app.use(credentialsMiddleware); // CORS credentials
app.use(createSanitizeMiddleware); // Input sanitization

/* ========================
   📊 MONITORING MIDDLEWARES
   ======================== */
app.use(createRequestIdMiddleware()); // Request ID generation
app.use(createLoggingMiddleware); // Request logging
app.use(
  createUserActivityLogger({ excludedRoutes: ["/test-error", "/assets"] })
); // User activity tracking

/* ========================
   🔄 PROCESSING MIDDLEWARES
   ======================== */
app.use(bodyParserMiddleware); // Body parsing
app.use(cookieParser()); // Cookie parsing
app.use(contentTypeNegotiationMiddleware); // Content negotiation

/* ========================
   📁 STATIC ASSETS
   ======================== */
app.use("/assets", express.static(path.join(__dirname, "public/assets")));

/* ========================
   🚀 API ROUTES
   ======================== */
// 🔓 Public/Unauthenticated Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/health", healthRoutes);

// 🔒 Protected Routes (if you add auth middleware later)
// app.use("/api/v1/users", authTokenMiddleware, userRoutes);
// app.use("/api/v1/admin", authTokenMiddleware, adminRoutes);

// 🧪 Test Routes (Development only)

if (process.env.NODE_ENV === "development") {
  app.use("/test", testRoutes);
  console.log("🔬 Test routes enabled at /test/*");
}

// 404 Handler (catch all unhandled routes)
app.use("*", notFoundMiddleware);
app.use(errorHandlerMiddleware);



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
    // await seedPermissionsAndRoles();
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
