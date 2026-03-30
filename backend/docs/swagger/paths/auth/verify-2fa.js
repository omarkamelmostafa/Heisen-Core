/**
 * @openapi
 * /auth/verify-2fa:
 *   post:
 *     tags:
 *       - Two-Factor Authentication
 *     summary: Complete 2FA login verification
 *     description: |
 *       Verifies the 6-digit OTP code sent to the user's email during login.
 *       Requires the temporary JWT token returned from the login endpoint
 *       when 2FA is enabled on the account.
 *
 *       On success, returns an access token and sets an HTTP-only refresh token cookie.
 *
 *       **Rate Limit:** 10 requests per 15 minutes per IP.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *               - tempToken
 *             properties:
 *               token:
 *                 type: string
 *                 description: 6-digit OTP verification code from email
 *                 example: "123456"
 *                 minLength: 6
 *                 maxLength: 6
 *                 pattern: "^[0-9]{6}$"
 *               tempToken:
 *                 type: string
 *                 description: Temporary JWT from login response when twoFactorRequired is true
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *           example:
 *             token: "123456"
 *             tempToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: 2FA verification successful — user fully authenticated
 *         headers:
 *           Set-Cookie:
 *             description: HTTP-only refresh token cookie
 *             schema:
 *               type: string
 *               example: "refresh_token=eyJ...; Path=/; HttpOnly; SameSite=Lax"
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthSuccessResponse'
 *       400:
 *         description: Invalid or expired 2FA session or verification code
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
 *               codeExpired:
 *                 summary: OTP code has expired
 *                 value:
 *                   success: false
 *                   message: "Verification code has expired. Please request a new one."
 *                   errorCode: "TWO_FACTOR_EXPIRED"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 *               codeInvalid:
 *                 summary: Wrong OTP code entered
 *                 value:
 *                   success: false
 *                   message: "Invalid verification code."
 *                   errorCode: "TWO_FACTOR_INVALID"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
