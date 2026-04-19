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
import { toggle2fa } from "@/store/slices/user/user-thunks";
import { NotificationService } from "@/lib/notifications/notify";
import { useToggle2fa } from "@/features/user/hooks/useToggle2fa";

function createWrapper(
  preloadedState = {
    user: {
      profile: { twoFactorEnabled: false },
      isLoading: false,
      error: null,
    },
  }
) {
  const store = configureStore({
    reducer: { auth: authReducer, user: userReducer },
    preloadedState,
  });

  function Wrapper({ children }) {
    return React.createElement(Provider, { store }, children);
  }

  return { Wrapper, store };
}

describe("useToggle2fa", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedux.dispatch.mockImplementation((action) => action);
  });

  describe("initial state", () => {
    it("returns twoFactorEnabled from Redux store", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      expect(result.current.twoFactorEnabled).toBe(false);
    });

    it("returns isToggling2fa as false initially", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      expect(result.current.isToggling2fa).toBe(false);
    });

    it("returns showEnableDialog as false initially", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      expect(result.current.showEnableDialog).toBe(false);
    });

    it("returns showDisableDialog as false initially", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      expect(result.current.showDisableDialog).toBe(false);
    });

    it("returns password as empty string initially", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      expect(result.current.password).toBe("");
    });
  });

  describe("dialog controls", () => {
    it("sets showEnableDialog to true when handleOpenEnable called", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      act(() => {
        result.current.handleOpenEnable();
      });

      expect(result.current.showEnableDialog).toBe(true);
    });

    it("sets showDisableDialog to true when handleOpenDisable called", () => {
      const { Wrapper } = createWrapper({
        user: {
          profile: { twoFactorEnabled: true },
          isLoading: false,
          error: null,
        },
      });
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      act(() => {
        result.current.handleOpenDisable();
      });

      expect(result.current.showDisableDialog).toBe(true);
    });

    it("closes all dialogs and clears password on handleCloseDialogs", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      act(() => {
        result.current.handleOpenEnable();
        result.current.handleOpenDisable();
        result.current.setPassword("mypassword");
      });

      act(() => {
        result.current.handleCloseDialogs();
      });

      expect(result.current.showEnableDialog).toBe(false);
      expect(result.current.showDisableDialog).toBe(false);
      expect(result.current.password).toBe("");
    });
  });

  describe("handleToggle2fa — password guard", () => {
    it("calls NotificationService.error when password is empty", async () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleToggle2fa();
      });

      expect(NotificationService.error).toHaveBeenCalledWith("enterPassword");
    });

    it("does not dispatch when password is empty", async () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      await act(async () => {
        await result.current.handleToggle2fa();
      });

      expect(mockRedux.dispatch).not.toHaveBeenCalled();
      expect(toggle2fa).not.toHaveBeenCalled();
    });
  });

  describe("handleToggle2fa — success", () => {
    it("calls NotificationService.success on success", async () => {
      toggle2fa.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: { twoFactorEnabled: true } }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      act(() => {
        result.current.handleOpenEnable();
        result.current.setPassword("mypassword");
      });

      await act(async () => {
        await result.current.handleToggle2fa();
      });

      expect(NotificationService.success).toHaveBeenCalledWith("twoFactorEnabled");
    });

    it("sets isToggling2fa to false after success", async () => {
      toggle2fa.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: { twoFactorEnabled: true } }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      act(() => {
        result.current.setPassword("mypassword");
      });

      await act(async () => {
        await result.current.handleToggle2fa();
      });

      expect(result.current.isToggling2fa).toBe(false);
    });

    it("calls handleCloseDialogs after success", async () => {
      toggle2fa.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: { twoFactorEnabled: true } }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      act(() => {
        result.current.handleOpenEnable();
        result.current.setPassword("mypassword");
      });

      await act(async () => {
        await result.current.handleToggle2fa();
      });

      expect(result.current.showEnableDialog).toBe(false);
      expect(result.current.showDisableDialog).toBe(false);
      expect(result.current.password).toBe("");
    });
  });

  describe("handleToggle2fa — error", () => {
    it("calls NotificationService.error when error is not global", async () => {
      toggle2fa.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: false, message: "Local error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      act(() => {
        result.current.setPassword("mypassword");
      });

      await act(async () => {
        await result.current.handleToggle2fa();
      });

      expect(NotificationService.error).toHaveBeenCalledWith("Local error");
    });

    it("does not call NotificationService when isGlobalError is true", async () => {
      toggle2fa.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: true, message: "Global error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      act(() => {
        result.current.setPassword("mypassword");
      });

      await act(async () => {
        await result.current.handleToggle2fa();
      });

      expect(NotificationService.error).not.toHaveBeenCalled();
      expect(NotificationService.success).not.toHaveBeenCalled();
    });

    it("sets isToggling2fa to false after error", async () => {
      toggle2fa.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: false, message: "Local error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useToggle2fa(), { wrapper: Wrapper });

      act(() => {
        result.current.setPassword("mypassword");
      });

      await act(async () => {
        await result.current.handleToggle2fa();
      });

      expect(result.current.isToggling2fa).toBe(false);
    });
  });
});
