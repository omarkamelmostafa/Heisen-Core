// backend/__tests__/integration/password-reset-revocation.test.js

import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../../app.js";
import User from "../../model/User.js";
import RefreshToken from "../../model/RefreshToken.js";
import { registerAndVerify, TEST_USER } from "./helpers.js";
import emailService from "../../services/email/email.service.js";

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

describe("S5: Password Reset Session Revocation", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("S5.1: Revokes ALL active sessions when password is reset", async () => {
    // STEP 1: Register and verify user
    await registerAndVerify(app, emailService);

    // STEP 2: Create multiple active sessions (3 logins)
    const session1Agent = request.agent(app);
    const session2Agent = request.agent(app);
    const session3Agent = request.agent(app);

    const session1 = await session1Agent
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    const session2 = await session2Agent
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    const session3 = await session3Agent
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(session1.status).toBe(200);
    expect(session2.status).toBe(200);
    expect(session3.status).toBe(200);

    const userId = session1.body.data.user.id;

    // STEP 3: Verify 3 active tokens exist
    const activeTokensBefore = await RefreshToken.countDocuments({
      user: userId,
      isRevoked: false,
    });
    expect(activeTokensBefore).toBe(3);

    // STEP 4: Initiate password reset
    const forgotRes = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: TEST_USER.email });

    expect(forgotRes.status).toBe(200);

    // Extract reset token from email mock
    const resetUrl = emailService.sendPasswordResetEmail.mock.calls[0][1];
    const url = new URL(resetUrl);
    const resetToken = url.searchParams.get("token");
    expect(resetToken).toBeDefined();

    // STEP 5: Reset password
    const resetRes = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({
        token: resetToken,
        password: "NewSecurePass123!",
      });

    // LAYER 1: HTTP Status
    expect(resetRes.status).toBe(200);

    // LAYER 2: Response Body
    expect(resetRes.body.success).toBe(true);
    expect(resetRes.body.message).toContain("successful");

    // LAYER 3: Database State — ALL sessions revoked
    const activeTokensAfter = await RefreshToken.countDocuments({
      user: userId,
      isRevoked: false,
    });
    expect(activeTokensAfter).toBe(0);

    // STEP 6: Verify all 3 sessions are now invalid
    const refresh1 = await session1Agent.post("/api/v1/auth/refresh");
    const refresh2 = await session2Agent.post("/api/v1/auth/refresh");
    const refresh3 = await session3Agent.post("/api/v1/auth/refresh");

    expect(refresh1.status).toBe(401);
    expect(refresh2.status).toBe(401);
    expect(refresh3.status).toBe(401);
  });
});
