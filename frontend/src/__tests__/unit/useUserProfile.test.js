import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import React from "react";

const mockNav = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRouter: () => ({
      push: mockNav.push,
    }),
  };
});

vi.mock("@/lib/notifications/notify", () => ({
  NotificationService: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

import authReducer, { clearCredentials } from "@/store/slices/auth/auth-slice";
import userReducer from "@/store/slices/user/user-slice";
import { NotificationService } from "@/lib/notifications/notify";
import { useUserProfile } from "@/features/user/hooks/useUserProfile";

function createWrapper(preloadedState = {}) {
  const store = configureStore({
    reducer: { auth: authReducer, user: userReducer },
    preloadedState,
  });

  function Wrapper({ children }) {
    return React.createElement(Provider, { store }, children);
  }

  return { Wrapper, store };
}

describe("useUserProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    delete global.BroadcastChannel;
  });

  describe("profile data derivation", () => {
    it("returns null/empty fields when no user in store", () => {
      const { Wrapper } = createWrapper({
        auth: {
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          sessionExpired: false,
          isBootstrapComplete: true,
          isVerifying: false,
        },
        user: { profile: null, isLoading: false, error: null },
      });

      const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });

      expect(result.current.user).toBeNull();
      expect(result.current.firstName).toBe("");
      expect(result.current.lastName).toBe("");
      expect(result.current.displayName).toBe("");
      expect(result.current.email).toBe("");
      expect(result.current.avatar).toBe(null);
      expect(result.current.isVerified).toBe(false);
      expect(result.current.initials).toBe("");
      expect(result.current.isAuthenticated).toBe(false);
    });

    it("returns firstName and lastName from profile", () => {
      const { Wrapper } = createWrapper({
        auth: {
          isAuthenticated: true,
          accessToken: "test-token",
          isLoading: false,
          error: null,
          sessionExpired: false,
          isBootstrapComplete: true,
          isVerifying: false,
        },
        user: {
          profile: {
            firstname: "John",
            lastname: "Doe",
            email: "john@example.com",
            avatar: null,
            isVerified: true,
            lastLoginAt: null,
          },
          isLoading: false,
          error: null,
        },
      });

      const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });

      expect(result.current.firstName).toBe("John");
      expect(result.current.lastName).toBe("Doe");
    });

    it("returns correct initials from first and last name", () => {
      const { Wrapper } = createWrapper({
        auth: {
          isAuthenticated: true,
          accessToken: "test-token",
          isLoading: false,
          error: null,
          sessionExpired: false,
          isBootstrapComplete: true,
          isVerifying: false,
        },
        user: {
          profile: {
            firstname: "John",
            lastname: "Doe",
            email: "john@example.com",
            avatar: null,
            isVerified: true,
            lastLoginAt: null,
          },
          isLoading: false,
          error: null,
        },
      });

      const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });
      expect(result.current.initials).toBe("JD");
    });

    it("returns displayName as full name", () => {
      const { Wrapper } = createWrapper({
        auth: {
          isAuthenticated: true,
          accessToken: "test-token",
          isLoading: false,
          error: null,
          sessionExpired: false,
          isBootstrapComplete: true,
          isVerifying: false,
        },
        user: {
          profile: {
            firstname: "John",
            lastname: "Doe",
            email: "john@example.com",
            avatar: null,
            isVerified: true,
            lastLoginAt: null,
          },
          isLoading: false,
          error: null,
        },
      });

      const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });
      expect(result.current.displayName).toBe("John Doe");
    });

    it("returns isAuthenticated from auth slice", () => {
      const { Wrapper } = createWrapper({
        auth: {
          isAuthenticated: true,
          accessToken: "test-token",
          isLoading: false,
          error: null,
          sessionExpired: false,
          isBootstrapComplete: true,
          isVerifying: false,
        },
        user: {
          profile: {
            firstname: "John",
            lastname: "Doe",
            email: "john@example.com",
          },
          isLoading: false,
          error: null,
        },
      });

      const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe("handleLogout", () => {
    function installLogoutGlobals() {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: true,
        })
      );

      global.BroadcastChannel = vi.fn(() => ({
        postMessage: vi.fn(),
        close: vi.fn(),
      }));

      Object.defineProperty(window, "sessionStorage", {
        value: { setItem: vi.fn() },
        writable: true,
      });
    }

    it("dispatches clearCredentials after logout fetch", async () => {
      installLogoutGlobals();

      const { Wrapper, store } = createWrapper({
        auth: {
          isAuthenticated: true,
          accessToken: "test-token",
          isLoading: false,
          error: null,
          sessionExpired: false,
          isBootstrapComplete: true,
          isVerifying: false,
        },
        user: {
          profile: {
            firstname: "John",
            lastname: "Doe",
            email: "john@example.com",
          },
          isLoading: false,
          error: null,
        },
      });

      const dispatchSpy = vi.spyOn(store, "dispatch");

      const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleLogout();
      });

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(dispatchSpy).toHaveBeenCalledWith(clearCredentials());
    });

    it("calls NotificationService.info after logout", async () => {
      installLogoutGlobals();

      const { Wrapper } = createWrapper({
        auth: {
          isAuthenticated: true,
          accessToken: "test-token",
          isLoading: false,
          error: null,
          sessionExpired: false,
          isBootstrapComplete: true,
          isVerifying: false,
        },
        user: { profile: { email: "john@example.com" }, isLoading: false, error: null },
      });

      const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleLogout();
      });

      expect(NotificationService.info).toHaveBeenCalledWith("signedOut");
    });

    it("calls router.push('/login') after logout", async () => {
      installLogoutGlobals();

      const { Wrapper } = createWrapper({
        auth: {
          isAuthenticated: true,
          accessToken: "test-token",
          isLoading: false,
          error: null,
          sessionExpired: false,
          isBootstrapComplete: true,
          isVerifying: false,
        },
        user: { profile: { email: "john@example.com" }, isLoading: false, error: null },
      });

      const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleLogout();
      });

      expect(mockNav.push).toHaveBeenCalledWith("/login");
    });

    it("still dispatches clearCredentials even if fetch throws", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
      global.BroadcastChannel = vi.fn(() => ({ postMessage: vi.fn(), close: vi.fn() }));
      Object.defineProperty(window, "sessionStorage", {
        value: { setItem: vi.fn() },
        writable: true,
      });

      const { Wrapper, store } = createWrapper({
        auth: {
          isAuthenticated: true,
          accessToken: "test-token",
          isLoading: false,
          error: null,
          sessionExpired: false,
          isBootstrapComplete: true,
          isVerifying: false,
        },
        user: { profile: { email: "john@example.com" }, isLoading: false, error: null },
      });
      const dispatchSpy = vi.spyOn(store, "dispatch");

      const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleLogout();
      });

      expect(dispatchSpy).toHaveBeenCalledWith(clearCredentials());
    });

    it("still navigates even if fetch throws", async () => {
      vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
      global.BroadcastChannel = vi.fn(() => ({ postMessage: vi.fn(), close: vi.fn() }));
      Object.defineProperty(window, "sessionStorage", {
        value: { setItem: vi.fn() },
        writable: true,
      });

      const { Wrapper } = createWrapper({
        auth: {
          isAuthenticated: true,
          accessToken: "test-token",
          isLoading: false,
          error: null,
          sessionExpired: false,
          isBootstrapComplete: true,
          isVerifying: false,
        },
        user: { profile: { email: "john@example.com" }, isLoading: false, error: null },
      });

      const { result } = renderHook(() => useUserProfile(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleLogout();
      });

      expect(mockNav.push).toHaveBeenCalledWith("/login");
    });
  });
});

