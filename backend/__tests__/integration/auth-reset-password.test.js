import { vi, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import emailService from "../../services/email/email.service.js";
import * as cloudinaryModule from "../../services/cloudinaryService.js";
import User from "../../model/User.js";
import { registerAndVerify } from "./helpers.js";

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
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Suite G — Reset Password Tests", () => {
  const TEST_USER = {
    firstname: "Reset",
    lastname: "User",
    email: "reset@example.com",
    password: "OldPassword123!",
    confirmPassword: "OldPassword123!",
    terms: true,
  };

  async function getResetToken(email) {
    await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email });

    // Extract resetUrl from mock call
    const resetUrl = emailService.sendPasswordResetEmail.mock.calls[0][1];
    // Format: .../reset-password?token=<token>&id=<id>
    const url = new URL(resetUrl);
    return url.searchParams.get("token");
  }

  it("G1: Valid reset token + new password", async () => {
    await registerAndVerify(app, emailService, TEST_USER);
    const oldUser = await User.findOne({ email: TEST_USER.email }).select("+password");
    const oldHash = oldUser.password;

    const token = await getResetToken(TEST_USER.email);
    expect(token).toBeDefined();

    const newPassword = "NewPassword123!";
    const res = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: newPassword });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // DB Assert: Password hash changed
    const updatedUser = await User.findOne({ email: TEST_USER.email }).select("+password");
    expect(updatedUser.password).not.toBe(oldHash);

    // Verify old password no longer works
    const loginOld = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: TEST_USER.password });
    expect(loginOld.status).toBe(401);

    // Verify new password works
    const loginNew = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: TEST_USER.email, password: newPassword });
    expect(loginNew.status).toBe(200);
  });

  it("G2: Expired reset token", async () => {
    await registerAndVerify(app, emailService, TEST_USER);
    const token = await getResetToken(TEST_USER.email);

    vi.useFakeTimers();
    // Advance 61 minutes (TTL is 1 hour)
    vi.setSystemTime(Date.now() + (61 * 60 * 1000));

    const res = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: "NewPassword123!" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe("INVALID_RESET_TOKEN");

    vi.useRealTimers();
  });

  it("G3: Replay attack (already used token)", async () => {
    await registerAndVerify(app, emailService, TEST_USER);
    const token = await getResetToken(TEST_USER.email);

    // Use token once
    await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: "NewPassword123!" });

    // Try using again
    const res = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: "AnotherPassword123!" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errorCode).toBe("INVALID_RESET_TOKEN");
  });

  it("G4: Invalid/tampered token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token: "invalid-token-too-short", password: "NewPassword123!" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);

    const resLong = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token: "a".repeat(32), password: "NewPassword123!" });

    expect(resLong.status).toBe(400);
    expect(resLong.body.success).toBe(false);
  });

  it("G5: Password validation", async () => {
    await registerAndVerify(app, emailService, TEST_USER);
    const token = await getResetToken(TEST_USER.email);

    const res = await request(app)
      .post("/api/v1/auth/reset-password")
      .send({ token, password: "" }); // Missing password

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
