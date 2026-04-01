// backend/__tests__/integration/auth-logout.test.js
import { vi, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import emailService from "../../services/email/email.service.js";
import * as cloudinaryModule from "../../services/cloudinaryService.js";
import RefreshToken from "../../model/RefreshToken.js";
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
    EmailService: vi.fn().mockImplementation(function() {
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

describe("Suite D — Logout Tests", () => {
  it("D1: Valid logout", async () => {
    const { agent, loginRes } = await registerVerifyAndLogin(app, emailService);

    // DB Assert: RefreshToken exists before logout
    const userId = loginRes.body.data.user.id;
    const tokenBefore = await RefreshToken.findOne({ user: userId });
    expect(tokenBefore).not.toBeNull();

    const res = await agent.post("/api/v1/auth/logout");

    // Assert: HTTP 200 or 204
    expect(res.status === 200 || res.status === 204).toBe(true);
    
    // Assert: set-cookie clears the cookie
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.includes("refresh_token=;") || c.includes("Max-Age=0") || c.includes("Expires="))).toBe(true);

    // DB Assert: RefreshToken deleted or isRevoked === true
    const tokenAfter = await RefreshToken.findOne({ user: userId });
    if (tokenAfter) {
      expect(tokenAfter.isRevoked).toBe(true);
    } else {
      expect(tokenAfter).toBeNull();
    }
  });

  it("D2: Logout without session returns 204", async () => {
    // 204 No Content is intentional behavior.
    // The server treats "already logged out" as a successful no-op.
    // It does not return 401 because there is no session to protect.
    const res = await request(app).post("/api/v1/auth/logout");
    
    expect(res.status).toBe(204);
  });

  it("D3: Double logout does not crash", async () => {
    const { agent } = await registerVerifyAndLogin(app, emailService);

    // First logout
    await agent.post("/api/v1/auth/logout");
    
    // Second logout
    const res = await agent.post("/api/v1/auth/logout");
    
    // Assert: second returns 200 or 401, NOT 500
    expect([200, 204, 401]).toContain(res.status);
    expect(res.status).not.toBe(500);
  });
});
