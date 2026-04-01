// backend/__tests__/integration/user-profile.test.js

import { describe, it, expect, beforeEach, vi } from "vitest";
import request from "supertest";
import app from "../../app.js";
import User from "../../model/User.js";
import emailService from "../../services/email/email.service.js";
import { registerVerifyAndLogin } from "./helpers.js";

// Mock EmailService
vi.mock("../../services/email/email.service.js", () => {
  const mockInstance = {
    sendVerificationEmail: vi.fn().mockResolvedValue({ success: true }),
    sendPasswordResetEmail: vi.fn().mockResolvedValue({ success: true }),
    sendWelcomeEmail: vi.fn().mockResolvedValue({ success: true }),
    sendResetSuccessEmail: vi.fn().mockResolvedValue({ success: true }),
  };
  return {
    EmailService: vi.fn().mockImplementation(function () {
      return mockInstance;
    }),
    default: mockInstance,
  };
});

// Mock CloudinaryService
vi.mock("../../services/cloudinaryService.js", () => ({
  CloudinaryService: {
    uploadAvatar: vi.fn().mockResolvedValue({
      url: "https://res.cloudinary.com/test/image.jpg",
      publicId: "test-public-id",
    }),
    deleteImage: vi.fn().mockResolvedValue({ result: "ok" }),
    createUserFolder: vi.fn().mockResolvedValue({ success: true }),
  },
}));

describe("User Profile Endpoints", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  describe("PATCH /user/me", () => {
    it("G.1: Updates profile fields", async () => {
      const { accessToken, user } = await registerVerifyAndLogin(app, emailService);

      const res = await request(app)
        .patch("/api/v1/user/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          firstname: "Updated",
          lastname: "Name",
        });

      // LAYER 1: HTTP
      expect(res.status).toBe(200);

      // LAYER 2: Body
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.firstname).toBe("Updated");
      expect(res.body.data.user.lastname).toBe("Name");

      // LAYER 3: DB
      const userDoc = await User.findById(user.id);
      expect(userDoc.firstname).toBe("Updated");
      expect(userDoc.lastname).toBe("Name");
    });

    it("G.2: Rejects invalid fields", async () => {
      const { accessToken } = await registerVerifyAndLogin(app, emailService);

      const res = await request(app)
        .patch("/api/v1/user/me")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          email: "newemail@example.com", // Email should not be updatable via this endpoint
        });

      expect(res.status).toBe(400);
    });

    it("G.3: Requires authentication", async () => {
      const res = await request(app)
        .patch("/api/v1/user/me")
        .send({ firstname: "Test" });

      expect(res.status).toBe(401);
    });
  });

  describe("POST /user/profile/avatar", () => {
    it("H.1: Uploads avatar successfully", async () => {
      const { accessToken, user } = await registerVerifyAndLogin(app, emailService);

      const res = await request(app)
        .post("/api/v1/user/profile/avatar")
        .set("Authorization", `Bearer ${accessToken}`)
        .attach("avatar", Buffer.from("fake-image-data"), "avatar.jpg");

      // LAYER 1: HTTP
      expect(res.status).toBe(200);

      // LAYER 2: Body
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.avatar.url).toContain("cloudinary.com");

      // LAYER 3: DB
      const userDoc = await User.findById(user.id);
      expect(userDoc.avatar.url).toContain("cloudinary.com");
    });

    it("H.2: Rejects non-image files", async () => {
      const { accessToken } = await registerVerifyAndLogin(app, emailService);

      const res = await request(app)
        .post("/api/v1/user/profile/avatar")
        .set("Authorization", `Bearer ${accessToken}`)
        .attach("avatar", Buffer.from("fake-pdf"), "document.pdf");

      expect(res.status).toBe(400);
    });

    it("H.3: Requires authentication", async () => {
      const res = await request(app)
        .post("/api/v1/user/profile/avatar")
        .attach("avatar", Buffer.from("fake-image"), "avatar.jpg");

      expect(res.status).toBe(401);
    });
  });
});
