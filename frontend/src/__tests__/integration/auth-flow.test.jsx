// frontend/src/__tests__/integration/auth-flow.test.jsx
import { act } from "react";
import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/auth/auth-slice";
import userReducer from "@/store/slices/user/user-slice";
import { AuthBootstrap } from "@/features/auth/components/auth-bootstrap.jsx";
import { ProtectedGuard } from "@/features/auth/components/guards/protected-guard.jsx";
import { PublicGuard } from "@/features/auth/components/guards/public-guard.jsx";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
    toString: vi.fn().mockReturnValue(""),
  }),
}));

vi.mock("@/components/shared/app-splash-screen", () => ({
  AppSplashScreen: ({ message }) => (
    <div data-testid="splash-screen">{message}</div>
  ),
}));

vi.mock("@/lib/notifications/notify", () => ({
  NotificationService: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    success: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
    promise: vi.fn(),
  },
}));

const API_ROOT = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
const VERSION = process.env.NEXT_PUBLIC_API_VERSION || "1";
const BASE_URL = `${API_ROOT}/api/v${VERSION}`;

const defaultAuth = {
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isVerifying: false,
  sessionExpired: false,
  isBootstrapComplete: false,
};

const defaultUser = {
  profile: null,
  isLoading: false,
  error: null,
};

let capturedChannel = null;

function mockWindowLocation(pathname = "/app", href = "http://localhost/app") {
  const loc = { pathname, href };
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: loc,
  });
  return loc;
}

function createTestStore(preloadedState = {}) {
  return configureStore({
    reducer: { auth: authReducer, user: userReducer },
    preloadedState: {
      auth: { ...defaultAuth, ...preloadedState.auth },
      user: { ...defaultUser, ...preloadedState.user },
    },
  });
}

function renderWithStore(ui, store) {
  return render(<Provider store={store}>{ui}</Provider>);
}

function stubFetchSuccess(accessToken = "test-token") {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: { accessToken },
          }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: {
              user: {
                id: "1",
                email: "user@example.com",
                firstname: "John",
                lastname: "Doe",
              },
            },
          }),
      }),
  );
}

describe("Auth flow integration (AuthBootstrap + guards)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();
    capturedChannel = null;
    vi.stubGlobal(
      "BroadcastChannel",
      vi.fn().mockImplementation(() => {
        capturedChannel = { onmessage: null, close: vi.fn() };
        return capturedChannel;
      }),
    );
    sessionStorage.clear();
    mockWindowLocation("/dashboard", "http://localhost/dashboard");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("Scenario 1: bootstrap succeeds → ProtectedGuard shows dashboard; no redirect", async () => {
    stubFetchSuccess("test-token");
    const store = createTestStore();

    renderWithStore(
      <AuthBootstrap>
        <ProtectedGuard>
          <div data-testid="dashboard">Dashboard</div>
        </ProtectedGuard>
      </AuthBootstrap>,
      store,
    );

    await waitFor(() => {
      expect(screen.getByTestId("dashboard")).toBeInTheDocument();
    });

    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(true);
    expect(state.auth.isBootstrapComplete).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("Scenario 2: bootstrap fails → ProtectedGuard redirects to /login", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const store = createTestStore();

    renderWithStore(
      <AuthBootstrap>
        <ProtectedGuard>
          <div data-testid="dashboard">Dashboard</div>
        </ProtectedGuard>
      </AuthBootstrap>,
      store,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });

    const state = store.getState();
    expect(state.auth.isAuthenticated).toBe(false);
    expect(state.auth.isBootstrapComplete).toBe(true);
  });

  it("Scenario 3: bootstrap fails → PublicGuard shows login form; no redirect", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false }));
    const store = createTestStore();

    renderWithStore(
      <AuthBootstrap>
        <PublicGuard>
          <div data-testid="login-form">Login</div>
        </PublicGuard>
      </AuthBootstrap>,
      store,
    );

    await waitFor(() => {
      expect(screen.getByTestId("login-form")).toBeInTheDocument();
    });

    expect(mockPush).not.toHaveBeenCalled();
  });

  it("Scenario 4: bootstrap succeeds → PublicGuard redirects to /; login form hidden", async () => {
    stubFetchSuccess();
    const store = createTestStore();

    renderWithStore(
      <AuthBootstrap>
        <PublicGuard>
          <div data-testid="login-form">Login</div>
        </PublicGuard>
      </AuthBootstrap>,
      store,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });

    expect(screen.queryByTestId("login-form")).not.toBeInTheDocument();
  });

  it("Scenario 5: LOGOUT broadcast clears auth; login navigation (router + delayed location)", async () => {
    stubFetchSuccess();
    const loc = mockWindowLocation("/app", "http://localhost/app");
    const store = createTestStore({
      auth: {
        accessToken: "tok",
        isAuthenticated: true,
        isBootstrapComplete: true,
        isLoading: false,
        sessionExpired: false,
        isVerifying: false,
        error: null,
      },
      user: {
        profile: { id: "u1", email: "x@y.com" },
        isLoading: false,
        error: null,
      },
    });

    renderWithStore(
      <AuthBootstrap>
        <ProtectedGuard>
          <div data-testid="dashboard">Dashboard</div>
        </ProtectedGuard>
      </AuthBootstrap>,
      store,
    );

    await waitFor(() => {
      expect(capturedChannel).toBeTruthy();
    });

    vi.useFakeTimers();
    try {
      act(() => {
        capturedChannel.onmessage({ data: "LOGOUT" });
      });

      expect(store.getState().auth.isAuthenticated).toBe(false);
      expect(mockPush).toHaveBeenCalledWith("/login");

      act(() => {
        vi.advanceTimersByTime(1500);
      });

      expect(loc.href).toBe("/login");
    } finally {
      vi.useRealTimers();
    }
  });

  it("Scenario 6: preloaded authenticated state → ProtectedGuard shows children immediately; no redirect", () => {
    const store = createTestStore({
      auth: {
        accessToken: "existing-token",
        isAuthenticated: true,
        isBootstrapComplete: true,
        isLoading: false,
        sessionExpired: false,
        isVerifying: false,
        error: null,
      },
      user: {
        profile: { id: "1", email: "user@example.com" },
        isLoading: false,
        error: null,
      },
    });

    renderWithStore(
      <ProtectedGuard>
        <div data-testid="dashboard">Dashboard</div>
      </ProtectedGuard>,
      store,
    );

    expect(screen.getByTestId("dashboard")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("Scenario 7: session expired + not authenticated → ProtectedGuard redirects to /login", async () => {
    const store = createTestStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isBootstrapComplete: true,
        isLoading: false,
        sessionExpired: true,
        isVerifying: false,
        error: null,
      },
      user: { profile: null, isLoading: false, error: null },
    });

    renderWithStore(
      <ProtectedGuard>
        <div data-testid="dashboard">Dashboard</div>
      </ProtectedGuard>,
      store,
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("Scenario 8: Rule F3 — isLoading true still shows children; splash hidden when authenticated", () => {
    const store = createTestStore({
      auth: {
        accessToken: "token",
        isAuthenticated: true,
        isBootstrapComplete: true,
        isLoading: true,
        sessionExpired: false,
        isVerifying: false,
        error: null,
      },
      user: {
        profile: { id: "1" },
        isLoading: false,
        error: null,
      },
    });

    renderWithStore(
      <ProtectedGuard>
        <div data-testid="dashboard">Dashboard</div>
      </ProtectedGuard>,
      store,
    );

    expect(screen.getByTestId("dashboard")).toBeInTheDocument();
    expect(screen.queryByTestId("splash-screen")).not.toBeInTheDocument();
  });
});
