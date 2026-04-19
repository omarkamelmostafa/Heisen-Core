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

// ─── Mock thunk modules to prevent real thunk evaluation in slice tests ─────
// Mock using same path strings as the test files to override their incomplete mocks
vi.mock("@/store/slices/auth/auth-thunks", () => ({
  loginUser: Object.assign(vi.fn(), {
    pending: { type: "auth/login/pending", match: (a) => a.type === "auth/login/pending" },
    fulfilled: { type: "auth/login/fulfilled", match: (a) => a.type === "auth/login/fulfilled" },
    rejected: { type: "auth/login/rejected", match: (a) => a.type === "auth/login/rejected" },
    typePrefix: "auth/login",
  }),
  registerUser: Object.assign(vi.fn(), {
    pending: { type: "auth/register/pending", match: (a) => a.type === "auth/register/pending" },
    fulfilled: { type: "auth/register/fulfilled", match: (a) => a.type === "auth/register/fulfilled" },
    rejected: { type: "auth/register/rejected", match: (a) => a.type === "auth/register/rejected" },
    typePrefix: "auth/register",
  }),
  logoutUser: Object.assign(vi.fn(), {
    pending: { type: "auth/logout/pending", match: (a) => a.type === "auth/logout/pending" },
    fulfilled: { type: "auth/logout/fulfilled", match: (a) => a.type === "auth/logout/fulfilled" },
    rejected: { type: "auth/logout/rejected", match: (a) => a.type === "auth/logout/rejected" },
    typePrefix: "auth/logout",
  }),
  logoutAllDevices: Object.assign(vi.fn(), {
    pending: { type: "auth/logoutAll/pending", match: (a) => a.type === "auth/logoutAll/pending" },
    fulfilled: { type: "auth/logoutAll/fulfilled", match: (a) => a.type === "auth/logoutAll/fulfilled" },
    rejected: { type: "auth/logoutAll/rejected", match: (a) => a.type === "auth/logoutAll/rejected" },
    typePrefix: "auth/logoutAll",
  }),
  bootstrapAuth: Object.assign(vi.fn(), {
    pending: { type: "auth/bootstrap/pending", match: (a) => a.type === "auth/bootstrap/pending" },
    fulfilled: { type: "auth/bootstrap/fulfilled", match: (a) => a.type === "auth/bootstrap/fulfilled" },
    rejected: { type: "auth/bootstrap/rejected", match: (a) => a.type === "auth/bootstrap/rejected" },
    typePrefix: "auth/bootstrap",
  }),
  verifyEmail: Object.assign(vi.fn(), {
    pending: { type: "auth/verifyEmail/pending", match: (a) => a.type === "auth/verifyEmail/pending" },
    fulfilled: { type: "auth/verifyEmail/fulfilled", match: (a) => a.type === "auth/verifyEmail/fulfilled" },
    rejected: { type: "auth/verifyEmail/rejected", match: (a) => a.type === "auth/verifyEmail/rejected" },
    typePrefix: "auth/verifyEmail",
  }),
  resendVerification: Object.assign(vi.fn(), {
    pending: { type: "auth/resendVerification/pending", match: (a) => a.type === "auth/resendVerification/pending" },
    fulfilled: { type: "auth/resendVerification/fulfilled", match: (a) => a.type === "auth/resendVerification/fulfilled" },
    rejected: { type: "auth/resendVerification/rejected", match: (a) => a.type === "auth/resendVerification/rejected" },
    typePrefix: "auth/resendVerification",
  }),
  forgotPassword: Object.assign(vi.fn(), {
    pending: { type: "auth/forgotPassword/pending", match: (a) => a.type === "auth/forgotPassword/pending" },
    fulfilled: { type: "auth/forgotPassword/fulfilled", match: (a) => a.type === "auth/forgotPassword/fulfilled" },
    rejected: { type: "auth/forgotPassword/rejected", match: (a) => a.type === "auth/forgotPassword/rejected" },
    typePrefix: "auth/forgotPassword",
  }),
  resetPassword: Object.assign(vi.fn(), {
    pending: { type: "auth/resetPassword/pending", match: (a) => a.type === "auth/resetPassword/pending" },
    fulfilled: { type: "auth/resetPassword/fulfilled", match: (a) => a.type === "auth/resetPassword/fulfilled" },
    rejected: { type: "auth/resetPassword/rejected", match: (a) => a.type === "auth/resetPassword/rejected" },
    typePrefix: "auth/resetPassword",
  }),
  verify2fa: Object.assign(vi.fn(), {
    pending: { type: "auth/verify2fa/pending", match: (a) => a.type === "auth/verify2fa/pending" },
    fulfilled: { type: "auth/verify2fa/fulfilled", match: (a) => a.type === "auth/verify2fa/fulfilled" },
    rejected: { type: "auth/verify2fa/rejected", match: (a) => a.type === "auth/verify2fa/rejected" },
    typePrefix: "auth/verify2fa",
  }),
  resend2fa: Object.assign(vi.fn(), {
    pending: { type: "auth/resend2fa/pending", match: (a) => a.type === "auth/resend2fa/pending" },
    fulfilled: { type: "auth/resend2fa/fulfilled", match: (a) => a.type === "auth/resend2fa/fulfilled" },
    rejected: { type: "auth/resend2fa/rejected", match: (a) => a.type === "auth/resend2fa/rejected" },
    typePrefix: "auth/resend2fa",
  }),
}));

vi.mock("@/store/slices/user/user-thunks", () => ({
  fetchUserProfile: Object.assign(vi.fn(), {
    pending: { type: "user/fetchProfile/pending", match: (a) => a.type === "user/fetchProfile/pending" },
    fulfilled: { type: "user/fetchProfile/fulfilled", match: (a) => a.type === "user/fetchProfile/fulfilled" },
    rejected: { type: "user/fetchProfile/rejected", match: (a) => a.type === "user/fetchProfile/rejected" },
    typePrefix: "user/fetchProfile",
  }),
  updateProfile: Object.assign(vi.fn(), {
    pending: { type: "user/updateProfile/pending", match: (a) => a.type === "user/updateProfile/pending" },
    fulfilled: { type: "user/updateProfile/fulfilled", match: (a) => a.type === "user/updateProfile/fulfilled" },
    rejected: { type: "user/updateProfile/rejected", match: (a) => a.type === "user/updateProfile/rejected" },
    typePrefix: "user/updateProfile",
  }),
  changePassword: Object.assign(vi.fn(), {
    pending: { type: "user/changePassword/pending", match: (a) => a.type === "user/changePassword/pending" },
    fulfilled: { type: "user/changePassword/fulfilled", match: (a) => a.type === "user/changePassword/fulfilled" },
    rejected: { type: "user/changePassword/rejected", match: (a) => a.type === "user/changePassword/rejected" },
    typePrefix: "user/changePassword",
  }),
  requestEmailChange: Object.assign(vi.fn(), {
    pending: { type: "user/requestEmailChange/pending", match: (a) => a.type === "user/requestEmailChange/pending" },
    fulfilled: { type: "user/requestEmailChange/fulfilled", match: (a) => a.type === "user/requestEmailChange/fulfilled" },
    rejected: { type: "user/requestEmailChange/rejected", match: (a) => a.type === "user/requestEmailChange/rejected" },
    typePrefix: "user/requestEmailChange",
  }),
  toggle2fa: Object.assign(vi.fn(), {
    pending: { type: "user/toggle2fa/pending", match: (a) => a.type === "user/toggle2fa/pending" },
    fulfilled: { type: "user/toggle2fa/fulfilled", match: (a) => a.type === "user/toggle2fa/fulfilled" },
    rejected: { type: "user/toggle2fa/rejected", match: (a) => a.type === "user/toggle2fa/rejected" },
    typePrefix: "user/toggle2fa",
  }),
  uploadAvatar: Object.assign(vi.fn(), {
    pending: { type: "user/uploadAvatar/pending", match: (a) => a.type === "user/uploadAvatar/pending" },
    fulfilled: { type: "user/uploadAvatar/fulfilled", match: (a) => a.type === "user/uploadAvatar/fulfilled" },
    rejected: { type: "user/uploadAvatar/rejected", match: (a) => a.type === "user/uploadAvatar/rejected" },
    typePrefix: "user/uploadAvatar",
  }),
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
