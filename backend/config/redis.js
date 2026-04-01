// backend/config/redis.js
import Redis from "ioredis";

const redis = new Redis(process.env.REDIS_URL, {
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
  lazyConnect: true, // Prevent connection errors on startup
});

redis.on("error", (err) => {
  console.warn("Redis connection error:", err.message);
  // Don't crash the app - Redis is optional for blacklisting
});

export default redis;
