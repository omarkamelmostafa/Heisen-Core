// 🌍 Environment & Core Dependencies
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import cookieParser from "cookie-parser";

// ⚙️ Configuration
import { corsOptions } from "./config/cors-options.js";
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
app.use(cors(corsOptions)); // Cross-Origin Resource Sharing
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

// connectToMongo()
//   .then(async () => {
//     // Optional: Database seeding
//     // await seedPermissionsAndRoles();
//     // await seedUsers();

//     const PORT = process.env.PORT || 4000;
//     app
//       .listen(PORT, () => {
//         emitLogMessage(`🚀 Server started on port ${PORT}`, "success");
//         emitLogMessage(
//           `📊 Health check available at http://localhost:${PORT}/health`,
//           "info"
//         );
//       })
//       .on("error", (error) => {
//         emitLogMessage(`❌ Error starting server: ${error}`, "error");
//         process.exit(1);
//       });
//   })
//   .catch((error) => {
//     emitLogMessage(`❌ MongoDB connection failed: ${error}`, "error");
//     process.exit(1);
//   });

// // Graceful shutdown handling
// process.on("SIGINT", () => {
//   emitLogMessage("🛑 Server shutting down gracefully...", "info");
//   process.exit(0);
// });

// process.on("SIGTERM", () => {
//   emitLogMessage("🛑 Server terminated gracefully...", "info");
//   process.exit(0);
// });

// // 🌍 Environment & Core Dependencies
// import dotenv from "dotenv";
// import express from "express";
// import path from "path";
// import { fileURLToPath } from "url";
// import cors from "cors";
// import cookieParser from "cookie-parser";

// // ⚙️ Configuration
// import { corsOptions } from "./config/cors-options.js";
// import { connectToMongo } from "./config/connect-db.js";

// // 🧩 Core Middlewares
// import { bodyParserMiddleware } from "./middleware/body-parser-middleware.js";
// import { createRequestIdMiddleware } from "./middleware/request-id-middleware.js";
// import { rateLimiterMiddleware } from "./middleware/rate-limiter-middleware.js";
// import { errorHandlerMiddleware } from "./middleware/error-handler-middleware.js";

// // 🧠 Logging Middlewares
// import { createLoggingMiddleware } from "./middleware/logging-middleware.js";
// import { createUserActivityLogger } from "./middleware/logging-user-activity-middleware.js";

// // 🛡️ Security & Validation Middlewares
// import { helmetMiddleware } from "./middleware/helmet-middleware.js";
// import { credentials } from "./middleware/credentials.js";
// import { contentTypeNegotiationMiddleware } from "./middleware/content-type-negotiation-middleware.js";
// import { createSanitizeMiddleware } from "./middleware/sanitize-middleware.js";

// // 🔐 Authentication Middleware (optional)
// // import { authTokenMiddleware } from "./middleware/authTokenMiddleware.js";

// // 🚀 Routes
// import authRoutes from "./routes/auth.js";
// import refreshTokenRoutes from "./routes/refresh.js";
// import registerRoutes from "./routes/register.js";

// // 🧰 Utilities
// import { emitLogMessage } from "./utilities/emit-log.js";

// const app = express();

// /* CONFIGURATIONS */
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// dotenv.config();

// // Custom middlewares
// app.use(bodyParserMiddleware);
// app.use(createLoggingMiddleware);
// app.use(contentTypeNegotiationMiddleware);
// app.use(createSanitizeMiddleware);
// app.use(cookieParser());
// app.use(helmetMiddleware);
// app.use(rateLimiterMiddleware); // Set up middleware to limit requests
// app.use(createUserActivityLogger(["/test-error", "/assets"])); // Log user activity const excludedRoutes = ["/test-error", "/assets"];
// app.use(credentials);
// app.use(cors(corsOptions)); // Set up custome middleware to allow cross-origin resource sharing // Cross Origin Resource Sharing
// app.use(createRequestIdMiddleware);

// app.use("/assets", express.static(path.join(__dirname, "public/assets")));

// // Routes: "public routes" or "unprotected routes
// app.use("/api/v1/auth", authRoutes);
// app.use("/api/v1/register", registerRoutes);
// app.use("/api/v1/refresh", refreshTokenRoutes);
// // app.use("/api/v1/logout", logoutRoutes);

// // Handling errors with custom errorHandler middleware
// app.use(errorHandlerMiddleware);

// // MongoDB & server setup
// // Connect to MongoDB and start the server
// connectToMongo()
//   .then(async () => {
//     // await seedPermissionsAndRoles();
//     // await seedUsers();
//     const PORT = process.env.PORT || 4000;
//     app
//       .listen(PORT, () => {
//         emitLogMessage(`Server started on port ${PORT}`, "success");
//       })
//       .on("error", (error) => {
//         emitLogMessage(
//           `Error occurred while starting the server: ${error}`,
//           "error"
//         );
//       });
//   })
//   .catch((error) => {
//     emitLogMessage(`Failed to connect to MongoDB: ${error}`, "error");

//     process.exit(1);
//   });

// // Intentionally throwing an error to test errorHandler middleware
// app.get("/test-error", (req, res, next) => {
//   res.status(500).send({ message: "This is a test error!" });
// });

// // Health Check Route
// app.get("/health", (req, res) => res.status(200).json({ status: "OK" }));
