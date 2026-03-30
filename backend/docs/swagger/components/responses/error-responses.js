export const errorResponses = {
  BadRequest: {
    description: "Validation failed or malformed request",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ValidationErrorResponse" },
      },
    },
  },
  Unauthorized: {
    description: "Authentication required or token expired/invalid",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        examples: {
          tokenExpired: {
            summary: "Access token expired",
            value: {
              success: false,
              message: "Access token has expired.",
              errorCode: "TOKEN_EXPIRED",
            },
          },
          tokenInvalid: {
            summary: "Invalid or malformed token",
            value: {
              success: false,
              message: "Invalid access token.",
              errorCode: "TOKEN_INVALID",
            },
          },
          noToken: {
            summary: "No access token provided",
            value: {
              success: false,
              message: "Access token is required.",
              errorCode: "NO_ACCESS_TOKEN",
            },
          },
        },
      },
    },
  },
  Forbidden: {
    description: "Insufficient permissions",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
      },
    },
  },
  Conflict: {
    description: "Resource already exists",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: {
          success: false,
          message: "User with this email already exists.",
          errorCode: "CONFLICT",
        },
      },
    },
  },
  TooManyRequests: {
    description: "Rate limit exceeded",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: {
          success: false,
          message: "Too many requests. Please try again later.",
          errorCode: "RATE_LIMITED",
          timestamp: "2026-03-20T08:00:00.000Z",
          requestId: "550e8400-e29b-41d4-a716-446655440000",
        },
      },
    },
  },
  InternalError: {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/ErrorResponse" },
        example: {
          success: false,
          message: "An unexpected error occurred.",
          errorCode: "INTERNAL_ERROR",
        },
      },
    },
  },
};
