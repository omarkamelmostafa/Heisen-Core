// frontend/src/__tests__/unit/useVerifyEmail.test.js
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: () => (key) => `toasts.${key}`,
}));

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  useSearchParams: vi.fn(),
}));

const mockDispatch = vi.fn();
const mockSelector = vi.fn();
vi.mock("@/hooks/redux", () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector) => mockSelector(selector),
}));

vi.mock("@/store/slices/auth/auth-thunks", () => ({
  verifyEmail: vi.fn(),
  resendVerification: vi.fn(),
}));

const mockClearErrorAction = { type: "auth/clearError" };
vi.mock("@/store/slices/auth/auth-slice", () => ({
  clearError: vi.fn(() => mockClearErrorAction),
  setAuthError: vi.fn(),
}));

vi.mock("@/lib/notifications/notify", () => ({
  NotificationService: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/store/slices/auth/auth-selectors", () => ({
  selectAuthLoading: vi.fn(),
  selectIsAuthenticated: vi.fn(),
  selectAuthError: vi.fn(),
}));

vi.mock("@/store/slices/user", () => ({
  selectUserEmail: vi.fn(),
}));

import { useVerifyEmail } from "@/features/auth/hooks/useVerifyEmail";
import { useSearchParams } from "next/navigation";

describe("useVerifyEmail - Batch 1", () => {
  const originalReplaceState = window.history.replaceState;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default search params mock
    useSearchParams.mockReturnValue({
      get: vi.fn().mockReturnValue(null),
      toString: vi.fn().mockReturnValue(""),
    });

    // Default selector mock
    mockSelector.mockImplementation((selector) => {
      // By default returning test email to trigger timer init properly
      if (selector.name === "selectUserEmail") return "test@example.com";
      return null;
    });

    window.history.replaceState = vi.fn();
  });

  afterEach(() => {
    window.history.replaceState = originalReplaceState;
  });

  it("1) Mount cleanup: dispatches clearError on mount", () => {
    renderHook(() => useVerifyEmail());
    expect(mockDispatch).toHaveBeenCalledWith(mockClearErrorAction);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("2) Timer initialization from `sent=true`", () => {
    useSearchParams.mockReturnValue({
      get: vi.fn((key) => {
        if (key === "sent") return "true";
        if (key === "email") return "test@example.com";
        return null;
      }),
      toString: vi.fn().mockReturnValue("sent=true"),
    });

    const { result } = renderHook(() => useVerifyEmail());

    expect(result.current.timeLeft).toBe(300);
    expect(result.current.canResend).toBe(false);
  });

  it("3) URL cleanup via `replaceState`", () => {
    useSearchParams.mockReturnValue({
      get: vi.fn((key) => {
        if (key === "sent") return "true";
        if (key === "email") return "test@example.com";
        if (key === "other") return "value";
        return null;
      }),
      toString: vi.fn().mockReturnValue("sent=true&other=value"),
    });

    renderHook(() => useVerifyEmail());

    expect(window.history.replaceState).toHaveBeenCalledWith(
      null,
      "",
      "/verify-email?other=value"
    );
  });

  it("4) Countdown decrements and completion unlocks resend", () => {
    vi.useFakeTimers();

    useSearchParams.mockReturnValue({
      get: vi.fn((key) => {
        if (key === "sent") return "true";
        if (key === "email") return "test@example.com";
        return null;
      }),
      toString: vi.fn().mockReturnValue("sent=true"),
    });

    const { result } = renderHook(() => useVerifyEmail());

    expect(result.current.timeLeft).toBe(300);
    expect(result.current.canResend).toBe(false);

    // Advance by 1 second
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.timeLeft).toBe(299);

    // Advance remaining 299 seconds
    for (let i = 0; i < 299; i++) {
      act(() => {
        vi.advanceTimersByTime(1000);
      });
    }

    expect(result.current.timeLeft).toBe(0);
    expect(result.current.canResend).toBe(true);

    vi.useRealTimers();
  });

  it("5) formatTime utility formats seconds correctly", () => {
    const { result } = renderHook(() => useVerifyEmail());
    
    expect(result.current.formatTime(305)).toBe("5:05");
    expect(result.current.formatTime(59)).toBe("0:59");
    expect(result.current.formatTime(0)).toBe("0:00");
  });
});
