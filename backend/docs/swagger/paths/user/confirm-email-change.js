/**
 * @openapi
 * /user/email/confirm/{token}:
 *   get:
 *     tags:
 *       - User
 *     summary: Confirm email address change
 *     description: |
 *       Confirms an email address change using the token from the verification link
 *       sent to the user's new email address. This is a browser-navigated endpoint
 *       that returns HTTP 302 redirects to the frontend.
 *
 *       **No authentication required** — the token in the URL serves as proof of
 *       email ownership.
 *
 *       **Redirect outcomes:**
 *       - Success: `{FRONTEND_URL}/login?reason=email-changed` 
 *       - Invalid/expired token: `{FRONTEND_URL}/login?reason=email-token-invalid` 
 *       - Email taken by another user: `{FRONTEND_URL}/login?reason=email-taken` 
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *           minLength: 64
 *           maxLength: 64
 *           pattern: "^[a-f0-9]{64}$"
 *         description: 64-character hex token from the verification email link
 *         example: "a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2c3d4e5f6a1b2"
 *     responses:
 *       302:
 *         description: Redirects to the frontend with a result reason
 *         headers:
 *           Location:
 *             description: Frontend URL with reason query parameter
 *             schema:
 *               type: string
 *             examples:
 *               success:
 *                 summary: Email changed successfully
 *                 value: "https://app.example.com/login?reason=email-changed"
 *               invalidToken:
 *                 summary: Token is invalid or expired
 *                 value: "https://app.example.com/login?reason=email-token-invalid"
 *               emailTaken:
 *                 summary: Email was claimed by another user
 *                 value: "https://app.example.com/login?reason=email-taken"
 */
