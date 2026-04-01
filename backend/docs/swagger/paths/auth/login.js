// backend/docs/swagger/paths/auth/login.js
/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login with email and password
 *     description: |
 *       Authenticates a user with email and password credentials.
 *       On success, returns a JWT access token in the response body
 *       and sets an HTTP-only refresh token cookie.
 *
 *       **Access Token**: Short-lived (15 minutes). Store in application
 *       memory only (never localStorage).
 *
 *       **Refresh Token**: Set as an HTTP-only cookie named `refresh_token`.
 *       Used to obtain new access tokens via `/auth/refresh`.
 *
 *       **Anti-Enumeration**: Returns identical error messages for
 *       wrong password and non-existent email (security by design).
 *
 *       ---
 *
 *       **Rate Limiting**: 10 requests per 5 minutes. Exceeding this
 *       limit returns `429 Too Many Requests` with errorCode `RATE_LIMITED`.
 *
 *       Additionally, a global rate limit of 200 requests per 15 minutes
 *       applies across all endpoints per IP address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "user@example.com"
 *             password: "MySecureP@ss1"
 *             rememberMe: false
 *     responses:
 *       200:
 *         description: Login successful
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
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Invalid credentials or unverified email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidCredentials:
 *                 summary: Wrong email or password
 *                 value:
 *                   success: false
 *                   message: "Invalid email or password."
 *                   errorCode: "INVALID_CREDENTIALS"
 *               unverifiedEmail:
 *                 summary: Email not verified
 *                 value:
 *                   success: false
 *                   message: "Please verify your email before logging in."
 *                   errorCode: "EMAIL_NOT_VERIFIED"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
