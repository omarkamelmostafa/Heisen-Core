// frontend/src/__tests__/unit/user-selectors.test.js

import { describe, it, expect } from "vitest";
import {
  selectUserProfile,
  selectUserIsLoading,
  selectUserError,
  selectUserEmail,
  selectUser2FA,
  selectUserAvatar,
  selectUserIsVerified,
  selectUserDisplayName,
} from "@/store/slices/user/user-selectors";

// ── Mock state factory ──────────────────────────────────────
const createMockState = (profileOverrides = {}, sliceOverrides = {}) => ({
  user: {
    profile: null,
    isLoading: false,
    error: null,
    ...sliceOverrides,
    profile:
      sliceOverrides.profile !== undefined
        ? sliceOverrides.profile
        : Object.keys(profileOverrides).length > 0
          ? {
            email: "test@example.com",
            name: "Test User",
            twoFactorEnabled: false,
            avatar: null,
            isVerified: true,
            ...profileOverrides,
          }
          : null,
  },
});

// ── Tests ───────────────────────────────────────────────────

describe("user-selectors", () => {

  describe("selectUserProfile", () => {
    it("returns null when profile is not set", () => {
      const state = createMockState();
      expect(selectUserProfile(state)).toBeNull();
    });

    it("returns full profile object when set", () => {
      const state = createMockState({ name: "Alice" });
      expect(selectUserProfile(state)).toEqual(
        expect.objectContaining({ name: "Alice", email: "test@example.com" })
      );
    });
  });

  describe("selectUserIsLoading", () => {
    it("returns false by default", () => {
      const state = createMockState();
      expect(selectUserIsLoading(state)).toBe(false);
    });

    it("returns true when loading", () => {
      const state = createMockState({}, { isLoading: true, profile: null });
      expect(selectUserIsLoading(state)).toBe(true);
    });
  });

  describe("selectUserError", () => {
    it("returns null by default", () => {
      const state = createMockState();
      expect(selectUserError(state)).toBeNull();
    });

    it("returns error string when set", () => {
      const state = createMockState({}, { error: "Something went wrong", profile: null });
      expect(selectUserError(state)).toBe("Something went wrong");
    });
  });

  describe("selectUserEmail", () => {
    it("returns undefined when profile is null", () => {
      const state = createMockState();
      expect(selectUserEmail(state)).toBeUndefined();
    });

    it("returns email string when profile is set", () => {
      const state = createMockState({ email: "alice@example.com" });
      expect(selectUserEmail(state)).toBe("alice@example.com");
    });
  });

  describe("selectUser2FA", () => {
    it("returns undefined when profile is null", () => {
      const state = createMockState();
      expect(selectUser2FA(state)).toBeUndefined();
    });

    it("returns false when 2FA is disabled", () => {
      const state = createMockState({ twoFactorEnabled: false });
      expect(selectUser2FA(state)).toBe(false);
    });

    it("returns true when 2FA is enabled", () => {
      const state = createMockState({ twoFactorEnabled: true });
      expect(selectUser2FA(state)).toBe(true);
    });
  });

  describe("selectUserAvatar", () => {
    it("returns undefined when profile is null", () => {
      const state = createMockState();
      expect(selectUserAvatar(state)).toBeUndefined();
    });

    it("returns null when avatar not set", () => {
      const state = createMockState({ avatar: null });
      expect(selectUserAvatar(state)).toBeNull();
    });

    it("returns avatar URL when set", () => {
      const state = createMockState({ avatar: "https://cdn.example.com/avatar.jpg" });
      expect(selectUserAvatar(state)).toBe("https://cdn.example.com/avatar.jpg");
    });
  });

  describe("selectUserIsVerified", () => {
    it("returns undefined when profile is null", () => {
      const state = createMockState();
      expect(selectUserIsVerified(state)).toBeUndefined();
    });

    it("returns true when user is verified", () => {
      const state = createMockState({ isVerified: true });
      expect(selectUserIsVerified(state)).toBe(true);
    });

    it("returns false when user is not verified", () => {
      const state = createMockState({ isVerified: false });
      expect(selectUserIsVerified(state)).toBe(false);
    });
  });

  describe("selectUserDisplayName (memoized)", () => {
    it("returns null when profile is null", () => {
      const state = createMockState();
      expect(selectUserDisplayName(state)).toBeNull();
    });

    it("returns profile.name when name is set", () => {
      const state = createMockState({ name: "Alice Smith" });
      expect(selectUserDisplayName(state)).toBe("Alice Smith");
    });

    it("returns email username prefix when name is absent", () => {
      const state = createMockState({ name: undefined, email: "bob@example.com" });
      expect(selectUserDisplayName(state)).toBe("bob");
    });

    it("returns email username prefix when name is empty string", () => {
      const state = createMockState({ name: "", email: "carol@example.com" });
      expect(selectUserDisplayName(state)).toBe("carol");
    });

    it("is memoized — returns same reference on identical state", () => {
      const state = createMockState({ name: "Dave" });
      const first = selectUserDisplayName(state);
      const second = selectUserDisplayName(state);
      expect(first).toBe(second);
    });
  });

});
