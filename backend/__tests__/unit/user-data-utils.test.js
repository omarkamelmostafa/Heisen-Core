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
  });
});
