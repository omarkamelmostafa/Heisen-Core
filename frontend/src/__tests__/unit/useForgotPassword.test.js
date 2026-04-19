// frontend/src/__tests__/unit/useForgotPassword.test.js
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

const mockHooks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  consoleError: vi.fn(),
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => mockHooks.dispatch,
  useAppSelector: vi.fn(),
}));

import { useAppSelector } from "@/hooks/redux";
import { forgotPassword } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import { selectAuthLoading, selectAuthError } from "@/store/slices/auth/auth-selectors";
import { useForgotPassword } from "@/features/auth/hooks/useForgotPassword";

describe("useForgotPassword Hook - Batch 1", () => {
  const mockUnwrap = vi.fn();
  let dispatchSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a spy on dispatch to track dispatched actions
    dispatchSpy = vi.fn((action) => action);
    mockHooks.dispatch.mockImplementation(dispatchSpy);

    // Default selectors output - assume undefined or false
    useAppSelector.mockImplementation((selector) => {
      if (selector === selectAuthLoading) return false;
      if (selector === selectAuthError) return null;
      return null;
    });

    forgotPassword.mockReturnValue({ unwrap: mockUnwrap });

    // Mock console.error
    vi.spyOn(console, "error").mockImplementation(mockHooks.consoleError);
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("1) Mount cleanup: dispatches clearError on mount exactly and no other side effects", () => {
    renderHook(() => useForgotPassword());

    // Verify clearError action was dispatched
    const clearErrorCalls = dispatchSpy.mock.calls.filter(
      (call) => call[0]?.type === "auth/clearError"
    );
    expect(clearErrorCalls.length).toBe(1);

    expect(forgotPassword).not.toHaveBeenCalled();
  });

  it("2) Happy path submit success: dispatches forgotPassword, resolves unwrap, sets success state", async () => {
    mockUnwrap.mockResolvedValueOnce();

    const { result } = renderHook(() => useForgotPassword());

    const submittedData = { userEmail: "heisenberg@heisen.com" };

    await act(async () => {
      await result.current.handleSubmit(submittedData);
    });

    expect(forgotPassword).toHaveBeenCalledWith(submittedData.userEmail);
    expect(mockUnwrap).toHaveBeenCalledTimes(1);

    // Assert hook state
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.submittedEmail).toBe(submittedData.userEmail);

    // Selectors state logic test
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);

    expect(mockHooks.consoleError).not.toHaveBeenCalled();
  });

  it("3) Retry/reset path: resets isSuccess and submittedEmail, no new request", async () => {
    mockUnwrap.mockResolvedValueOnce();

    const { result } = renderHook(() => useForgotPassword());
    const submittedData = { userEmail: "pinkman@heisen.com" };

    // Trigger success first
    await act(async () => {
      await result.current.handleSubmit(submittedData);
    });

    expect(result.current.isSuccess).toBe(true);
    expect(result.current.submittedEmail).toBe(submittedData.userEmail);
    expect(forgotPassword).toHaveBeenCalledTimes(1);

    // Reset via handleTryAnotherEmail
    act(() => {
      result.current.handleTryAnotherEmail();
    });

    // Verify reset state
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.submittedEmail).toBe("");

    // Verify no side effects
    expect(forgotPassword).toHaveBeenCalledTimes(1);
  });

  it("4) Thunk rejection / error logging: handles unwrap rejection safely, logs error, keeps state unmutated", async () => {
    const errorMsg = new Error("Thunk rejected");
    mockUnwrap.mockRejectedValueOnce(errorMsg);

    const { result } = renderHook(() => useForgotPassword());
    const submittedData = { userEmail: "saul@heisen.com" };

    await act(async () => {
      await result.current.handleSubmit(submittedData);
    });

    expect(forgotPassword).toHaveBeenCalledWith(submittedData.userEmail);
    expect(mockUnwrap).toHaveBeenCalledTimes(1);

    // State remains default
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.submittedEmail).toBe("");

    // Error logged
    expect(mockHooks.consoleError).toHaveBeenCalledWith("Forgot password error:", errorMsg);
  });
});
