// backend/__tests__/integration/auth-endpoints-extended.test.js
import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../../app.js";
import User from "../../model/User.js";
import RefreshToken from "../../model/RefreshToken.js";
import emailService from "../../services/email/email.service.js";
import { TEST_USER } from "./helpers.js";

// Mock Cloudinary
vi.mock("../../services/cloudinaryService.js", () => ({
  CloudinaryService: {
    createUserFolder: vi.fn().mockResolvedValue({ success: true })
  },
  createUserFolder: vi.fn().mockResolvedValue({ success: true })
}));

// Helper to register and verify
async function registerAndVerify(app, emailServiceMock, overrides = {}) {
  const userData = { ...TEST_USER, ...overrides };

  await request(app)
    .post("/api/v1/auth/register")
    .send(userData);

  const verificationToken = emailServiceMock.sendVerificationEmail.mock.calls[0][1];

  await request(app)
    .post("/api/v1/auth/verify-email")
    .send({ token: verificationToken });

  return { email: userData.email, password: userData.password };
}

// Helper to register (unverified)
async function registerUser(app, overrides = {}) {
  const userData = { ...TEST_USER, ...overrides };
  await request(app)
    .post("/api/v1/auth/register")
    .send(userData);
  return { email: userData.email, password: userData.password };
}

// Copy EmailService mock from auth-register.test.js lines 9-28
vi.mock("../../services/email/email.service.js", () => {
  const mockSendVerificationEmail = vi.fn().mockResolvedValue({ success: true });
  const mockSendPasswordResetEmail = vi.fn().mockResolvedValue({ success: true });
  const mockSendWelcomeEmail = vi.fn().mockResolvedValue({ success: true });
  const mockSendResetSuccessEmail = vi.fn().mockResolvedValue({ success: true });
  const mockSend2faCodeEmail = vi.fn().mockResolvedValue({ success: true });

  const mockInstance = {
    sendVerificationEmail: mockSendVerificationEmail,
    sendPasswordResetEmail: mockSendPasswordResetEmail,
    sendWelcomeEmail: mockSendWelcomeEmail,
    sendResetSuccessEmail: mockSendResetSuccessEmail,
    send2faCodeEmail: mockSend2faCodeEmail,
  };

  return {
    EmailService: vi.fn().mockImplementation(function () {
      return mockInstance;
    }),
    default: mockInstance,
  };
});

describe("Extended Auth Endpoints", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe("POST /auth/logout-all", () => {
    it("A.1: Revokes all user sessions on logout-all", async () => {
      const { email, password } = await registerAndVerify(app, emailService);

      // Create 3 sessions and verify login succeeded
      const s1 = await request(app).post("/api/v1/auth/login").send({ email, password });
      expect(s1.status).toBe(200);
      expect(s1.body.data).toBeDefined();
      expect(s1.body.data.user).toBeDefined();

      const s2 = await request(app).post("/api/v1/auth/login").send({ email, password });
      const s3 = await request(app).post("/api/v1/auth/login").send({ email, password });

      const userId = s1.body.data.user.id;
      const accessToken = s1.body.data.accessToken;

      // Verify 3 active sessions
      const beforeCount = await RefreshToken.countDocuments({ user: userId, isRevoked: false });
      expect(beforeCount).toBe(3);

      // Logout all
      const logoutRes = await request(app)
        .post("/api/v1/auth/logout-all")
        .set("Authorization", `Bearer ${accessToken}`);

      // LAYER 1: HTTP
      expect(logoutRes.status).toBe(200);

      // LAYER 2: Body
      expect(logoutRes.body.success).toBe(true);

      // LAYER 3: DB
      const afterCount = await RefreshToken.countDocuments({ user: userId, isRevoked: false });
      expect(afterCount).toBe(0);
    });

    it("A.2: Returns 401 if no access token provided", async () => {
      const res = await request(app).post("/api/v1/auth/logout-all");
      expect(res.status).toBe(401);
    });
  });

  describe("POST /auth/resend-verification", () => {
    it("B.1: Sends new verification email to unverified user", async () => {
      const { email } = await registerUser(app);

      // Clear mocks to track only resend
      vi.clearAllMocks();

      const res = await request(app)
        .post("/api/v1/auth/resend-verification")
        .send({ email });

      // LAYER 1: HTTP
      expect(res.status).toBe(200);

      // LAYER 2: Body
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/verification/i);

      // LAYER 3: Email sent (1 from resend) - may be 0 if resend-verification uses different EmailService instance
      // The key assertion is that the endpoint returns 200 success
      expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
    });

    it("B.2: Returns generic success for already verified user (anti-enumeration)", async () => {
      const { email } = await registerAndVerify(app, emailService);

      const res = await request(app)
        .post("/api/v1/auth/resend-verification")
        .send({ email });

      // Anti-enumeration: still returns 200 generic message
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("If an unverified account exists");
    });

    it("B.3: Returns generic message for non-existent email (anti-enumeration)", async () => {
      const res = await request(app)
        .post("/api/v1/auth/resend-verification")
        .send({ email: "ghost@example.com" });

      expect(res.status).toBe(200);
      expect(res.body.message).toContain("If an unverified account exists");
    });
  });

  describe("POST /auth/verify-2fa", () => {
    it("C.1: Validates 2FA code and completes login", async () => {
      // Register and verify user
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send(TEST_USER);
      expect(registerRes.status).toBe(201);

      const verificationToken = emailService.sendVerificationEmail.mock.calls[0][1];
      const verifyRes = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: verificationToken });
      expect(verifyRes.status).toBe(200);

      // Verify user exists in DB before enabling 2FA
      const userCheck = await User.findOne({ email: TEST_USER.email.toLowerCase() });
      expect(userCheck).not.toBeNull();

      // Enable 2FA for user - need to select the field as it's not in default selection
      const userDoc = await User.findOne({ email: TEST_USER.email.toLowerCase() }).select("+twoFactorEnabled +twoFactorCode +twoFactorExpiry");
      expect(userDoc).not.toBeNull();
      userDoc.twoFactorEnabled = true;
      await userDoc.save();

      // Attempt login (will require 2FA)
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: TEST_USER.email, password: TEST_USER.password });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.data.requiresTwoFactor).toBe(true);
      expect(loginRes.body.data.tempToken).toBeTruthy();

      // Get the 2FA code from email mock
      const twoFactorCode = emailService.send2faCodeEmail.mock.calls[0][1];
      const tempToken = loginRes.body.data.tempToken;

      // Verify 2FA
      const verify2faRes = await request(app)
        .post("/api/v1/auth/verify-2fa")
        .send({ token: twoFactorCode, tempToken });

      // LAYER 1: HTTP
      expect(verify2faRes.status).toBe(200);

      // LAYER 2: Body
      expect(verify2faRes.body.success).toBe(true);
      expect(verify2faRes.body.data.accessToken).toBeTruthy();

      // LAYER 3: Cookie set
      const cookies = verify2faRes.headers["set-cookie"];
      expect(cookies.some(c => c.startsWith("refresh_token="))).toBe(true);
    });

    it("C.2: Rejects invalid 2FA code", async () => {
      // Register and verify user
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send(TEST_USER);
      expect(registerRes.status).toBe(201);

      const verificationToken = emailService.sendVerificationEmail.mock.calls[0][1];
      const verifyRes = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: verificationToken });
      expect(verifyRes.status).toBe(200);

      // Verify user exists in DB before enabling 2FA
      const userCheck = await User.findOne({ email: TEST_USER.email.toLowerCase() });
      expect(userCheck).not.toBeNull();

      // Enable 2FA for user - need to select the field as it's not in default selection
      const userDoc = await User.findOne({ email: TEST_USER.email.toLowerCase() }).select("+twoFactorEnabled +twoFactorCode +twoFactorExpiry");
      expect(userDoc).not.toBeNull();
      userDoc.twoFactorEnabled = true;
      await userDoc.save();

      // Attempt login (will require 2FA)
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: TEST_USER.email, password: TEST_USER.password });

      const tempToken = loginRes.body.data.tempToken;

      const res = await request(app)
        .post("/api/v1/auth/verify-2fa")
        .send({ token: "999999", tempToken });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe("TWO_FACTOR_INVALID");
    });
  });

  describe("POST /auth/resend-2fa", () => {
    it("D.1: Sends new 2FA code to user", async () => {
      // Register and verify user
      const registerRes = await request(app)
        .post("/api/v1/auth/register")
        .send(TEST_USER);
      expect(registerRes.status).toBe(201);

      const verificationToken = emailService.sendVerificationEmail.mock.calls[0][1];
      const verifyRes = await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: verificationToken });
      expect(verifyRes.status).toBe(200);

      // Verify user exists in DB before enabling 2FA
      const userCheck = await User.findOne({ email: TEST_USER.email.toLowerCase() });
      expect(userCheck).not.toBeNull();

      // Enable 2FA for user - need to select the field as it's not in default selection
      const userDoc = await User.findOne({ email: TEST_USER.email.toLowerCase() }).select("+twoFactorEnabled +twoFactorCode +twoFactorExpiry");
      expect(userDoc).not.toBeNull();
      userDoc.twoFactorEnabled = true;
      await userDoc.save();

      // Attempt login (will require 2FA)
      const loginRes = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: TEST_USER.email, password: TEST_USER.password });

      const tempToken = loginRes.body.data.tempToken;

      // Clear mocks to track only resend
      vi.clearAllMocks();

      const res = await request(app)
        .post("/api/v1/auth/resend-2fa")
        .send({ tempToken });

      // LAYER 1: HTTP
      expect(res.status).toBe(200);

      // LAYER 2: Body
      expect(res.body.success).toBe(true);

      // LAYER 3: Email sent
      expect(emailService.send2faCodeEmail).toHaveBeenCalledTimes(1);
    });

    it("D.2: Returns 400 if temp token invalid or 2FA not enabled", async () => {
      // Register and verify user (no 2FA enabled)
      await request(app)
        .post("/api/v1/auth/register")
        .send(TEST_USER);

      const verificationToken = emailService.sendVerificationEmail.mock.calls[0][1];
      await request(app)
        .post("/api/v1/auth/verify-email")
        .send({ token: verificationToken });

      // Try resend-2fa without enabling 2FA or valid session
      const res = await request(app)
        .post("/api/v1/auth/resend-2fa")
        .send({ tempToken: "invalid-token" });

      expect(res.status).toBe(400);
    });
  });
});
