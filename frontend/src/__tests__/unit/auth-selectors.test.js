// frontend/src/__tests__/unit/auth-selectors.test.js
import { describe, it, expect } from "vitest";
import {
  selectAuthStatus,
  selectIsAuthenticated,
  selectAuthLoading,
  selectAuthError,
  selectIsVerifying,
  selectSessionExpired,
  selectIsBootstrapComplete,
  selectAccessToken,
} from "@/store/slices/auth/auth-selectors";

const createMockState = (authOverrides = {}) => ({
  auth: {
    isAuthenticated: false,
    isLoading: false,
    error: null,
    isVerifying: false,
    sessionExpired: false,
    isBootstrapComplete: false,
    accessToken: null,
    ...authOverrides,
  },
});

describe("auth-selectors", () => {
  describe("selectAuthStatus", () => {
    it("should return auth status object", () => {
      const state = createMockState({
        isAuthenticated: true,
        isLoading: true,
        error: "Test error",
      });

      expect(selectAuthStatus(state)).toEqual({
        isAuthenticated: true,
        isLoading: true,
        error: "Test error",
      });
    });

    it("should return default auth status when state has default values", () => {
      const state = createMockState();

      expect(selectAuthStatus(state)).toEqual({
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    });
  });

  describe("selectIsAuthenticated", () => {
    it("should return true when authenticated", () => {
      const state = createMockState({ isAuthenticated: true });
      expect(selectIsAuthenticated(state)).toBe(true);
    });

    it("should return false when not authenticated", () => {
      const state = createMockState({ isAuthenticated: false });
      expect(selectIsAuthenticated(state)).toBe(false);
    });
  });

  describe("selectAuthLoading", () => {
    it("should return true when loading", () => {
      const state = createMockState({ isLoading: true });
      expect(selectAuthLoading(state)).toBe(true);
    });

    it("should return false when not loading", () => {
      const state = createMockState({ isLoading: false });
      expect(selectAuthLoading(state)).toBe(false);
    });
  });

  describe("selectAuthError", () => {
    it("should return error string", () => {
      const state = createMockState({ error: "Authentication failed" });
      expect(selectAuthError(state)).toBe("Authentication failed");
    });

    it("should return null when no error", () => {
      const state = createMockState({ error: null });
      expect(selectAuthError(state)).toBeNull();
    });
  });

  describe("selectIsVerifying", () => {
    it("should return true when verifying", () => {
      const state = createMockState({ isVerifying: true });
      expect(selectIsVerifying(state)).toBe(true);
    });

    it("should return false when not verifying", () => {
      const state = createMockState({ isVerifying: false });
      expect(selectIsVerifying(state)).toBe(false);
    });
  });

  describe("selectSessionExpired", () => {
    it("should return true when session expired", () => {
      const state = createMockState({ sessionExpired: true });
      expect(selectSessionExpired(state)).toBe(true);
    });

    it("should return false when session not expired", () => {
      const state = createMockState({ sessionExpired: false });
      expect(selectSessionExpired(state)).toBe(false);
    });
  });

  describe("selectIsBootstrapComplete", () => {
    it("should return true when bootstrap complete", () => {
      const state = createMockState({ isBootstrapComplete: true });
      expect(selectIsBootstrapComplete(state)).toBe(true);
    });

    it("should return false when bootstrap not complete", () => {
      const state = createMockState({ isBootstrapComplete: false });
      expect(selectIsBootstrapComplete(state)).toBe(false);
    });
  });

  describe("selectAccessToken", () => {
    it("should return access token", () => {
      const state = createMockState({ accessToken: "test-token-123" });
      expect(selectAccessToken(state)).toBe("test-token-123");
    });

    it("should return null when no access token", () => {
      const state = createMockState({ accessToken: null });
      expect(selectAccessToken(state)).toBeNull();
    });
  });
});
