import { vi, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import emailService from "../../services/email/email.service.js";
import * as cloudinaryModule from "../../services/cloudinaryService.js";
import User from "../../model/User.js";
import { TEST_USER, registerAndVerify } from "./helpers.js";

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

describe("Suite F — Forgot Password Tests", () => {
  let storedSuccessMessage = "";

  it("F1: Valid registered email", async () => {
    await registerAndVerify(app, emailService);
    
    // Clear mocks before next action to isolate metrics
    vi.clearAllMocks();

    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: TEST_USER.email });

    // Assert: HTTP 200
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    storedSuccessMessage = res.body.message;

    // Mock Assert: reset email method called once
    expect(emailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
    
    // DB Assert: user has resetPasswordToken set
    const userInDb = await User.findOne({ email: TEST_USER.email }).select("+resetPasswordToken +resetPasswordExpiresAt");
    expect(userInDb.resetPasswordToken).toBeDefined();
    expect(userInDb.resetPasswordExpiresAt).toBeDefined();
  });

  it("F2: Non-existent email returns identical success message", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "nonexistent@example.com" });

    // Assert: HTTP 200
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    
    // Assert: message matches F1 EXACTLY
    if (storedSuccessMessage) {
      expect(res.body.message).toBe(storedSuccessMessage);
    }

    // Mock Assert: reset email method was NOT called
    expect(emailService.sendPasswordResetEmail).not.toHaveBeenCalled();
  });

  it("F3: Missing email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({});
      
    expect(res.status).toBe(400);
  });

  it("F4: Invalid email format", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "not-an-email" });
      
    expect(res.status).toBe(400);
  });
});
