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
import { requestEmailChange } from "@/store/slices/user/user-thunks";
import { NotificationService } from "@/lib/notifications/notify";
import { useChangeEmail } from "@/features/user/hooks/useChangeEmail";

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

describe("useChangeEmail", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedux.dispatch.mockImplementation((action) => action);
  });

  describe("initial state", () => {
    it("returns correct initial state", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangeEmail({ currentEmail: "a@b.com" }), {
        wrapper: Wrapper,
      });

      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.emailSent).toBe(false);
      expect(result.current.sentToEmail).toBe("");
      expect(typeof result.current.handleSave).toBe("function");
      expect(typeof result.current.resetEmailChange).toBe("function");
    });
  });

  describe("handleSave — same email guard", () => {
    it("calls NotificationService.error when new email same as current", async () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangeEmail({ currentEmail: "john@example.com" }), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.handleSave({
          newEmail: "John@Example.com",
          confirmNewEmail: "John@Example.com",
        });
      });

      expect(NotificationService.error).toHaveBeenCalledWith("emailMustBeDifferent");
    });

    it("does not dispatch when new email same as current", async () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangeEmail({ currentEmail: "john@example.com" }), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.handleSave({
          newEmail: "john@example.com",
          confirmNewEmail: "john@example.com",
        });
      });

      expect(mockRedux.dispatch).not.toHaveBeenCalled();
      expect(requestEmailChange).not.toHaveBeenCalled();
    });
  });

  describe("handleSave — success", () => {
    it("sets emailSent to true on success", async () => {
      requestEmailChange.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangeEmail({ currentEmail: "old@example.com" }), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.handleSave({
          newEmail: "new@example.com",
          confirmNewEmail: "new@example.com",
        });
      });

      expect(result.current.emailSent).toBe(true);
    });

    it("sets sentToEmail to the submitted email on success", async () => {
      requestEmailChange.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangeEmail({ currentEmail: "old@example.com" }), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.handleSave({
          newEmail: "new@example.com",
          confirmNewEmail: "new@example.com",
        });
      });

      expect(result.current.sentToEmail).toBe("new@example.com");
    });

    it("sets isSubmitting false after success", async () => {
      requestEmailChange.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangeEmail({ currentEmail: "old@example.com" }), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.handleSave({
          newEmail: "new@example.com",
          confirmNewEmail: "new@example.com",
        });
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("handleSave — error", () => {
    it("calls NotificationService.error when error is not global", async () => {
      requestEmailChange.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: false, message: "Local error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangeEmail({ currentEmail: "old@example.com" }), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.handleSave({
          newEmail: "new@example.com",
          confirmNewEmail: "new@example.com",
        });
      });

      expect(NotificationService.error).toHaveBeenCalledWith("Local error");
    });

    it("does not call NotificationService.error when isGlobalError is true", async () => {
      requestEmailChange.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: true, message: "Global error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangeEmail({ currentEmail: "old@example.com" }), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.handleSave({
          newEmail: "new@example.com",
          confirmNewEmail: "new@example.com",
        });
      });

      expect(NotificationService.error).not.toHaveBeenCalled();
    });

    it("sets isSubmitting false after error", async () => {
      requestEmailChange.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: false, message: "Local error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangeEmail({ currentEmail: "old@example.com" }), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.handleSave({
          newEmail: "new@example.com",
          confirmNewEmail: "new@example.com",
        });
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("resetEmailChange", () => {
    it("resets emailSent and sentToEmail to initial values", async () => {
      requestEmailChange.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(() => useChangeEmail({ currentEmail: "old@example.com" }), {
        wrapper: Wrapper,
      });

      await act(async () => {
        await result.current.handleSave({
          newEmail: "new@example.com",
          confirmNewEmail: "new@example.com",
        });
      });

      expect(result.current.emailSent).toBe(true);
      expect(result.current.sentToEmail).toBe("new@example.com");

      act(() => {
        result.current.resetEmailChange();
      });

      expect(result.current.emailSent).toBe(false);
      expect(result.current.sentToEmail).toBe("");
    });
  });
});

