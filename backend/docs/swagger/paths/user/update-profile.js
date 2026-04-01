// backend/docs/swagger/paths/user/update-profile.js
/**
 * @openapi
 * /user/me:
 *   patch:
 *     tags:
 *       - User
 *     summary: Update user profile
 *     description: |
 *       Updates the authenticated user's first name and/or last name.
 *       Both fields accept only letters and spaces, between 3-16 characters.
 *
 *       **Rate Limit:** 10 requests per 15 minutes per IP.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstname
 *               - lastname
 *             properties:
 *               firstname:
 *                 type: string
 *                 description: First name (3-16 characters, letters and spaces only)
 *                 example: "Jane"
 *                 minLength: 3
 *                 maxLength: 16
 *                 pattern: "^[a-zA-Z\\s]+$"
 *               lastname:
 *                 type: string
 *                 description: Last name (3-16 characters, letters and spaces only)
 *                 example: "Smith"
 *                 minLength: 3
 *                 maxLength: 16
 *                 pattern: "^[a-zA-Z\\s]+$"
 *           example:
 *             firstname: "Jane"
 *             lastname: "Smith"
 *     responses:
 *       200:
 *         description: Profile updated successfully
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
 *                   example: "Profile updated successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         description: Missing or invalid access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               noToken:
 *                 summary: No access token provided
 *                 value:
 *                   success: false
 *                   message: "Access token is required."
 *                   errorCode: "NO_ACCESS_TOKEN"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 *               invalidToken:
 *                 summary: Token is invalid or expired
 *                 value:
 *                   success: false
 *                   message: "Invalid or expired access token."
 *                   errorCode: "TOKEN_INVALID"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 *       404:
 *         description: User not found or deactivated
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
