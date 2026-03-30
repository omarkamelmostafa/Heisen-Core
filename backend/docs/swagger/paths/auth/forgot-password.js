/**
 * @openapi
 * /auth/forgot-password:
 *   post:
 *     tags:
 *       - Password Recovery
 *     summary: Request password reset email
 *     description: |
 *       Initiates the password reset flow by sending a reset token to
 *       the specified email address.
 *
 *       **Anti-Enumeration**: ALWAYS returns 200 OK with the same message,
 *       regardless of whether the email exists in the system. This prevents
 *       attackers from discovering which emails have accounts.
 *
 *       **Asynchronous Delivery**: The email is dispatched asynchronously
 *       (fire-and-forget) to ensure consistent response times regardless
 *       of email existence. This prevents timing-based enumeration attacks.
 *
 *       **Token Expiry**: Reset tokens expire after 1 hour.
 *
 *
 *       ---
 *
 *       **Rate Limiting**: 3 requests per 15 minutes. Exceeding this
 *       limit returns `429 Too Many Requests` with errorCode `RATE_LIMITED`.
 *
 *       Additionally, a global rate limit of 200 requests per 15 minutes
 *       applies across all endpoints per IP address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *           example:
 *             email: "user@example.com"
 *     responses:
 *       200:
 *         description: Password reset email sent (always returns success)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *             example:
 *               success: true
 *               message: "If an account with that email exists, a password reset link has been sent."
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
