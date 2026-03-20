export const authSchemas = {
  LoginRequest: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        description: "User email address",
        example: "user@example.com",
      },
      password: {
        type: "string",
        description: "User password (not validated for strength on login)",
        example: "MySecureP@ss1",
      },
      rememberMe: {
        type: "boolean",
        description: "If true, refresh token cookie lasts 30 days instead of session-only",
        example: false,
      },
    },
    required: ["email", "password"],
  },
  RegisterRequest: {
    type: "object",
    properties: {
      firstname: {
        type: "string",
        minLength: 2,
        maxLength: 50,
        description: "User first name",
        example: "John",
      },
      lastname: {
        type: "string",
        minLength: 2,
        maxLength: 50,
        description: "User last name",
        example: "Doe",
      },
      email: {
        type: "string",
        format: "email",
        description: "User email address (disposable emails blocked)",
        example: "john.doe@example.com",
      },
      password: {
        type: "string",
        minLength: 8,
        description: "Password (must contain uppercase, lowercase, number, and special character)",
        example: "MySecureP@ss1",
      },
      confirmPassword: {
        type: "string",
        description: "Must match password field",
        example: "MySecureP@ss1",
      },
      terms: {
        type: "boolean",
        description: "User acceptance of terms and conditions (must be true)",
        example: true,
      },
    },
    required: ["firstname", "lastname", "email", "password", "confirmPassword", "terms"],
  },
  VerifyEmailRequest: {
    type: "object",
    properties: {
      token: {
        type: "string",
        minLength: 6,
        maxLength: 6,
        pattern: "^[0-9]{6}$",
        description: "6-digit numeric verification code sent to email",
        example: "583224",
      },
    },
    required: ["token"],
  },
  ResendVerificationRequest: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        description: "Email address to resend verification code to",
        example: "user@example.com",
      },
    },
    required: ["email"],
  },
  ForgotPasswordRequest: {
    type: "object",
    properties: {
      email: {
        type: "string",
        format: "email",
        description: "Email address for password reset",
        example: "user@example.com",
      },
    },
    required: ["email"],
  },
  ResetPasswordRequest: {
    type: "object",
    properties: {
      token: {
        type: "string",
        description: "Password reset token from email link",
        example: "a1b2c3d4e5f6...",
      },
      password: {
        type: "string",
        minLength: 8,
        description: "New password (must meet strength requirements)",
        example: "NewSecureP@ss1",
      },
      confirmPassword: {
        type: "string",
        description: "Must match password field",
        example: "NewSecureP@ss1",
      },
    },
    required: ["token", "password", "confirmPassword"],
  },
  AuthSuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Login successful." },
      data: {
        type: "object",
        properties: {
          accessToken: {
            type: "string",
            description: "JWT access token (15-minute expiry). Store in memory only.",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
          user: { $ref: "#/components/schemas/UserProfile" },
        },
      },
      timestamp: { type: "string", format: "date-time" },
      requestId: { type: "string" },
    },
  },
  RegisterSuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string", example: "Registration successful. Please check your email to verify your account." },
      data: {
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              uuid: { type: "string", example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890" },
              email: { type: "string", example: "john.doe@example.com" },
              isVerified: { type: "boolean", example: false },
            },
          },
          emailSent: {
            type: "boolean",
            description: "Whether the verification email was successfully dispatched",
            example: true,
          },
        },
      },
      timestamp: { type: "string", format: "date-time" },
      requestId: { type: "string" },
    },
  },
};
