// backend/docs/swagger/paths/auth/resend-2fa.js
/**
 * @openapi
 * /auth/resend-2fa:
 *   post:
 *     tags:
 *       - Two-Factor Authentication
 *     summary: Resend 2FA verification code
 *     description: |
 *       Resends a new 6-digit OTP code to the user's email during the 2FA login flow.
 *       Requires the temporary JWT token from the initial login response.
 *       The previous code is invalidated when a new one is sent.
 *
 *       **Rate Limit:** 3 requests per 15 minutes per IP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tempToken
 *             properties:
 *               tempToken:
 *                 type: string
 *                 description: Temporary JWT from login response when twoFactorRequired is true
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           example:
 *             tempToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: New verification code sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "A new verification code has been sent to your email."
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2026-03-28T12:00:00.000Z"
 *       400:
 *         description: Invalid or expired 2FA session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               sessionExpired:
 *                 summary: Temporary token has expired
 *                 value:
 *                   success: false
 *                   message: "Your 2FA session has expired. Please log in again."
 *                   errorCode: "TWO_FACTOR_SESSION_EXPIRED"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 *               sessionInvalid:
 *                 summary: Temporary token is malformed or invalid
 *                 value:
 *                   success: false
 *                   message: "Invalid 2FA session. Please log in again."
 *                   errorCode: "TWO_FACTOR_SESSION_INVALID"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 *               notEnabled:
 *                 summary: 2FA is not enabled on the account
 *                 value:
 *                   success: false
 *                   message: "Two-factor authentication is not enabled."
 *                   errorCode: "TWO_FACTOR_NOT_ENABLED"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
