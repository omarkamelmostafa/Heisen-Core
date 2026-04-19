// frontend/src/__tests__/unit/useResetPassword.test.js
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

const mockHooks = vi.hoisted(() => ({
  dispatch: vi.fn(),
  consoleError: vi.fn(),
  push: vi.fn(),
  searchParamsGet: vi.fn(),
  t: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockHooks.push }),
  useSearchParams: () => ({ get: mockHooks.searchParamsGet }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => mockHooks.t,
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => mockHooks.dispatch,
  useAppSelector: vi.fn(),
}));

import { useAppSelector } from "@/hooks/redux";
import { resetPassword } from "@/store/slices/auth/auth-thunks";
import { clearError, setAuthError } from "@/store/slices/auth/auth-slice";
import { selectAuthLoading, selectAuthError } from "@/store/slices/auth/auth-selectors";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";

describe("useResetPassword Hook - Batch 1", () => {
  const mockUnwrap = vi.fn();
  let dispatchSpy;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create a spy on dispatch to track dispatched actions
    dispatchSpy = vi.fn((action) => action);
    mockHooks.dispatch.mockImplementation(dispatchSpy);

    useAppSelector.mockImplementation((selector) => {
      if (selector === selectAuthLoading) return false;
      if (selector === selectAuthError) return null;
      return null;
    });

    resetPassword.mockReturnValue({ unwrap: mockUnwrap });
    vi.spyOn(console, "error").mockImplementation(mockHooks.consoleError);

    // Default valid token so mount cleanup and submit success paths work
    mockHooks.searchParamsGet.mockImplementation((param) => param === "token" ? "valid-test-token" : null);
    mockHooks.t.mockImplementation((key) => `t_${key}`);
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("1) Mount cleanup: dispatches clearError on mount exactly and no other side effects", () => {
    renderHook(() => useResetPassword());

    // Verify clearError action was dispatched
    const clearErrorCalls = dispatchSpy.mock.calls.filter(
      (call) => call[0]?.type === "auth/clearError"
    );
    expect(clearErrorCalls.length).toBe(1);

    expect(resetPassword).not.toHaveBeenCalled();
    expect(mockHooks.push).not.toHaveBeenCalled();
  });

  it("2) Missing token on mount: dispatches setAuthError with invalid link message, no reset or redirect", () => {
    mockHooks.searchParamsGet.mockReturnValue(null);

    renderHook(() => useResetPassword());

    // Verify setAuthError action was dispatched with correct payload
    const setAuthErrorCalls = dispatchSpy.mock.calls.filter(
      (call) => call[0]?.type === "auth/setAuthError"
    );
    expect(setAuthErrorCalls.length).toBe(1);
    expect(setAuthErrorCalls[0][0].payload).toBe("t_resetLinkInvalid");

    expect(resetPassword).not.toHaveBeenCalled();
    expect(mockHooks.push).not.toHaveBeenCalled();
  });

  it("3) Happy path success redirect: dispatches resetPassword, resolves unwrap, redirects to login", async () => {
    mockUnwrap.mockResolvedValueOnce();

    const { result } = renderHook(() => useResetPassword());
    const submittedData = { password: "newSecurePassword123" };

    await act(async () => {
      await result.current.handleSubmit(submittedData);
    });

    expect(resetPassword).toHaveBeenCalledWith({
      token: "valid-test-token",
      password: submittedData.password,
    });
    expect(mockUnwrap).toHaveBeenCalledTimes(1);

    expect(mockHooks.push).toHaveBeenCalledWith("/login?reset=true");

    // Assert hook state matches source reality (isSuccess remains false statically)
    expect(result.current.isSuccess).toBe(false);

    expect(mockHooks.consoleError).not.toHaveBeenCalled();
  });

  it("4) Thunk rejection / error logging: handles unwrap rejection safely, logs error, no redirect", async () => {
    const errorMsg = new Error("Thunk rejected");
    mockUnwrap.mockRejectedValueOnce(errorMsg);

    const { result } = renderHook(() => useResetPassword());
    const submittedData = { password: "anotherPassword" };

    await act(async () => {
      await result.current.handleSubmit(submittedData);
    });

    expect(resetPassword).toHaveBeenCalledWith({
      token: "valid-test-token",
      password: submittedData.password,
    });
    expect(mockUnwrap).toHaveBeenCalledTimes(1);

    expect(mockHooks.consoleError).toHaveBeenCalledWith("Reset password error:", errorMsg);

    // No redirect on catch
    expect(mockHooks.push).not.toHaveBeenCalled();

    // Hook state realities 
    expect(result.current.isSuccess).toBe(false);
  });
});
