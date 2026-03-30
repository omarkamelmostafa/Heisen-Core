/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh access token
 *     description: |
 *       Issues a new JWT access token using the refresh token cookie.
 *       Implements refresh token rotation: the old refresh token is
 *       revoked and a new one is issued.
 *
 *       **Token Rotation**: Each refresh request invalidates the
 *       previous refresh token and issues a new one. This limits
 *       the window of opportunity if a token is compromised.
 *
 *       **Reuse Detection**: If a revoked refresh token is used,
 *       ALL active sessions for that user are immediately revoked
 *       (security measure against token theft).
 *
 *       **Cookie Required**: The `refresh_token` HTTP-only cookie must be present.
 *       No request body needed.
 *
 *       ---
 *
 *       **Rate Limiting**: 30 requests per 1 minute. Exceeding this
 *       limit returns `429 Too Many Requests` with errorCode `RATE_LIMITED`.
 *
 *       Additionally, a global rate limit of 200 requests per 15 minutes
 *       applies across all endpoints per IP address.
 *     security:
 *       - CookieAuth: []
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         headers:
 *           Set-Cookie:
 *             description: New refresh token cookie (rotated)
 *             schema:
 *               type: string
 *               example: "refresh_token=eyJ...; Path=/; HttpOnly; SameSite=Lax"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       401:
 *         description: Refresh token missing, expired, or revoked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingToken:
 *                 summary: No refresh token cookie
 *                 value:
 *                   success: false
 *                   message: "Refresh token is required."
 *                   errorCode: "MISSING_REFRESH_TOKEN"
 *               expiredToken:
 *                 summary: Refresh token expired
 *                 value:
 *                   success: false
 *                   message: "Refresh token has expired."
 *                   errorCode: "TOKEN_EXPIRED"
 *               revokedToken:
 *                 summary: Revoked token (possible theft detected)
 *                 value:
 *                   success: false
 *                   message: "Invalid refresh token."
 *                   errorCode: "TOKEN_INVALID"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
