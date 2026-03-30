export const userSchemas = {
  UserProfile: {
    type: "object",
    properties: {
      uuid: {
        type: "string",
        description: "User unique identifier",
        example: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      },
      firstname: {
        type: "string",
        example: "John",
      },
      lastname: {
        type: "string",
        example: "Doe",
      },
      email: {
        type: "string",
        format: "email",
        example: "john.doe@example.com",
      },
      isVerified: {
        type: "boolean",
        example: true,
      },
      role: {
        type: "string",
        example: "user",
      },
    },
  },
};
