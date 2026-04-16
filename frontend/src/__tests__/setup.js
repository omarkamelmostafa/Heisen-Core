// frontend/src/__tests__/setup.js
import "@testing-library/jest-dom";
import { vi } from "vitest";

// ─── Mock services that use @/ aliases (must be before any imports that use them)
vi.mock("@/services/domain/auth-service", () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    logoutAll: vi.fn(),
    verifyEmail: vi.fn(),
    resendVerification: vi.fn(),
    forgotPassword: vi.fn(),
    resetPassword: vi.fn(),
    verify2FA: vi.fn(),
    resend2FA: vi.fn(),
    refreshAccessToken: vi.fn(),
    checkAuthStatus: vi.fn(),
  },
}));

vi.mock("@/services/auth/token-manager", () => ({
  tokenManager: {
    clearSession: vi.fn(),
    setSession: vi.fn(),
    getToken: vi.fn(),
  },
}));

vi.mock("@/services/api/refresh-queue", () => ({
  refreshQueue: {
    clearQueue: vi.fn(),
    addRequest: vi.fn(),
    processQueue: vi.fn(),
  },
}));

vi.mock("@/store/utils/thunk-utils", () => ({
  createAppThunk: (type, fn, errorMessage) => {
    const thunk = vi.fn(fn);
    thunk.pending = { type: `${type}/pending`, match: (a) => a.type === `${type}/pending` };
    thunk.fulfilled = { type: `${type}/fulfilled`, match: (a) => a.type === `${type}/fulfilled` };
    thunk.rejected = { type: `${type}/rejected`, match: (a) => a.type === `${type}/rejected` };
    thunk.typePrefix = type;
    return thunk;
  },
}));

// ─── Mock next/navigation ───────────────────────────────────────────────────
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

// ─── Mock next-intl ─────────────────────────────────────────────────────────
vi.mock("next-intl", () => ({
  useTranslations: () => (key) => key,
  useLocale: () => "en",
}));

// ─── Mock next-themes ───────────────────────────────────────────────────────
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
  ThemeProvider: ({ children }) => children,
}));

// ─── Silence known noisy React warnings ─────────────────────────────────────
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = (...args) => {
    const msg = args[0]?.toString() ?? "";
    if (
      msg.includes("Warning: ReactDOM.render") ||
      msg.includes("act(") ||
      msg.includes("Not implemented: navigation")
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterEach(() => {
  console.error = originalConsoleError;
});
