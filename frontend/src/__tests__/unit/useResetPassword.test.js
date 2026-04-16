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

vi.mock("@/store/slices/auth/auth-thunks", () => ({
  resetPassword: vi.fn(),
}));

vi.mock("@/store/slices/auth/auth-slice", () => ({
  clearError: vi.fn(),
  setAuthError: vi.fn(),
}));

vi.mock("@/store/slices/auth/auth-selectors", () => ({
  selectAuthLoading: vi.fn(),
  selectAuthError: vi.fn(),
}));

import { useAppSelector } from "@/hooks/redux";
import { resetPassword } from "@/store/slices/auth/auth-thunks";
import { clearError, setAuthError } from "@/store/slices/auth/auth-slice";
import { selectAuthLoading, selectAuthError } from "@/store/slices/auth/auth-selectors";
import { useResetPassword } from "@/features/auth/hooks/useResetPassword";

describe("useResetPassword Hook - Batch 1", () => {
  const mockUnwrap = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockHooks.dispatch.mockImplementation((action) => action);
    
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

    // Mock action creators to return trackable objects
    clearError.mockReturnValue({ type: "auth/clearError" });
    setAuthError.mockImplementation((msg) => ({ type: "auth/setAuthError", payload: msg }));
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("1) Mount cleanup: dispatches clearError on mount exactly and no other side effects", () => {
    renderHook(() => useResetPassword());
    
    expect(clearError).toHaveBeenCalledTimes(1);
    expect(mockHooks.dispatch).toHaveBeenCalledWith({ type: "auth/clearError" });
    
    expect(resetPassword).not.toHaveBeenCalled();
    expect(mockHooks.push).not.toHaveBeenCalled();
  });

  it("2) Missing token on mount: dispatches setAuthError with invalid link message, no reset or redirect", () => {
    mockHooks.searchParamsGet.mockReturnValue(null);
    
    renderHook(() => useResetPassword());
    
    expect(setAuthError).toHaveBeenCalledWith("t_resetLinkInvalid");
    expect(mockHooks.dispatch).toHaveBeenCalledWith({ type: "auth/setAuthError", payload: "t_resetLinkInvalid" });
    
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
