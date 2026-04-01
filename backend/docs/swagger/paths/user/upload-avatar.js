// backend/docs/swagger/paths/user/upload-avatar.js
/**
 * @openapi
 * /user/profile/avatar:
 *   post:
 *     tags:
 *       - User
 *     summary: Upload profile avatar
 *     description: |
 *       Uploads a new profile avatar image for the authenticated user.
 *       The image is uploaded to Cloudinary and the URL is stored on the user profile.
 *       Accepts standard image formats (JPEG, PNG, WebP, GIF).
 *       File is sent as multipart/form-data.
 *
 *       **Rate Limit:** 10 requests per 15 minutes per IP.
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - avatar
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Image file (JPEG, PNG, WebP, or GIF)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
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
 *                   example: "Profile photo updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/UserProfile'
 *                 timestamp:
 *                   type: string
 *                   format: date-time
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
 *         description: Upload or server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               uploadFailed:
 *                 summary: Cloudinary upload failed
 *                 value:
 *                   success: false
 *                   message: "Failed to upload image."
 *                   errorCode: "UPLOAD_FAILED"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 *               serverError:
 *                 summary: Unexpected server error
 *                 value:
 *                   success: false
 *                   message: "Failed to update avatar."
 *                   errorCode: "AVATAR_UPDATE_FAILED"
 *                   timestamp: "2026-03-28T12:00:00.000Z"
 */
