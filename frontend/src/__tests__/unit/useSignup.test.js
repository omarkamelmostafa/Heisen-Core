// frontend/src/__tests__/unit/useSignup.test.js
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

const mockHooks = vi.hoisted(() => ({
  push: vi.fn(),
  dispatch: vi.fn(),
  consoleError: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockHooks.push }),
}));

vi.mock("next-intl", () => ({
  useTranslations: () => (key) => key,
}));

vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => mockHooks.dispatch,
  useAppSelector: vi.fn(),
}));

vi.mock("@/store/slices/auth/auth-thunks", () => ({
  registerUser: vi.fn(),
}));

vi.mock("@/store/slices/auth/auth-slice", () => ({
  clearError: vi.fn(),
}));

vi.mock("@/store/slices/auth/auth-selectors", () => ({
  selectAuthLoading: vi.fn(),
  selectIsAuthenticated: vi.fn(),
  selectAuthError: vi.fn(),
}));

vi.mock("@/store/slices/user", () => ({
  selectUserProfile: vi.fn(),
}));

vi.mock("@/lib/notifications/notify", () => ({
  NotificationService: {
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { useAppSelector } from "@/hooks/redux";
import { registerUser } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import { NotificationService } from "@/lib/notifications/notify";
import { useSignup } from "@/features/auth/hooks/useSignup";

describe("useSignup Hook - Batch 1", () => {
  const mockUnwrap = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockHooks.dispatch.mockImplementation((action) => action);
    
    useAppSelector.mockReturnValue(null);
    registerUser.mockReturnValue({ unwrap: mockUnwrap });
    
    vi.spyOn(console, "error").mockImplementation(mockHooks.consoleError);
  });

  afterEach(() => {
    console.error.mockRestore();
  });

  it("1) Mount cleanup: dispatches clearError exactly once on mount, no other side effects", () => {
    renderHook(() => useSignup());
    
    expect(clearError).toHaveBeenCalledTimes(1);
    expect(mockHooks.dispatch).toHaveBeenCalledWith(clearError.mock.results[0].value);
    
    expect(registerUser).not.toHaveBeenCalled();
    expect(mockHooks.push).not.toHaveBeenCalled();
  });

  it("2) Happy path with emailSent: true: dispatches registerUser, shows success notify, redirects with sent=true", async () => {
    mockUnwrap.mockResolvedValueOnce({
      data: { emailSent: true }
    });
    
    const { result } = renderHook(() => useSignup());
    const signupData = { email: "walter@heisen.com", password: "pwd" };
    
    await act(async () => {
      await result.current.handleSignup(signupData);
    });

    expect(registerUser).toHaveBeenCalledWith(signupData);
    expect(NotificationService.success).toHaveBeenCalledWith("accountCreated", {
      description: "accountCreatedCheckEmail"
    });
    expect(NotificationService.warn).not.toHaveBeenCalled();
    expect(mockHooks.push).toHaveBeenCalledWith("/verify-email?email=walter%40heisen.com&sent=true");
  });

  it("3) Happy path with emailSent: false: dispatches registerUser, shows warning notify, redirects WITHOUT sent=true", async () => {
    mockUnwrap.mockResolvedValueOnce({
      data: { emailSent: false }
    });
    
    const { result } = renderHook(() => useSignup());
    const signupData = { email: "jesse@heisen.com", password: "pwd" };
    
    await act(async () => {
      await result.current.handleSignup(signupData);
    });

    expect(registerUser).toHaveBeenCalledWith(signupData);
    expect(NotificationService.warn).toHaveBeenCalledWith("accountCreatedEmailFailed", {
      id: "email-dispatch-warning",
      duration: 6000
    });
    expect(NotificationService.success).not.toHaveBeenCalled();
    expect(mockHooks.push).toHaveBeenCalledWith("/verify-email?email=jesse%40heisen.com");
  });

  it("4) API rejection / error handling: handles unwrap rejection, logs error without navigating or notifying", async () => {
    const errorMsg = new Error("API failed");
    mockUnwrap.mockRejectedValueOnce(errorMsg);

    const { result } = renderHook(() => useSignup());
    const signupData = { email: "mike@heisen.com", password: "pwd" };
    
    await act(async () => {
      await result.current.handleSignup(signupData);
    });

    expect(registerUser).toHaveBeenCalledWith(signupData);
    
    // Assert no success/warn notifications
    expect(NotificationService.success).not.toHaveBeenCalled();
    expect(NotificationService.warn).not.toHaveBeenCalled();
    
    // Assert no navigation
    expect(mockHooks.push).not.toHaveBeenCalled();
    
    // Assert console.error matches source behavior
    expect(mockHooks.consoleError).toHaveBeenCalledWith("Signup error:", errorMsg);
  });
});
