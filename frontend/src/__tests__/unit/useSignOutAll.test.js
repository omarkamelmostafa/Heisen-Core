import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import React from "react";

const mockRedux = vi.hoisted(() => ({
  dispatch: vi.fn(),
}));

const mockNav = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDispatch: () => mockRedux.dispatch,
  };
});

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

import authReducer from "@/store/slices/auth/auth-slice";
import userReducer from "@/store/slices/user/user-slice";
import { logoutAllDevices } from "@/store/slices/auth/auth-thunks";
import { NotificationService } from "@/lib/notifications/notify";
import { useSignOutAll } from "@/features/user/hooks/useSignOutAll";

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

describe("useSignOutAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    mockRedux.dispatch.mockImplementation((action) => action);
    Object.defineProperty(window, "sessionStorage", {
      value: { setItem: vi.fn() },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("initial state", () => {
    it("returns isSigningOutAll as false initially", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useSignOutAll(), { wrapper: Wrapper });

      expect(result.current.isSigningOutAll).toBe(false);
    });
  });

  describe("handleSignOutAll — success", () => {
    it("calls NotificationService.success on success", async () => {
      const mockPostMessage = vi.fn();
      const mockClose = vi.fn();
      logoutAllDevices.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });
      vi.stubGlobal(
        "BroadcastChannel",
        vi.fn().mockImplementation(() => ({
          postMessage: mockPostMessage,
          close: mockClose,
        }))
      );

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useSignOutAll(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleSignOutAll();
      });

      expect(NotificationService.success).toHaveBeenCalledWith("allDevicesSignedOut");
      expect(mockPostMessage).toHaveBeenCalled();
    });

    it("calls router.push('/login') after success", async () => {
      logoutAllDevices.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });
      vi.stubGlobal(
        "BroadcastChannel",
        vi.fn().mockImplementation(() => ({
          postMessage: vi.fn(),
          close: vi.fn(),
        }))
      );

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useSignOutAll(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleSignOutAll();
      });

      expect(mockNav.push).toHaveBeenCalledWith("/login");
    });

    it("sets isSigningOutAll to false after success", async () => {
      logoutAllDevices.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });
      vi.stubGlobal(
        "BroadcastChannel",
        vi.fn().mockImplementation(() => ({
          postMessage: vi.fn(),
          close: vi.fn(),
        }))
      );

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useSignOutAll(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleSignOutAll();
      });

      expect(result.current.isSigningOutAll).toBe(false);
    });
  });

  describe("handleSignOutAll — error", () => {
    it("calls NotificationService.error when error is not global", async () => {
      logoutAllDevices.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: false, message: "Local error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useSignOutAll(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleSignOutAll();
      });

      expect(NotificationService.error).toHaveBeenCalledWith("Local error");
    });

    it("does not call NotificationService when isGlobalError is true", async () => {
      logoutAllDevices.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: true, message: "Global error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useSignOutAll(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleSignOutAll();
      });

      expect(NotificationService.error).not.toHaveBeenCalled();
      expect(NotificationService.success).not.toHaveBeenCalled();
    });

    it("sets isSigningOutAll to false after error", async () => {
      logoutAllDevices.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: false, message: "Local error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useSignOutAll(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleSignOutAll();
      });

      expect(result.current.isSigningOutAll).toBe(false);
    });
  });
});
