// backend/__tests__/integration/auth-refresh.test.js
import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import emailService from "../../services/email/email.service.js";
import * as cloudinaryModule from "../../services/cloudinaryService.js";
import { registerVerifyAndLogin } from "./helpers.js";

// vi.mock() is hoisted — runs before all imports are bound
vi.mock("../../services/email/email.service.js", () => {
  const mockSendVerificationEmail = vi.fn().mockResolvedValue({ success: true });
  const mockSendPasswordResetEmail = vi.fn().mockResolvedValue({ success: true });
  const mockSendWelcomeEmail = vi.fn().mockResolvedValue({ success: true });
  const mockSendResetSuccessEmail = vi.fn().mockResolvedValue({ success: true });

  const mockInstance = {
    sendVerificationEmail: mockSendVerificationEmail,
    sendPasswordResetEmail: mockSendPasswordResetEmail,
    sendWelcomeEmail: mockSendWelcomeEmail,
    sendResetSuccessEmail: mockSendResetSuccessEmail,
  };

  return {
    EmailService: vi.fn().mockImplementation(function () {
      return mockInstance;
    }),
    default: mockInstance,
  };
});

vi.mock("../../services/cloudinaryService.js", () => ({
  CloudinaryService: {
    createUserFolder: vi.fn().mockResolvedValue({ success: true })
  },
  createUserFolder: vi.fn().mockResolvedValue({ success: true })
}));

beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Suite C — Refresh Token Tests", () => {
  it("C1: Valid refresh token", async () => {
    const { agent } = await registerVerifyAndLogin(app, emailService);

    const res = await agent.post("/api/v1/auth/refresh");

    // Assert: HTTP 200
    expect(res.status).toBe(200);

    // Assert: body.data.accessToken matches JWT format
    expect(res.body.data.accessToken).toMatch(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/);
  });

  it("C2: Expired refresh token", async () => {
    const { agent } = await registerVerifyAndLogin(app, emailService);

    vi.useFakeTimers();
    // Advance beyond common 7d refresh token expiry
    vi.advanceTimersByTime(8 * 24 * 60 * 60 * 1000);

    const res = await agent.post("/api/v1/auth/refresh");

    // Assert: HTTP 401
    expect(res.status).toBe(401);
  });

  it("C3: Revoked token (after logout)", async () => {
    const { agent } = await registerVerifyAndLogin(app, emailService);

    const loginRes = await agent.post("/api/v1/auth/refresh");
    const refreshCookie = loginRes.headers["set-cookie"][0].split(';')[0]; // Extract old session

    await agent.post("/api/v1/auth/logout");

    const refreshRes = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", refreshCookie);

    // Assert: HTTP 401
    expect(refreshRes.status).toBe(401);
  });

  it("C4: No cookie", async () => {
    const res = await request(app).post("/api/v1/auth/refresh");
    // Assert: HTTP 401
    expect(res.status).toBe(401);
  });

  it("C5: Tampered cookie", async () => {
    const res = await request(app)
      .post("/api/v1/auth/refresh")
      .set("Cookie", "refresh_token=garbage-not-a-real-token");

    // Assert: HTTP 401
    expect(res.status).toBe(401);
  });
});
