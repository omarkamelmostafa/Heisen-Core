/**
 * @openapi
 * /auth/resend-verification:
 *   post:
 *     tags:
 *       - Email Verification
 *     summary: Resend email verification code
 *     description: |
 *       Sends a new 6-digit verification code to the specified email address.
 *       The previous verification token is invalidated and replaced.
 *
 *       **Anti-Enumeration**: Returns 200 OK regardless of whether the email
 *       exists in the system (prevents account enumeration attacks).
 *
 *
 *       ---
 *
 *       **Rate Limiting**: 10 requests per 15 minutes. Exceeding this
 *       limit returns `429 Too Many Requests` with errorCode `RATE_LIMITED`.
 *
 *       Additionally, a global rate limit of 200 requests per 15 minutes
 *       applies across all endpoints per IP address.
 *
 *       **Email Delivery**: If the email dispatch fails, returns 500 with
 *       errorCode EMAIL_DISPATCH_FAILED.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendVerificationRequest'
 *           example:
 *             email: "user@example.com"
 *     responses:
 *       200:
 *         description: Verification code sent (or silently ignored for non-existent emails)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *             example:
 *               success: true
 *               message: "Verification code sent successfully."
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         description: Email dispatch failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Failed to send verification email. Please try again later."
 *               errorCode: "EMAIL_DISPATCH_FAILED"
 */
