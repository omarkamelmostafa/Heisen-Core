// backend/docs/swagger/paths/auth/logout.js
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout current session
 *     description: |
 *       Revokes the current refresh token and clears the refresh token cookie.
 *       The access token remains valid until expiry (client should discard it).
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
 *         description: Logged out successfully
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
 *               message: "Logged out successfully."
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
