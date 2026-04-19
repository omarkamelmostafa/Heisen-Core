// backend/__tests__/unit/user-data-utils.test.js
import { describe, it, expect } from "vitest";
import { sanitizeUserForResponse } from "../../utilities/auth/user-data-utils.js";

// user-data-utils.js purpose:
// This file is responsible for cleaning and formatting the user model data objects before transmission.
// It exposes `sanitizeUserForResponse` for a strictly composed immutable user profile map
// tailored explicitly for authentication HTTP responses.

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
    avatar: null,
    isVerified: true,
    lastLogin: "2023-01-01",
    uuid: "some-uuid",
    createdAt: "2023-01-01",
    updatedAt: "2023-01-01",
    extra: "keep-me",
  };

  describe("sanitizeUserForResponse", () => {
    it("builds identical format to strictly whitelisted properties", () => {
      const sanitized = sanitizeUserForResponse(mockUser);
      expect(sanitized).toEqual({
        id: "user-abc",
        firstname: "John",
        lastname: "Doe",
        email: "john@doe.com",
        avatar: null,
        isVerified: true,
        twoFactorEnabled: false,
        lastLogin: "2023-01-01",
        uuid: "some-uuid",
        createdAt: "2023-01-01",
        updatedAt: "2023-01-01",
      });
      // Should completely exclude unrelated fields implicitly
      expect(sanitized.extra).toBeUndefined();
      expect(sanitized.password).toBeUndefined();
    });

    it("should strip sensitive fields from the response", () => {
      const sanitized = sanitizeUserForResponse(mockUser);

      expect(sanitized.password).toBeUndefined();
      expect(sanitized.refreshToken).toBeUndefined();
      expect(sanitized.loginAttempts).toBeUndefined();
      expect(sanitized.isLocked).toBeUndefined();
      expect(sanitized.lockUntil).toBeUndefined();
    });

    it("should map _id to id", () => {
      const sanitized = sanitizeUserForResponse(mockUser);

      expect(sanitized.id).toBe("user-abc");
      expect(sanitized._id).toBeUndefined();
    });

    it("should include avatar when provided", () => {
      const userWithAvatar = {
        ...mockUser,
        avatar: "https://example.com/avatar.jpg",
      };
      const sanitized = sanitizeUserForResponse(userWithAvatar);

      expect(sanitized.avatar).toBe("https://example.com/avatar.jpg");
    });

    it("should default avatar to null when not provided", () => {
      const userNoAvatar = { ...mockUser };
      delete userNoAvatar.avatar;
      const sanitized = sanitizeUserForResponse(userNoAvatar);

      expect(sanitized.avatar).toBeNull();
    });

    it("should default twoFactorEnabled to false when not set", () => {
      const sanitized = sanitizeUserForResponse(mockUser);

      expect(sanitized.twoFactorEnabled).toBe(false);
    });

    it("should reflect twoFactorEnabled when set to true", () => {
      const userWith2FA = { ...mockUser, twoFactorEnabled: true };
      const sanitized = sanitizeUserForResponse(userWith2FA);

      expect(sanitized.twoFactorEnabled).toBe(true);
    });

    it("should return a new object (not mutate the original)", () => {
      const sanitized = sanitizeUserForResponse(mockUser);

      expect(sanitized).not.toBe(mockUser);
      // Original should still have password
      expect(mockUser.password).toBe("hashed-pw");
    });

    it("should return exactly the whitelisted property set", () => {
      const sanitized = sanitizeUserForResponse(mockUser);
      const keys = Object.keys(sanitized).sort();

      expect(keys).toEqual([
        "avatar",
        "createdAt",
        "email",
        "firstname",
        "id",
        "isVerified",
        "lastLogin",
        "lastname",
        "twoFactorEnabled",
        "updatedAt",
        "uuid",
      ]);
    });
  });
});
