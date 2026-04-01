// backend/docs/swagger/paths/user/request-email-change.js
/**
 * @openapi
 * /user/email/request:
 *   post:
 *     tags:
 *       - User
 *     summary: Request email address change
 *     description: |
 *       Initiates an email address change for the authenticated user.
 *       Sends a verification link to the NEW email address.
 *       The user must confirm via the link before the change takes effect.
 *       Requires the current password for security verification.
 *
 *       If an email change is already pending for a DIFFERENT address,
 *       returns an error. If pending for the SAME address, resends the verification.
 *
 *       **Rate Limit:** 3 requests per hour per IP.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newEmail
 *               - currentPassword
 *             properties:
 *               newEmail:
 *                 type: string
 *                 format: email
 *                 description: New email address (max 254 characters)
 *                 example: "newemail@example.com"
 *                 maxLength: 254
 *               currentPassword:
 *                 type: string
 *                 description: Current account password for verification
 *                 example: "MySecureP@ss1"
 *           example:
 *             newEmail: "newemail@example.com"
 *             currentPassword: "MySecureP@ss1"
 *     responses:
 *       200:
 *         description: Verification email sent to the new address
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
 *                   example: "Verification email sent to your new address. Please check your inbox."
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
 *               sameEmail:
 *                 summary: New email is the same as current
 *                 value:
 *                   success: false
 *                   message: "New email is the same as your current email."
 *                   errorCode: "SAME_EMAIL"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 *               pendingChange:
 *                 summary: A different email change is already pending
 *                 value:
 *                   success: false
 *                   message: "An email change is already pending for a different address."
 *                   errorCode: "EMAIL_CHANGE_PENDING"
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
 *       409:
 *         description: Email already in use by another account
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "This email address is already in use."
 *               errorCode: "EMAIL_TAKEN"
 *               timestamp: "2026-03-28T12:00:00.000Z"
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
