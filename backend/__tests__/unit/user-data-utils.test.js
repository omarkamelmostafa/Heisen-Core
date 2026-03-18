import { describe, it, expect } from "vitest";
import { processUserData, sanitizeUserForResponse } from "../../utilities/auth/user-data-utils.js";

// user-data-utils.js purpose:
// This file is responsible for cleaning and formatting the user model data objects before transmission.
// It exposes `processUserData` for dynamic key stripping and `sanitizeUserForResponse` for a strictly 
// composed immutable user profile map tailored explicitly for authentication HTTP responses.

describe("User Data Utilities (user-data-utils.js)", () => {
  const mockUser = {
    _id: "user-abc",
    firstname: "John",
    lastname: "Doe",
    email: "john@doe.com",
    password: "hashed-pw",
    refreshToken: "token-value",
    loginAttempts: 4,
    isLocked: false,
    lockUntil: null,
    profilePicture: "pic.jpg",
    isVerified: true,
    lastLogin: "2023-01-01",
    uuid: "some-uuid",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    extra: "keep-me",
  };

  const mockUserToObj = {
    ...mockUser,
    toObject: () => ({ ...mockUser }),
  };

  describe("processUserData", () => {
    it("strips default fields natively", async () => {
      const processed = await processUserData({ ...mockUser });
      expect(processed.password).toBeUndefined();
      expect(processed.refreshToken).toBeUndefined();
      expect(processed.loginAttempts).toBeUndefined();
      expect(processed.isLocked).toBeUndefined();
      expect(processed.lockUntil).toBeUndefined();
      expect(processed.extra).toBe("keep-me");
    });

    it("strips dynamic external array fields", async () => {
      const processed = await processUserData({ ...mockUser }, ["extra", "email"]);
      expect(processed.extra).toBeUndefined();
      expect(processed.email).toBeUndefined();
      expect(processed.firstname).toBe("John");
    });

    it("handles toObject mongoose instance gracefully", async () => {
      const processed = await processUserData(mockUserToObj);
      expect(processed.extra).toBe("keep-me");
      expect(processed.password).toBeUndefined();
    });
  });

  describe("sanitizeUserForResponse", () => {
    it("builds identical format to strictly whitelisted properties", () => {
      const sanitized = sanitizeUserForResponse(mockUser);
      expect(sanitized).toEqual({
        id: "user-abc",
        firstname: "John",
        lastname: "Doe",
        email: "john@doe.com",
        profilePicture: "pic.jpg",
        isVerified: true,
        lastLogin: "2023-01-01",
        uuid: "some-uuid",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
      });
      // Should completely exclude unrelated fields implicitly
      expect(sanitized.extra).toBeUndefined();
      expect(sanitized.password).toBeUndefined();
    });
  });
});
