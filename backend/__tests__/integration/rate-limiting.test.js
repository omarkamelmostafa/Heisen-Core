// backend/__tests__/integration/rate-limiting.test.js
import { vi, describe, it, expect } from "vitest";
import request from "supertest";

async function clearMongooseModels() {
  const mongoose = await import("mongoose");
  Object.keys(mongoose.models).forEach((modelName) => {
    mongoose.deleteModel(modelName);
  });
}

describe("Suite I — Rate Limiting Test", () => {
  it("I1: Rate limit triggers on auth endpoint", async () => {
    // Avoid double-running if global setup already imported app
    vi.resetModules();

    // Temporarily enable rate limiting
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      // Re-import app so middlewares are created with NODE_ENV="production"
      const { default: app } = await import("../../app.js");

      // Login is limited to 10 requests per 5 minutes
      const limit = 10;
      let lastResponse;

      for (let i = 0; i <= limit; i++) {
        lastResponse = await request(app)
          .post("/api/v1/auth/login")
          .send({
            email: "ratelimit@test.com",
            password: "TestPassword123!",
          });
      }

      // The 11th request (index 10) must be 429
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.success).toBe(false);
      expect(lastResponse.body.errorCode).toBe("RATE_LIMITED");
      expect(lastResponse.body.timestamp).toBeDefined();
      expect(lastResponse.body.requestId).toBeDefined();

      // Retry-After header must be present
      expect(lastResponse.headers["retry-after"]).toBeDefined();

    } finally {
      // ALWAYS restore the original NODE_ENV
      process.env.NODE_ENV = originalEnv;
      vi.resetModules();
    }
  });

  it("I2: Rate limit triggers on register endpoint", async () => {
    vi.resetModules();
    await clearMongooseModels();
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      const { default: app } = await import("../../app.js");

      // registerLimiter: 5 requests per 15 minutes
      const limit = 5;
      let lastResponse;

      for (let i = 0; i <= limit; i++) {
        lastResponse = await request(app)
          .post("/api/v1/auth/register")
          .send({
            email: `ratelimit-register-${i}@test.com`,
            password: "TestPassword123!",
            firstName: "Test",
            lastName: "User",
            terms: true,
          });
      }

      // The 6th request (index 5) must be 429
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.success).toBe(false);
      expect(lastResponse.body.errorCode).toBe("RATE_LIMITED");
      expect(lastResponse.body.timestamp).toBeDefined();
      expect(lastResponse.body.requestId).toBeDefined();
      expect(lastResponse.headers["retry-after"]).toBeDefined();
    } finally {
      process.env.NODE_ENV = originalEnv;
      vi.resetModules();
    }
  });

  it("I3: Rate limit triggers on forgot-password endpoint", async () => {
    vi.resetModules();
    await clearMongooseModels();
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      const { default: app } = await import("../../app.js");

      // forgotPasswordLimiter: 3 requests per 15 minutes
      const limit = 3;
      let lastResponse;

      for (let i = 0; i <= limit; i++) {
        lastResponse = await request(app)
          .post("/api/v1/auth/forgot-password")
          .send({
            email: "ratelimit-forgot@test.com",
          });
      }

      // The 4th request (index 3) must be 429
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.success).toBe(false);
      expect(lastResponse.body.errorCode).toBe("RATE_LIMITED");
      expect(lastResponse.body.timestamp).toBeDefined();
      expect(lastResponse.body.requestId).toBeDefined();
      expect(lastResponse.headers["retry-after"]).toBeDefined();
    } finally {
      process.env.NODE_ENV = originalEnv;
      vi.resetModules();
    }
  });

  it("I4: Rate limit triggers on refresh endpoint", async () => {
    vi.resetModules();
    await clearMongooseModels();
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      const { default: app } = await import("../../app.js");

      // refreshLimiter: 30 requests per 1 minute
      const limit = 30;
      let lastResponse;

      for (let i = 0; i <= limit; i++) {
        lastResponse = await request(app)
          .post("/api/v1/auth/refresh")
          .send({});
      }

      // The 31st request (index 30) must be 429
      expect(lastResponse.status).toBe(429);
      expect(lastResponse.body.success).toBe(false);
      expect(lastResponse.body.errorCode).toBe("RATE_LIMITED");
      expect(lastResponse.body.timestamp).toBeDefined();
      expect(lastResponse.body.requestId).toBeDefined();
      expect(lastResponse.headers["retry-after"]).toBeDefined();
    } finally {
      process.env.NODE_ENV = originalEnv;
      vi.resetModules();
    }
  });
});
