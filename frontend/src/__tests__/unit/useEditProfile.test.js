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
import { updateProfile } from "@/store/slices/user/user-thunks";
import { NotificationService } from "@/lib/notifications/notify";
import { useEditProfile } from "@/features/user/hooks/useEditProfile";

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

describe("useEditProfile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRedux.dispatch.mockImplementation((action) => action);
  });

  describe("initial state", () => {
    it("returns isEditing as false initially", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useEditProfile({ firstname: "John", lastname: "Doe" }),
        { wrapper: Wrapper }
      );

      expect(result.current.isEditing).toBe(false);
    });

    it("returns isSubmitting as false initially", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useEditProfile({ firstname: "John", lastname: "Doe" }),
        { wrapper: Wrapper }
      );

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("startEditing / cancelEditing", () => {
    it("sets isEditing to true when startEditing is called", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useEditProfile({ firstname: "John", lastname: "Doe" }),
        { wrapper: Wrapper }
      );

      act(() => {
        result.current.startEditing();
      });

      expect(result.current.isEditing).toBe(true);
    });

    it("sets isEditing to false when cancelEditing is called", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useEditProfile({ firstname: "John", lastname: "Doe" }),
        { wrapper: Wrapper }
      );

      act(() => {
        result.current.startEditing();
        result.current.cancelEditing();
      });

      expect(result.current.isEditing).toBe(false);
    });
  });

  describe("handleSave — success", () => {
    it("calls NotificationService.success on success", async () => {
      updateProfile.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useEditProfile({ firstname: "John", lastname: "Doe" }),
        { wrapper: Wrapper }
      );

      await act(async () => {
        await result.current.handleSave({ firstname: "Jane", lastname: "Smith" });
      });

      expect(NotificationService.success).toHaveBeenCalledWith("profileUpdated");
    });

    it("sets isEditing to false after successful save", async () => {
      updateProfile.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useEditProfile({ firstname: "John", lastname: "Doe" }),
        { wrapper: Wrapper }
      );

      act(() => {
        result.current.startEditing();
      });

      await act(async () => {
        await result.current.handleSave({ firstname: "Jane", lastname: "Smith" });
      });

      expect(result.current.isEditing).toBe(false);
    });

    it("sets isSubmitting to false after success", async () => {
      updateProfile.mockReturnValue({
        unwrap: vi.fn().mockResolvedValue({ data: {} }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useEditProfile({ firstname: "John", lastname: "Doe" }),
        { wrapper: Wrapper }
      );

      await act(async () => {
        await result.current.handleSave({ firstname: "Jane", lastname: "Smith" });
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("handleSave — error", () => {
    it("calls NotificationService.error when error is not global", async () => {
      updateProfile.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: false, message: "Local error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useEditProfile({ firstname: "John", lastname: "Doe" }),
        { wrapper: Wrapper }
      );

      await act(async () => {
        await result.current.handleSave({ firstname: "Jane", lastname: "Smith" });
      });

      expect(NotificationService.error).toHaveBeenCalledWith("Local error");
    });

    it("does not call NotificationService when isGlobalError is true", async () => {
      updateProfile.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: true, message: "Global error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useEditProfile({ firstname: "John", lastname: "Doe" }),
        { wrapper: Wrapper }
      );

      await act(async () => {
        await result.current.handleSave({ firstname: "Jane", lastname: "Smith" });
      });

      expect(NotificationService.error).not.toHaveBeenCalled();
      expect(NotificationService.success).not.toHaveBeenCalled();
    });

    it("sets isSubmitting to false after error", async () => {
      updateProfile.mockReturnValue({
        unwrap: vi.fn().mockRejectedValue({ isGlobalError: false, message: "Local error" }),
      });

      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useEditProfile({ firstname: "John", lastname: "Doe" }),
        { wrapper: Wrapper }
      );

      await act(async () => {
        await result.current.handleSave({ firstname: "Jane", lastname: "Smith" });
      });

      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("defaultValues", () => {
    it("returns defaultValues with firstname and lastname params", () => {
      const { Wrapper } = createWrapper();
      const { result } = renderHook(
        () => useEditProfile({ firstname: "John", lastname: "Doe" }),
        { wrapper: Wrapper }
      );

      expect(result.current.defaultValues).toEqual({
        firstname: "John",
        lastname: "Doe",
      });
    });
  });
});
