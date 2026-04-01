// backend/docs/swagger/paths/health/health.js
/**
 * @openapi
 * /health:
 *   get:
 *     tags:
 *       - Health
 *     summary: System health check
 *     description: |
 *       Returns the health status of the API and its dependencies
 *       (MongoDB and Redis). Used for monitoring and load balancer
 *       health checks.
 *
 *       **No Authentication Required**: This endpoint is publicly accessible.
 *
 *       ---
 *
 *       **Rate Limiting**: 30 requests per 15 minutes. Exceeding this
 *       limit returns `429 Too Many Requests` with errorCode `RATE_LIMITED`.
 *
 *       Additionally, a global rate limit of 200 requests per 15 minutes
 *       applies across all endpoints per IP address.
 *
 *       **Response Codes**:
 *       - 200: All services healthy
 *       - 503: One or more services unhealthy
 *     responses:
 *       200:
 *         description: All services healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "healthy"
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-03-20T08:00:00.000Z"
 *                 uptime:
 *                   type: number
 *                   description: Server uptime in seconds
 *                   example: 3600
 *                 responseTimeMs:
 *                   type: number
 *                   description: Health check execution time in milliseconds
 *                   example: 5
 *                 services:
 *                   type: object
 *                   properties:
 *                     mongodb:
 *                       type: string
 *                       enum: ["connected", "disconnected"]
 *                       example: "connected"
 *                     redis:
 *                       type: string
 *                       enum: ["connected", "disconnected"]
 *                       example: "connected"
 *                 system:
 *                   type: object
 *                   properties:
 *                     nodeVersion:
 *                       type: string
 *                       example: "v24.11.1"
 *                     memoryUsage:
 *                       type: object
 *                       properties:
 *                         rss:
 *                           type: string
 *                           example: "103 MB"
 *                         heapUsed:
 *                           type: string
 *                           example: "42 MB"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       503:
 *         description: One or more services unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "unhealthy"
 *                 services:
 *                   type: object
 *                   properties:
 *                     mongodb:
 *                       type: string
 *                       example: "disconnected"
 *                     redis:
 *                       type: string
 *                       example: "disconnected"
 */
