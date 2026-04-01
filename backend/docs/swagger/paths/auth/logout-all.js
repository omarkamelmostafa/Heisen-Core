// backend/docs/swagger/paths/auth/logout-all.js
/**
 * @openapi
 * /auth/logout-all:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout all sessions
 *     description: |
 *       Revokes ALL active refresh tokens for the current user across
 *       all devices and browsers. Clears the current session's refresh
 *       token cookie.
 *
 *       **Use Case**: Security measure when a user suspects their
 *       account has been compromised.
 *
 *       **Cookie Required**: The `refresh_token` HTTP-only cookie must be present.
 *
 *       ---
 *
 *       **Rate Limiting**: 30 requests per 15 minutes. Exceeding this
 *       limit returns `429 Too Many Requests` with errorCode `RATE_LIMITED`.
 *
 *       Additionally, a global rate limit of 200 requests per 15 minutes
 *       applies across all endpoints per IP address.
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: All sessions terminated
 *         headers:
 *           Set-Cookie:
 *             description: Cleared refresh token cookie
 *             schema:
 *               type: string
 *               example: "refresh_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *             example:
 *               success: true
 *               message: "All sessions have been terminated."
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
