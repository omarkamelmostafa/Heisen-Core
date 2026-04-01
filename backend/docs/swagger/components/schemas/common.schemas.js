// backend/docs/swagger/components/schemas/common.schemas.js
export const commonSchemas = {
  BaseResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        description: "Whether the request was successful",
        example: true,
      },
      message: {
        type: "string",
        description: "Human-readable response message",
        example: "Operation completed successfully.",
      },
      timestamp: {
        type: "string",
        format: "date-time",
        description: "ISO-8601 timestamp of the response",
        example: "2026-03-20T08:00:00.000Z",
      },
      requestId: {
        type: "string",
        description: "Unique request identifier for tracing",
        example: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
    required: ["success", "message"],
  },
  ErrorResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false,
      },
      message: {
        type: "string",
        description: "Human-readable error message",
        example: "An error occurred.",
      },
      errorCode: {
        type: "string",
        description: "Machine-readable error code (UPPER_SNAKE_CASE)",
        example: "VALIDATION_ERROR",
      },
      timestamp: {
        type: "string",
        format: "date-time",
        example: "2026-03-20T08:00:00.000Z",
      },
      requestId: {
        type: "string",
        example: "550e8400-e29b-41d4-a716-446655440000",
      },
    },
    required: ["success", "message", "errorCode"],
  },
  ValidationErrorResponse: {
    type: "object",
    properties: {
      success: {
        type: "boolean",
        example: false,
      },
      message: {
        type: "string",
        example: "Validation failed",
      },
      errorCode: {
        type: "string",
        example: "VALIDATION_ERROR",
      },
      errors: {
        type: "array",
        items: {
          type: "object",
          properties: {
            field: { type: "string", example: "email" },
            message: { type: "string", example: "Please enter a valid email address." },
          },
        },
      },
      timestamp: {
        type: "string",
        format: "date-time",
      },
      requestId: {
        type: "string",
      },
    },
    required: ["success", "message", "errors"],
  },
};
