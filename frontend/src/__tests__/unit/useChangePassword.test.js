import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import React from "react";

const mockRedux = vi.hoisted(() => ({
  dispatch: vi.fn(),
}));

vi.mock("react-redux", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useDispatch: () => mockRedux.dispatch,
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
import { changePassword } from "@/store/slices/user/user-thunks";
import { NotificationService } from "@/lib/notifications/notify";
import { useChangePassword } from "@/features/user/hooks/useChangePassword";

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

describe("useChangePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedux.dispatch.mockImplementation((action) => action);
  });

  describe("initial state", () => {
    it("returns isSubmitting as false initially", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangePassword(), { wrapper: Wrapper });
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("handleSave — success", () => {
    it("calls NotificationService.success on success", async () => {
      changePassword.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangePassword(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleSave({ currentPassword: "a", newPassword: "b" });
      });

      expect(NotificationService.success).toHaveBeenCalledWith("passwordUpdated");
    });

    it("sets isSubmitting false after success", async () => {
      changePassword.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangePassword(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleSave({ currentPassword: "a", newPassword: "b" });
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("handleSave — error", () => {
    it("calls NotificationService.error when error is not global", async () => {
      changePassword.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: false, message: "Local error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangePassword(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleSave({ currentPassword: "a", newPassword: "b" });
      });

      expect(NotificationService.error).toHaveBeenCalledWith("Local error");
    });

    it("does not call NotificationService when isGlobalError is true", async () => {
      changePassword.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: true, message: "Global error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangePassword(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleSave({ currentPassword: "a", newPassword: "b" });
      });

      expect(NotificationService.error).not.toHaveBeenCalled();
      expect(NotificationService.success).not.toHaveBeenCalled();
      expect(NotificationService.warn).not.toHaveBeenCalled();
      expect(NotificationService.info).not.toHaveBeenCalled();
    });

    it("sets isSubmitting false after error", async () => {
      changePassword.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: false, message: "Local error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangePassword(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleSave({ currentPassword: "a", newPassword: "b" });
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });
});

