// backend/__tests__/integration/infrastructure.test.js
import { describe, it, expect } from "vitest";
import request from "supertest";
import express from "express";
import app from "../../app.js";
import { errorHandlerMiddleware } from "../../middleware/errors/error-handler-middleware.js";
import { AppError } from "../../errors/AppError.js";

describe("Suite K — 404 Not Found Handler", () => {
  it("K.2: Returns 404 envelope for unmatched route", async () => {
    const res = await request(app)
      .get("/api/v1/this-route-does-not-exist-at-all");

    // LAYER 1
    expect(res.status).toBe(404);

    // LAYER 2
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Route not found");
    expect(res.body.errorCode).toBe("ROUTE_NOT_FOUND");
    expect(res.body.timestamp).toBeDefined();
  });

  it("K.3: Returns 404 envelope for deeply nested unmatched route", async () => {
    const res = await request(app)
      .get("/api/v1/users/123/posts/456/comments/789");

    // LAYER 1
    expect(res.status).toBe(404);

    // LAYER 2
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Route not found");
    expect(res.body.errorCode).toBe("ROUTE_NOT_FOUND");
    expect(res.body.timestamp).toBeDefined();
  });

  it("K.4: Returns 404 for wrong HTTP method on existing path", async () => {
    const res = await request(app)
      .delete("/api/v1/health");

    // LAYER 1
    expect(res.status).toBe(404);

    // LAYER 2
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Route not found");
    expect(res.body.errorCode).toBe("ROUTE_NOT_FOUND");
    expect(res.body.timestamp).toBeDefined();
  });
});

describe("Suite L — Global Error Handler", () => {
  it("L.1: Returns 500 envelope for unexpected thrown Error", async () => {
    const testApp = express();
    testApp.get("/boom", (req, res, next) => {
      next(new Error("intentional test error"));
    });
    testApp.use(errorHandlerMiddleware);

    const res = await request(testApp)
      .get("/boom");

    // LAYER 1
    expect(res.status).toBe(500);

    // LAYER 2
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("intentional test error");
    expect(res.body.errorCode).toBe("INTERNAL_ERROR");
    expect(res.body.timestamp).toBeDefined();
  });

  it("L.2: Returns correct status and errorCode for AppError", async () => {
    const testApp = express();
    testApp.get("/app-error", (req, res, next) => {
      next(new AppError("Resource forbidden", 403, "FORBIDDEN"));
    });
    testApp.use(errorHandlerMiddleware);

    const res = await request(testApp)
      .get("/app-error");

    // LAYER 1
    expect(res.status).toBe(403);

    // LAYER 2
    expect(res.body.success).toBe(false);
    expect(res.body.message).toBe("Resource forbidden");
    expect(res.body.errorCode).toBe("FORBIDDEN");
  });

  it("L.3: Returns 500 with generic message in production env", async () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      const testApp = express();
      testApp.get("/prod-error", (req, res, next) => {
        next(new Error("secret internal detail"));
      });
      testApp.use(errorHandlerMiddleware);

      const res = await request(testApp)
        .get("/prod-error");

      // LAYER 1
      expect(res.status).toBe(500);

      // LAYER 2
      expect(res.body.message).toBe("An internal server error occurred.");
      expect(res.body.message).not.toContain("secret internal detail");
    } finally {
      process.env.NODE_ENV = originalEnv;
    }
  });
});
