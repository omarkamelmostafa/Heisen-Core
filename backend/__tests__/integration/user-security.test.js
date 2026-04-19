// backend/__tests__/integration/user-security.test.js
import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../../app.js";
import User from "../../model/User.js";
import { registerVerifyAndLogin, TEST_USER } from "./helpers.js";
import { comparePassword } from "../../utilities/auth/hash-utils.js";

// Copy EmailService mock from auth-register.test.js
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

vi.mock("../../services/cloudinaryService.js", () => ({
  CloudinaryService: {
    createUserFolder: vi.fn().mockResolvedValue({ success: true }),
  },
}));

const emailService = (await import("../../services/email/email.service.js")).default;

describe("User Security Endpoints", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe("POST /user/security/password", () => {
    it("E.1: Successfully changes password", async () => {
      const { accessToken, user } = await registerVerifyAndLogin(app, emailService);

      expect(accessToken, "helper must complete 2FA and return a real access token").toBeDefined();

      const res = await request(app)
        .post("/api/v1/user/security/password")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          oldPassword: user.password,
          newPassword: "NewSecure123!",
          confirmPassword: "NewSecure123!",
        });

      // LAYER 1: HTTP
      expect(res.status).toBe(200);

      // LAYER 2: Body
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Password");

      // LAYER 3: DB — password actually changed
      const userDoc = await User.findById(user.id).select("+password");
      const isMatch = await comparePassword("NewSecure123!", userDoc.password);
      expect(isMatch).toBe(true);
    });

    it("E.2: Rejects incorrect current password", async () => {
      const { accessToken } = await registerVerifyAndLogin(app, emailService);

      expect(accessToken, "helper must complete 2FA and return a real access token").toBeDefined();

      const res = await request(app)
        .post("/api/v1/user/security/password")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          oldPassword: "WrongPassword123!",
          newPassword: "NewSecure123!",
          confirmPassword: "NewSecure123!",
        });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe("INVALID_PASSWORD");
    });

    it("E.3: Requires authentication", async () => {
      const res = await request(app)
        .post("/api/v1/user/security/password")
        .send({
          currentPassword: "anything",
          newPassword: "NewSecure123!",
        });

      // LAYER 1: HTTP
      expect(res.status).toBe(401);

      // LAYER 2: Body
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe("NO_ACCESS_TOKEN");
    });
  });

  describe("PATCH /user/security/2fa", () => {
    it("F.1: Enables 2FA", async () => {
      const { accessToken, user } = await registerVerifyAndLogin(app, emailService);

      expect(accessToken, "helper must complete 2FA and return a real access token").toBeDefined();

      const res = await request(app)
        .patch("/api/v1/user/security/2fa")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ enable: true, currentPassword: user.password });

      // LAYER 1: HTTP
      expect(res.status).toBe(200);

      // LAYER 2: Body
      expect(res.body.success).toBe(true);
      expect(res.body.data.twoFactorEnabled).toBe(true);

      // LAYER 3: DB
      const userDoc = await User.findById(user.id);
      expect(userDoc.twoFactorEnabled).toBe(true);
    });

    it("F.2: Disables 2FA", async () => {
      const { accessToken, user } = await registerVerifyAndLogin(app, emailService);

      expect(accessToken, "helper must complete 2FA and return a real access token").toBeDefined();

      // Enable first
      const userDoc = await User.findById(user.id);
      userDoc.twoFactorEnabled = true;
      await userDoc.save();

      const res = await request(app)
        .patch("/api/v1/user/security/2fa")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ enable: false, currentPassword: user.password });

      expect(res.status).toBe(200);
      expect(res.body.data.twoFactorEnabled).toBe(false);

      const updatedUser = await User.findById(user.id);
      expect(updatedUser.twoFactorEnabled).toBe(false);
    });

    it("F.3: Requires authentication", async () => {
      const res = await request(app)
        .patch("/api/v1/user/security/2fa")
        .send({ enabled: true });

      // LAYER 1: HTTP
      expect(res.status).toBe(401);

      // LAYER 2: Body
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe("NO_ACCESS_TOKEN");
    });
  });
});
