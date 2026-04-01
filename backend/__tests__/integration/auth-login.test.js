// backend/__tests__/integration/auth-login.test.js
import { vi, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import emailService from "../../services/email/email.service.js";
import * as cloudinaryModule from "../../services/cloudinaryService.js";
import User from "../../model/User.js";
import RefreshToken from "../../model/RefreshToken.js";
import { TEST_USER, registerAndVerify, registerUser } from "./helpers.js";

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

describe("Suite B — Login Tests", () => {
  it("B1: Valid credentials, verified user", async () => {
    await registerAndVerify(app, emailService);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

    // Assert: HTTP 200
    expect(res.status).toBe(200);
    
    // Assert: body.data.accessToken matches JWT format
    expect(res.body.data.accessToken).toMatch(/^[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+$/);
    
    // Assert: response set-cookie present with HttpOnly
    const cookies = res.headers["set-cookie"];
    expect(cookies).toBeDefined();
    expect(cookies.some(c => c.includes("HttpOnly"))).toBe(true);

    // DB Assert: RefreshToken document exists
    const tokenExists = await RefreshToken.exists({ user: res.body.data.user.id });
    expect(tokenExists).not.toBeNull();
  });

  it("B2: Unverified user", async () => {
    // Register but skip verification
    await registerUser(app);

    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({
        email: TEST_USER.email,
        password: TEST_USER.password
      });

    // Assert: HTTP 403
    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  describe("error message consistency", () => {
    it("B3 and B4: returns same message for wrong password and missing account", async () => {
      await registerAndVerify(app, emailService);
      
      const wrongPassRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: TEST_USER.email, password: "WrongPassword999!" });
      
      const noAccountRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "nobody@example.com", password: "AnyPassword123!" });
      
      expect(wrongPassRes.status).toBe(401);
      expect(noAccountRes.status).toBe(401);
      expect(wrongPassRes.body.message).toBe(noAccountRes.body.message);
    });
  });

  it("B5: Missing email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ password: "SecurePassword123!" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("B6: Missing password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
