// backend/__tests__/integration/user-email-change.test.js

import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../../app.js";
import User from "../../model/User.js";
import { registerVerifyAndLogin } from "./helpers.js";

// Copy EmailService mock from auth-register.test.js lines 9-28
vi.mock("../../services/email/email.service.js", () => {
  const mockSendVerificationEmail = vi.fn().mockResolvedValue({ success: true });
  const mockSendPasswordResetEmail = vi.fn().mockResolvedValue({ success: true });
  const mockSendWelcomeEmail = vi.fn().mockResolvedValue({ success: true });
  const mockSendResetSuccessEmail = vi.fn().mockResolvedValue({ success: true });
  const mockSendEmailChangeVerification = vi.fn().mockResolvedValue({ success: true });

  const mockInstance = {
    sendVerificationEmail: mockSendVerificationEmail,
    sendPasswordResetEmail: mockSendPasswordResetEmail,
    sendWelcomeEmail: mockSendWelcomeEmail,
    sendResetSuccessEmail: mockSendResetSuccessEmail,
    sendEmailChangeVerification: mockSendEmailChangeVerification,
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

describe("Email Change Endpoints", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe("POST /user/email/request", () => {
    it("I.1: Sends confirmation email for email change", async () => {
      const { accessToken, user } = await registerVerifyAndLogin(app, emailService);

      // Skip if 2FA user (accessToken undefined)
      if (!accessToken) {
        console.warn("Skipping test: user has 2FA enabled");
        return;
      }

      const res = await request(app)
        .post("/api/v1/user/email/request")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          newEmail: "newemail@example.com",
          currentPassword: user.password // REQUIRED field
        });

      // LAYER 1: HTTP
      expect(res.status).toBe(200);

      // LAYER 2: Body
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Verification email sent");

      // Wait for setImmediate
      await new Promise(resolve => setTimeout(resolve, 100));

      // LAYER 3: Email sent
      expect(emailService.sendEmailChangeVerification).toHaveBeenCalledTimes(1);
    });

    it("I.2: Rejects duplicate email", async () => {
      const { accessToken: token1, user: user1 } = await registerVerifyAndLogin(app, emailService);

      // Create a second user with different email
      const { user: user2 } = await registerVerifyAndLogin(app, emailService, {
        email: "existing@example.com",
      });

      // Skip if 2FA user
      if (!token1) {
        console.warn("Skipping test: user has 2FA enabled");
        return;
      }

      const res = await request(app)
        .post("/api/v1/user/email/request")
        .set("Authorization", `Bearer ${token1}`)
        .send({
          newEmail: user2.email,
          currentPassword: user1.password
        });

      expect(res.status).toBe(409);
      expect(res.body.errorCode).toBe("EMAIL_TAKEN");
    });

    it("I.3: Requires authentication", async () => {
      const res = await request(app)
        .post("/api/v1/user/email/request")
        .send({
          newEmail: "new@example.com",
          password: "anything"
        });

      // LAYER 1: HTTP
      expect(res.status).toBe(401);

      // LAYER 2: Body
      expect(res.body.success).toBe(false);
      expect(res.body.errorCode).toBe("NO_ACCESS_TOKEN");
    });
  });

  describe("GET /user/email/confirm/:token", () => {
    it("J.1: Confirms email change with valid token (302 redirect)", async () => {
      const { accessToken, user } = await registerVerifyAndLogin(app, emailService);

      // Skip if 2FA user
      if (!accessToken) {
        console.warn("Skipping test: user has 2FA enabled");
        return;
      }

      // Request email change
      await request(app)
        .post("/api/v1/user/email/request")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          newEmail: "confirmed@example.com",
          currentPassword: user.password
        });

      // Wait for setImmediate
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get raw token from email mock
      const callArgs = emailService.sendEmailChangeVerification.mock.calls[0];
      const confirmUrl = callArgs[1];
      const rawToken = confirmUrl.split("/").pop();

      const res = await request(app)
        .get(`/api/v1/user/email/confirm/${rawToken}`)
        .redirects(0); // Don't follow redirect

      // LAYER 1: HTTP — Expect redirect
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain("email-changed");

      // LAYER 2: DB — email actually changed
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.email).toBe("confirmed@example.com");

      const checkUser = await User.findById(user.id).select("+pendingEmailToken");
      expect(checkUser.pendingEmailToken).toBeNull();
    });

    it("J.2: Rejects invalid token (302 redirect to error)", async () => {
      const res = await request(app)
        .get("/api/v1/user/email/confirm/invalid-token-123")
        .redirects(0);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain("email-token-invalid");
    });

    it("J.3: Rejects expired token (302 redirect to error)", async () => {
      const { accessToken, user } = await registerVerifyAndLogin(app, emailService);

      // Skip if 2FA user
      if (!accessToken) {
        console.warn("Skipping test: user has 2FA enabled");
        return;
      }

      // Request change
      await request(app)
        .post("/api/v1/user/email/request")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          newEmail: "expired@example.com",
          currentPassword: user.password
        });

      // Wait for setImmediate
      await new Promise(resolve => setTimeout(resolve, 100));

      // Get raw token from email mock
      const callArgs = emailService.sendEmailChangeVerification.mock.calls[0];
      const confirmUrl = callArgs[1];
      const rawToken = confirmUrl.split("/").pop();

      // Manually expire the token in DB
      const userDoc = await User.findById(user.id)
        .select("+pendingEmailToken +pendingEmailExpiresAt");
      userDoc.pendingEmailExpiresAt = new Date(Date.now() - 1000);
      await userDoc.save();

      const res = await request(app)
        .get(`/api/v1/user/email/confirm/${rawToken}`)
        .redirects(0);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain("email-token-invalid");
    });
  });
});
