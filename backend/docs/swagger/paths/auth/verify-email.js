// backend/docs/swagger/paths/auth/verify-email.js
/**
 * @openapi
 * /auth/verify-email:
 *   post:
 *     tags:
 *       - Email Verification
 *     summary: Verify email with 6-digit code
 *     description: |
 *       Verifies the user's email address using the 6-digit numeric code
 *       sent during registration or via the resend verification flow.
 *
 *       **Token Format**: 6-digit numeric string (e.g., "583224").
 *       The frontend OTP input accepts exactly 6 digits.
 *
 *       **Token Expiry**: 24 hours from generation.
 *
 *       **Single Use**: Each code can only be used once. After successful
 *       verification, the token is invalidated.
 *
 *       ---
 *
 *       **Rate Limiting**: 10 requests per 15 minutes. Exceeding this
 *       limit returns `429 Too Many Requests` with errorCode `RATE_LIMITED`.
 *
 *       Additionally, a global rate limit of 200 requests per 15 minutes
 *       applies across all endpoints per IP address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/VerifyEmailRequest'
 *           example:
 *             token: "583224"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *             example:
 *               success: true
 *               message: "Email verified successfully. You can now log in."
 *       400:
 *         description: Invalid or expired verification token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidToken:
 *                 summary: Token not found or already used
 *                 value:
 *                   success: false
 *                   message: "Invalid or already used verification token."
 *                   errorCode: "INVALID_TOKEN"
 *               expiredToken:
 *                 summary: Token has expired
 *                 value:
 *                   success: false
 *                   message: "Verification token has expired."
 *                   errorCode: "VERIFICATION_TOKEN_EXPIRED"
 *               alreadyVerified:
 *                 summary: Email already verified
 *                 value:
 *                   success: false
 *                   message: "Email is already verified."
 *                   errorCode: "ALREADY_VERIFIED"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
