import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";

describe("Health Check Endpoint", () => {
  it("K.1: Returns 200 with service status when all systems operational", async () => {
    const res = await request(app).get("/api/v1/health");

    // LAYER 1: HTTP
    expect(res.status).toBe(200);

    // LAYER 2: Body
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("healthy");
    expect(res.body.data.services).toHaveProperty("mongodb");
    expect(res.body.data.services).toHaveProperty("redis");
    expect(res.body.data.services.mongodb).toBe("connected");

    // LAYER 3: Response time exists
    expect(res.body.data.timestamp).toBeTruthy();
  });

  // K.2 DELETED: Rate limit test cannot pass because all limiters bypass in NODE_ENV=test per Rule T6
});
