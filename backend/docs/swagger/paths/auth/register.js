/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user account
 *     description: |
 *       Creates a new user account with the provided details.
 *       Sends a 6-digit verification code to the provided email address.
 *
 *       **Email Delivery**: The response includes an `emailSent` flag
 *       indicating whether the verification email was successfully dispatched.
 *       If `emailSent` is false, the user should use the Resend Code feature.
 *
 *       **Disposable Emails**: Disposable/temporary email addresses are blocked.
 *
 *       **Password Requirements**: Minimum 8 characters, must contain uppercase,
 *       lowercase, number, and special character.
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
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             firstname: "John"
 *             lastname: "Doe"
 *             email: "john.doe@example.com"
 *             password: "MySecureP@ss1"
 *             confirmPassword: "MySecureP@ss1"
 *     responses:
 *       201:
 *         description: Account created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RegisterSuccessResponse'
 *             examples:
 *               emailSent:
 *                 summary: Registration with email sent
 *                 value:
 *                   success: true
 *                   message: "Registration successful. Please check your email to verify your account."
 *                   data:
 *                     user:
 *                       uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                       email: "john.doe@example.com"
 *                       isVerified: false
 *                     emailSent: true
 *               emailFailed:
 *                 summary: Registration succeeded but email failed
 *                 value:
 *                   success: true
 *                   message: "Account created successfully. We couldn't send the verification email — please use Resend Code on the verification page."
 *                   data:
 *                     user:
 *                       uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 *                       email: "john.doe@example.com"
 *                       isVerified: false
 *                     emailSent: false
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       500:
 *         $ref: '#/components/responses/InternalError'
 */
