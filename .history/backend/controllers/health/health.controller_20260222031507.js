import { getConnectionStatus } from "../../config/connect-db.js";
import redis from "../../config/redis.js";

/**
 * Production-grade health check controller.
 * Reports system status for load balancers and monitoring tools.
 *
 * GET /api/v1/health
 */
export const healthCheck = async (req, res) => {
  const startTime = Date.now();

  // ── MongoDB Status ────────────────────────────────────────────────
  let mongoStatus = "disconnected";
  try {
    const state = getConnectionStatus();
    const stateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };
    mongoStatus = stateMap[state] || "unknown";
  } catch {
    mongoStatus = "error";
  }

  // ── Redis Status ──────────────────────────────────────────────────
  let redisStatus = "disconnected";
  try {
    const pong = await redis.ping();
    redisStatus = pong === "PONG" ? "connected" : "degraded";
  } catch {
    redisStatus = "error";
  }

  // ── Aggregate Health ──────────────────────────────────────────────
  const isHealthy = mongoStatus === "connected" && redisStatus === "connected";
  const responseTimeMs = Date.now() - startTime;

  const payload = {
    status: isHealthy ? "healthy" : "degraded",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    responseTimeMs,
    services: {
      mongodb: mongoStatus,
      redis: redisStatus,
    },
    system: {
      nodeVersion: process.version,
      memoryUsage: {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB`,
      },
    },
  };

  res.status(isHealthy ? 200 : 503).json(payload);
};
