// backend/__tests__/integration/rate-limiting.test.js
import { vi, describe, it, expect } from "vitest";
import request from "supertest";

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
});
