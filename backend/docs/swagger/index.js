// backend/docs/swagger/index.js
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { commonSchemas } from "./components/schemas/common.schemas.js";
import { authSchemas } from "./components/schemas/auth.schemas.js";
import { userSchemas } from "./components/schemas/user.schemas.js";
import { errorResponses } from "./components/responses/error-responses.js";
import { securitySchemes } from "./components/security/security-schemes.js";

const options = {
  definition: {
    openapi: "3.1.0",
    info: {
      title: "Heisen Core Kit API",
      version: "1.0.0",
      description: "Full-stack authentication API with JWT access tokens, HTTP-only refresh token cookies, email verification, and password recovery.",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "/api/v1",
        description: "API v1",
      },
    ],
    tags: [
      { name: "Authentication", description: "Login, register, logout, and token refresh" },
      { name: "Two-Factor Authentication", description: "2FA verification and code resend during login" },
      { name: "Email Verification", description: "Verify email and resend verification codes" },
      { name: "Password Recovery", description: "Forgot password and reset password flows" },
      { name: "User", description: "User account operations — profile, avatar, email, and security management" },
      { name: "Health", description: "System health check" },
    ],
    components: {
      securitySchemes,
      schemas: {
        ...commonSchemas,
        ...authSchemas,
        ...userSchemas,
      },
      responses: {
        ...errorResponses,
      },
    },
  },
  apis: ["./docs/swagger/paths/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export function mountSwagger(app) {
  app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Heisen Core Kit API Docs",
  }));
}

export { swaggerSpec };
