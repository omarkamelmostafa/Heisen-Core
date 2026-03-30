/**
 * @openapi
 * /user/security/password:
 *   post:
 *     tags:
 *       - User
 *     summary: Change account password
 *     description: |
 *       Changes the authenticated user's password. Requires the current password
 *       for verification. The new password must meet complexity requirements:
 *       - 8-128 characters
 *       - At least one uppercase letter
 *       - At least one lowercase letter
 *       - At least one number
 *       - At least one special character
 *       - Cannot contain the user's email or name
 *       - Cannot be a commonly used password
 *       - No more than 2 consecutive repeated characters
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
 *               - oldPassword
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               oldPassword:
 *                 type: string
 *                 description: Current account password
 *                 example: "OldSecureP@ss1"
 *                 maxLength: 128
 *               newPassword:
 *                 type: string
 *                 description: New password (8-128 chars, complexity rules apply)
 *                 example: "NewSecureP@ss2"
 *                 minLength: 8
 *                 maxLength: 128
 *               confirmPassword:
 *                 type: string
 *                 description: Must match newPassword exactly
 *                 example: "NewSecureP@ss2"
 *           example:
 *             oldPassword: "OldSecureP@ss1"
 *             newPassword: "NewSecureP@ss2"
 *             confirmPassword: "NewSecureP@ss2"
 *     responses:
 *       200:
 *         description: Password updated successfully
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
 *                   example: "Password updated successfully"
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
 *               samePassword:
 *                 summary: New password same as current
 *                 value:
 *                   success: false
 *                   message: "New password must be different from your current password."
 *                   errorCode: "SAME_PASSWORD"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 *               validationError:
 *                 summary: Password complexity requirements not met
 *                 value:
 *                   success: false
 *                   message: "Validation failed"
 *                   errorCode: "BAD_REQUEST"
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
