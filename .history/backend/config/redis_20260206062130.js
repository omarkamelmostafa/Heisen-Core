// // config/redis.js
// import Redis from "ioredis";

// const redis = new Redis(process.env.REDIS_URL, {
//   retryDelayOnFailover: 100,
//   maxRetriesPerRequest: 3,
//   lazyConnect: true, // Prevent connection errors on startup
// });

// redis.on("error", (err) => {
//   console.warn("Redis connection error:", err.message);
//   // Don't crash the app - Redis is optional for blacklisting
// });

// export default redis;

// // config/redis.js
// import Redis from 'ioredis';

// const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
//   maxRetriesPerRequest: null,
//   enableReadyCheck: false,
//   retryStrategy: (times) => {
//     const delay = Math.min(times * 50, 2000);
//     return delay;
//   },
// });

// redisClient.on('connect', () => {
//   console.log('✅ Redis connected successfully');
// });

// redisClient.on('error', (err) => {
//   console.error('❌ Redis connection error:', err.message);
// });

// export default redisClient; 