import { vi, beforeEach, describe, it, expect } from "vitest";
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
  vi.clearAllMocks(); // Reset call counts between tests
});

describe("Suite A — Registration Tests", () => {
  it("A1: Valid registration (3-layer assertion)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send(TEST_USER);

    // Assert: HTTP 201
    expect(res.status).toBe(201);
    
    // Assert: body.success === true
    expect(res.body.success).toBe(true);
    
    // Assert: body.data.user.email === TEST_USER.email
    expect(res.body.data.user.email).toBe(TEST_USER.email);
    
    // Assert: body.data.user.isVerified === false
    expect(res.body.data.user.isVerified).toBe(false);

    // Assert: email was sent successfully
    expect(res.body.data.emailSent).toBe(true);

    // DB Assert: User exists with matching email
    const userInDb = await User.findOne({ email: TEST_USER.email }).select("+password");
    expect(userInDb).not.toBeNull();
    
    // DB Assert: stored password !== TEST_USER.password
    expect(userInDb.password).not.toBe(TEST_USER.password);
    
    // DB Assert: user.isVerified === false
    expect(userInDb.isVerified).toBe(false);

    // Mock Assert: emailInstance.sendVerificationEmail called once
    expect(emailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
    
    // Mock Assert: called with object containing email === TEST_USER.email
    expect(emailService.sendVerificationEmail.mock.calls[0][0].email).toBe(TEST_USER.email);


    
    // Mock Assert: cloudinaryModule.createUserFolder called once
    // Account for structure based on previous inspection
    expect(cloudinaryModule.CloudinaryService.createUserFolder).toHaveBeenCalledTimes(1);
    expect(cloudinaryModule.CloudinaryService.createUserFolder).toHaveBeenCalledWith(expect.any(String));
  });

  it("A2: Duplicate email", async () => {
    // First registration
    await registerUser(app);

    // Second registration with the exact same user
    const res = await registerUser(app);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);

    // DB Assert: only 1 user with that email
    const usersCount = await User.countDocuments({ email: TEST_USER.email });
    expect(usersCount).toBe(1);
  });

  it("A3: Missing fields", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({});
      
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("A4: Invalid email", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...TEST_USER, email: "not-an-email" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("A5: Password too short", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...TEST_USER, password: "short", confirmPassword: "short" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("A6: Mismatched passwords", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...TEST_USER, confirmPassword: "DifferentPassword123!" });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
