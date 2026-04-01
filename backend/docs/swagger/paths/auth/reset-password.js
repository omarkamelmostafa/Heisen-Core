// backend/docs/swagger/paths/auth/reset-password.js
/**
 * @openapi
 * /auth/reset-password:
 *   post:
 *     tags:
 *       - Password Recovery
 *     summary: Reset password using token
 *     description: |
 *       Resets the user's password using the token received via the
 *       forgot-password email.
 *
 *       **Session Revocation**: When a password is reset, ALL active
 *       refresh tokens for that user are revoked across all devices.
 *       This ensures that if the password was compromised, all existing
 *       sessions are terminated.
 *
 *       **Password Requirements**: Minimum 8 characters, must contain
 *       uppercase, lowercase, number, and special character.
 *
 *       **Token Format**: The reset token is a 64-character hex string
 *       sent in the password reset email link.
 *
 *       ---
 *
 *       **Rate Limiting**: 5 requests per 15 minutes. Exceeding this
 *       limit returns `429 Too Many Requests` with errorCode `RATE_LIMITED`.
 *
 *       Additionally, a global rate limit of 200 requests per 15 minutes
 *       applies across all endpoints per IP address.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *           example:
 *             token: "a1b2c3d4e5f67890abcdef1234567890a1b2c3d4e5f67890abcdef1234567890"
 *             password: "NewSecureP@ss1"
 *             confirmPassword: "NewSecureP@ss1"
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/BaseResponse'
 *             example:
 *               success: true
 *               message: "Password has been reset successfully. You can now log in with your new password."
 *       400:
 *         description: Invalid or expired reset token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidToken:
 *                 summary: Token not found or already used
 *                 value:
 *                   success: false
 *                   message: "Invalid or expired reset token."
 *                   errorCode: "INVALID_TOKEN"
 *               expiredToken:
 *                 summary: Token has expired (> 1 hour)
 *                 value:
 *                   success: false
 *                   message: "Reset token has expired. Please request a new one."
 *                   errorCode: "TOKEN_EXPIRED"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
