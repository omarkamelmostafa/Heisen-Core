import { vi, beforeEach, afterEach, describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import emailService from "../../services/email/email.service.js";
import * as cloudinaryModule from "../../services/cloudinaryService.js";
import User from "../../model/User.js";
import { TEST_USER, registerUser } from "./helpers.js";

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

afterEach(() => {
  vi.useRealTimers();
});

describe("Suite E — Verify Email Tests", () => {
  it("E1: Valid token", async () => {
    await registerUser(app);

    const verificationToken = emailService.sendVerificationEmail.mock.calls[0][1];

    const res = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: verificationToken });

    // Assert: HTTP 200
    expect(res.status).toBe(200);

    const userInDb = await User.findOne({ email: TEST_USER.email });
    // DB Assert: user.isVerified === true
    expect(userInDb.isVerified).toBe(true);
    // DB Assert: user.verificationToken is null/undefined
    expect(userInDb.verificationToken).toBeUndefined();
  });

  it("E2: Wrong token", async () => {
    await registerUser(app);

    const res = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: "000000" });

    // Assert: HTTP 400
    expect(res.status).toBe(400);

    const userInDb = await User.findOne({ email: TEST_USER.email });
    // DB Assert: user.isVerified === false
    expect(userInDb.isVerified).toBe(false);
  });

  it("E3: Expired token", async () => {
    await registerUser(app);
    
    const verificationToken = emailService.sendVerificationEmail.mock.calls[0][1];

    vi.useFakeTimers();
    // Advance past token expiry (e.g., typically 24 hours, so advance 2 days)
    vi.advanceTimersByTime(2 * 24 * 60 * 60 * 1000);

    const res = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: verificationToken });

    // Assert: HTTP 400 or 410
    expect([400, 410]).toContain(res.status);
  });

  it("E4: Token reuse (already verified)", async () => {
    await registerUser(app);
    
    const verificationToken = emailService.sendVerificationEmail.mock.calls[0][1];

    // First verification
    await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: verificationToken });

    // Second verification
    const res = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: verificationToken });

    // Assert: HTTP 400 or 409
    expect([400, 409]).toContain(res.status);
  });

  it("E5: Non-existent token", async () => {
    const res = await request(app)
      .post("/api/v1/auth/verify-email")
      .send({ token: "999999" });

    // Assert: HTTP 400
    expect(res.status).toBe(400);
  });
});
