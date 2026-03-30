import { vi, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../app.js";
import emailService from "../../services/email/email.service.js";
import { registerVerifyAndLogin } from "./helpers.js";

// vi.mock() is hoisted
vi.mock("../../services/email/email.service.js", () => {
  const mockInstance = {
    sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
    sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
    sendWelcomeEmail: vi.fn().mockResolvedValue({ success: true }),
    sendResetSuccessEmail: vi.fn().mockResolvedValue({ success: true }),
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
  }
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Suite H — User Profile Tests", () => {
  const getTestUser = (id) => ({
    firstname: "Profile",
    lastname: "User",
    email: `profile-${id}@example.com`,
    password: "Password123!",
    confirmPassword: "Password123!",
    terms: true,
  });

  it("H1: Valid access token returns user profile", async () => {
    const userData = getTestUser("h1");
    const { loginRes } = await registerVerifyAndLogin(app, emailService, userData);
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.data.accessToken;

    const res = await request(app)
      .get("/api/v1/user/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user).toBeDefined();
    expect(res.body.data.user.email).toBe(userData.email.toLowerCase());
    expect(res.body.data.user.firstname).toBe(userData.firstname);
    
    // Security check: sensitive fields must be absent
    expect(res.body.data.user.password).toBeUndefined();
    expect(res.body.data.user.refreshToken).toBeUndefined();
  });

  it("H2: No authorization header", async () => {
    const res = await request(app).get("/api/v1/user/me");
    expect(res.status).toBe(401);
  });

  it("H3: Expired access token", async () => {
    const userData = getTestUser("h3");
    const { loginRes } = await registerVerifyAndLogin(app, emailService, userData);
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.data.accessToken;

    vi.useFakeTimers();
    // Advance 2 hours to be absolutely sure
    vi.setSystemTime(Date.now() + (2 * 60 * 60 * 1000));

    const res = await request(app)
      .get("/api/v1/user/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(res.status).toBe(401);
    vi.useRealTimers();
  });

  it("H4: Tampered access token", async () => {
    const userData = getTestUser("h4");
    const { loginRes } = await registerVerifyAndLogin(app, emailService, userData);
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.data.accessToken;
    const tampered = accessToken.slice(0, -1) + (accessToken.endsWith('X') ? 'Y' : 'X');

    const res = await request(app)
      .get("/api/v1/user/me")
      .set("Authorization", `Bearer ${tampered}`);

    expect(res.status).toBe(401);
  });

  it("H5: Malformed authorization header", async () => {
    const userData = getTestUser("h5");
    const { loginRes } = await registerVerifyAndLogin(app, emailService, userData);
    expect(loginRes.status).toBe(200);
    const accessToken = loginRes.body.data.accessToken;

    const res = await request(app)
      .get("/api/v1/user/me")
      .set("Authorization", `NotBearer ${accessToken}`);

    expect(res.status).toBe(401);
  });
});
