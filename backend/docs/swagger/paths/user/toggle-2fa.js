// backend/docs/swagger/paths/user/toggle-2fa.js
/**
 * @openapi
 * /user/security/2fa:
 *   patch:
 *     tags:
 *       - User
 *     summary: Toggle two-factor authentication
 *     description: |
 *       Enables or disables two-factor authentication (2FA) on the authenticated
 *       user's account. Requires the current password for security verification.
 *
 *       When enabled, future logins will require a 6-digit OTP code sent to
 *       the user's email in addition to their password.
 *
 *       **Rate Limit:** 5 requests per 15 minutes per IP.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - enable
 *               - currentPassword
 *             properties:
 *               enable:
 *                 type: boolean
 *                 description: Set to true to enable 2FA, false to disable
 *                 example: true
 *               currentPassword:
 *                 type: string
 *                 description: Current account password for verification
 *                 example: "MySecureP@ss1"
 *                 maxLength: 128
 *           example:
 *             enable: true
 *             currentPassword: "MySecureP@ss1"
 *     responses:
 *       200:
 *         description: 2FA setting updated successfully
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
 *                   example: "Two-factor authentication has been enabled"
 *                 data:
 *                   type: object
 *                   properties:
 *                     twoFactorEnabled:
 *                       type: boolean
 *                       example: true
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Validation or business rule error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidPassword:
 *                 summary: Current password is incorrect
 *                 value:
 *                   success: false
 *                   message: "Current password is incorrect."
 *                   errorCode: "INVALID_PASSWORD"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 *               noChange:
 *                 summary: 2FA is already in the requested state
 *                 value:
 *                   success: false
 *                   message: "Two-factor authentication is already enabled."
 *                   errorCode: "TWO_FACTOR_NO_CHANGE"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "User not found."
 *               errorCode: "USER_NOT_FOUND"
 *               timestamp: "2026-03-28T12:00:00.000Z"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
