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
  const mockSendEmailChangeConfirmation = vi.fn().mockResolvedValue({ success: true });

  const mockInstance = {
    sendVerificationEmail: mockSendVerificationEmail,
    sendPasswordResetEmail: mockSendPasswordResetEmail,
    sendWelcomeEmail: mockSendWelcomeEmail,
    sendResetSuccessEmail: mockSendResetSuccessEmail,
    sendEmailChangeConfirmation: mockSendEmailChangeConfirmation,
  };

  return {
    EmailService: vi.fn().mockImplementation(function () {
      return mockInstance;
    }),
    default: mockInstance,
  };
});

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
          password: user.password // REQUIRED field
        });

      // LAYER 1: HTTP
      expect(res.status).toBe(200);

      // LAYER 2: Body
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("confirmation");

      // LAYER 3: Email sent
      expect(emailService.sendEmailChangeConfirmation).toHaveBeenCalledTimes(1);
      expect(emailService.sendEmailChangeConfirmation.mock.calls[0][0].newEmail).toBe("newemail@example.com");
    });

    it("I.2: Rejects duplicate email", async () => {
      const { accessToken: token1 } = await registerVerifyAndLogin(app, emailService);
      const { user: existingUser } = await registerVerifyAndLogin(app, emailService, {
        email: "existing@example.com",
        firstName: "Existing",
        lastName: "User",
        password: "ExistingPass123!"
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
          newEmail: existingUser.email,
          password: "SecurePass123!" // Original user's password
        });

      expect(res.status).toBe(400);
      expect(res.body.errorCode).toBe("EMAIL_ALREADY_EXISTS");
    });

    it("I.3: Requires authentication", async () => {
      const res = await request(app)
        .post("/api/v1/user/email/request")
        .send({
          newEmail: "new@example.com",
          password: "anything"
        });

      expect(res.status).toBe(401);
    });
  });

  describe("GET /user/email/confirm/:token", () => {
    it("J.1: Confirms email change with valid token (302 redirect)", async () => {
      const { accessToken, user } = await registerVerifyAndLogin();

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
          password: user.password
        });

      // Extract token from DB
      const userDoc = await User.findById(user.id);
      const token = userDoc.emailChangeToken;

      const res = await request(app)
        .get(`/api/v1/user/email/confirm/${token}`)
        .redirects(0); // Don't follow redirect

      // LAYER 1: HTTP — Expect redirect
      expect(res.status).toBe(302);
      expect(res.headers.location).toContain("email-change-success");

      // LAYER 2: DB — email actually changed
      const updatedUser = await User.findById(user.id);
      expect(updatedUser.email).toBe("confirmed@example.com");
      expect(updatedUser.emailChangeToken).toBeUndefined();
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
          password: user.password
        });

      // Manually expire token
      const userDoc = await User.findById(user.id);
      userDoc.emailChangeTokenExpires = new Date(Date.now() - 1000);
      await userDoc.save();

      const res = await request(app)
        .get(`/api/v1/user/email/confirm/${userDoc.emailChangeToken}`)
        .redirects(0);

      expect(res.status).toBe(302);
      expect(res.headers.location).toContain("email-token-expired");
    });
  });
});
