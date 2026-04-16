// frontend/src/__tests__/unit/useLogin.test.js
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Hoisted mocks for direct assertions safely
const mockHooks = vi.hoisted(() => ({
  push: vi.fn(),
  getSearchParam: vi.fn(),
  dispatch: vi.fn(),
  postMessage: vi.fn(),
  close: vi.fn(),
  setItem: vi.fn(),
}));

// Mock Next.js Navigation
vi.mock("next/navigation", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useRouter: () => ({
      push: mockHooks.push,
    }),
    useSearchParams: () => ({
      get: mockHooks.getSearchParam,
    }),
  };
});

// Mock Redux Hooks
vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => mockHooks.dispatch,
  useAppSelector: vi.fn(),
}));

// Mock Auth Thunks & Slice
vi.mock("@/store/slices/auth/auth-thunks", () => ({
  loginUser: vi.fn(),
  verify2fa: vi.fn(),
  resend2fa: vi.fn()
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

// Mock NotificationService
vi.mock("@/lib/notifications/notify", () => ({
  NotificationService: {
    success: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { useAppSelector } from "@/hooks/redux";
import { loginUser } from "@/store/slices/auth/auth-thunks";
import { clearError } from "@/store/slices/auth/auth-slice";
import { selectIsAuthenticated } from "@/store/slices/auth/auth-selectors";
import { NotificationService } from "@/lib/notifications/notify";
import { useLogin } from "@/features/auth/hooks/useLogin";

describe("useLogin Hook - Batch 1", () => {
  const mockUnwrap = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Fix dispatch mock to return the action
    mockHooks.dispatch.mockImplementation((action) => action);
    
    // Default search param mock
    mockHooks.getSearchParam.mockImplementation((param) => {
      if (param === "returnTo") return null; // Default falsy handles `/` fallback
      return null;
    });

    useAppSelector.mockImplementation((selector) => {
      if (selector === selectIsAuthenticated) return false;
      return null;
    });

    // Default thunk return wrapper
    loginUser.mockReturnValue({ unwrap: mockUnwrap });
    
    // Stub global BroadcastChannel
    global.BroadcastChannel = vi.fn(() => ({
      postMessage: mockHooks.postMessage,
      close: mockHooks.close,
    }));
    
    // Spy on sessionStorage if available (we define it to ensure no window errors)
    Object.defineProperty(window, "sessionStorage", {
      value: { setItem: mockHooks.setItem },
      writable: true,
    });
  });

  afterEach(() => {
    delete global.BroadcastChannel;
  });

  it("1) Mount/Unmount cleanup: dispatches clearError exactly once on mount, once on unmount, no other side effects", () => {
    const { unmount } = renderHook(() => useLogin());
    
    // Check mount cleanup
    expect(clearError).toHaveBeenCalledTimes(1);
    expect(mockHooks.dispatch).toHaveBeenCalledWith(clearError.mock.results[0].value);
    
    // Check side effects
    expect(loginUser).not.toHaveBeenCalled();
    expect(mockHooks.push).not.toHaveBeenCalled();
    
    // Unmount triggers second cleanup
    unmount();
    expect(clearError).toHaveBeenCalledTimes(2);
  });

  it("2) Happy path login success: calls API, sets storage/channel, navigates to default, shows toast", async () => {
    mockUnwrap.mockResolvedValueOnce({
      user: { firstName: "Walter" },
      data: { requiresTwoFactor: false },
    });
    
    const { result } = renderHook(() => useLogin());
    
    const loginData = { email: "walter@heisen.com", password: "pwd" };
    
    await act(async () => {
      await result.current.handleLogin(loginData);
    });

    // Validates that login action was dispatched with data
    expect(loginUser).toHaveBeenCalledWith(loginData);
    
    // Success notification
    expect(NotificationService.success).toHaveBeenCalledWith("welcomeBack");
    
    // Broadcast message
    expect(global.BroadcastChannel).toHaveBeenCalledWith("auth_channel");
    expect(mockHooks.postMessage).toHaveBeenCalledWith("LOGIN");
    expect(mockHooks.close).toHaveBeenCalledTimes(1);
    
    // sessionStorage
    expect(window.sessionStorage.setItem).toHaveBeenCalledWith("login_source", "local");
    
    // No error notification
    expect(NotificationService.warn).not.toHaveBeenCalled();
    expect(NotificationService.error).not.toHaveBeenCalled();
  });

  it("3) Account not verified redirect: handles ACCOUNT_NOT_VERIFIED error, redirects with email", async () => {
    const errorWithCode = { errorCode: "ACCOUNT_NOT_VERIFIED" };
    mockUnwrap.mockRejectedValueOnce(errorWithCode);

    const { result } = renderHook(() => useLogin());
    const loginData = { email: "jesse@heisen.com", password: "pwd" };
    
    // Capture the call count before hook handles error clear (1 from mount)
    const clearErrorInitialCount = clearError.mock.calls.length;
    
    await act(async () => {
      await result.current.handleLogin(loginData);
    });

    // Warn notification
    expect(NotificationService.warn).toHaveBeenCalledWith("verifyEmailBeforeLogin");
    
    // Additional clearError should have been dispatched inside handleLogin catch block
    expect(clearError).toHaveBeenCalledTimes(clearErrorInitialCount + 1);
    
    // Router navigation asserts email query param 
    expect(mockHooks.push).toHaveBeenCalledWith("/verify-email?email=jesse%40heisen.com");
    
    // No success calls
    expect(NotificationService.success).not.toHaveBeenCalled();
  });

  it("4) returnTo query param honored on success: navigates to returnTo on auth state change", () => {
    // 1. Hook reads returnTo
    mockHooks.getSearchParam.mockImplementation((param) => {
      if (param === "returnTo") return "/dashboard";
      return null;
    });

    // 2. Simulate isAuthenticated transitioning to true
    useAppSelector.mockImplementation((selector) => {
      if (selector === selectIsAuthenticated) return true;
      return null;
    });

    renderHook(() => useLogin());

    // isAuthenticated is true, useEffect pushes to `returnTo` instead of default inside mount
    expect(mockHooks.push).toHaveBeenCalledWith("/dashboard");
    expect(mockHooks.push).not.toHaveBeenCalledWith("/");
  });
});
