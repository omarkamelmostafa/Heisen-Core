// backend/__tests__/integration/token-reuse-detection.test.js

import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../../app.js";
import RefreshToken from "../../model/RefreshToken.js";
import { registerAndVerify, TEST_USER } from "./helpers.js";
import emailService from "../../services/email/email.service.js";

const seedAgentCookie = (agent, cookie) => {
  if (!agent?.jar?.setCookie) {
    throw new Error("Supertest agent cookie jar is unavailable");
  }

  agent.jar.setCookie(cookie);
};

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

describe("S4: Token Reuse Detection", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  it("S4.1: Revokes ALL user sessions when revoked+replaced token is replayed", async () => {
    // STEP 1: Register and verify user
    await registerAndVerify(app, emailService);

    // STEP 2: Login to get token1 via persistent session agent
    const sessionAgent = request.agent(app);
    const loginRes = await sessionAgent
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });

    expect(loginRes.status).toBe(200);
    const cookies1 = loginRes.headers["set-cookie"];
    const token1Cookie = cookies1.find((c) => c.startsWith("refresh_token="));

    // STEP 3: Refresh to rotate token1 → token2 (token1 becomes revoked+replaced)
    const refreshRes1 = await sessionAgent.post("/api/v1/auth/refresh");

    expect(refreshRes1.status).toBe(200);
    const cookies2 = refreshRes1.headers["set-cookie"];
    const token2Cookie = cookies2.find((c) => c.startsWith("refresh_token="));

    // STEP 4: Verify token1 is now revoked with replacedBy set
    const userId = loginRes.body.data.user.id;
    const revokedToken = await RefreshToken.findOne({
      user: userId,
      isRevoked: true,
    });
    expect(revokedToken).toBeTruthy();
    expect(revokedToken.replacedBy).toBeTruthy();

    // STEP 5: Replay token1 (attacker scenario) via dedicated replay agent → trigger mass revocation
    const replayAgent = request.agent(app);
    seedAgentCookie(replayAgent, token1Cookie);

    const reuseRes = await replayAgent.post("/api/v1/auth/refresh");

    // LAYER 1: HTTP Status
    expect(reuseRes.status).toBe(401);

    // LAYER 2: Response Body
    expect(reuseRes.body.success).toBe(false);
    expect(reuseRes.body.errorCode).toBe("TOKEN_REUSE_DETECTED");
    expect(reuseRes.body.message).toContain("Token reuse detected");

    // LAYER 3: Database State — ALL tokens revoked
    const activeTokensCount = await RefreshToken.countDocuments({
      user: userId,
      isRevoked: false,
    });
    expect(activeTokensCount).toBe(0);

    // STEP 6: Verify token2 is also revoked (collateral damage)
    const token2Res = await sessionAgent.post("/api/v1/auth/refresh");

    expect(token2Res.status).toBe(401);
    expect(token2Res.body.errorCode).toBe("TOKEN_REVOKED");
  });
});
