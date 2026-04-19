import { StrictMode, act } from "react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import authReducer from "@/store/slices/auth/auth-slice";
import userReducer from "@/store/slices/user/user-slice";
import { AuthBootstrap } from "@/features/auth/components/auth-bootstrap.jsx";
import { NotificationService } from "@/lib/notifications/notify";

vi.mock("axios", () => {
  const mock = { get: vi.fn(), post: vi.fn(), interceptors: { request: { use: vi.fn() }, response: { use: vi.fn() } } };
  mock.create = vi.fn(() => mock);
  return { default: mock };
});

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

let lastBroadcastChannelInstance;

function renderAuthBootstrap(ui, preloadedState = {}) {
  const store = configureStore({
    reducer: { auth: authReducer, user: userReducer },
    preloadedState,
  });
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

function stubFetchSuccess() {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ data: { accessToken: "new-token" } }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            data: { user: { id: "1", email: "test@example.com" } },
          }),
      }),
  );
}

function mockWindowLocation(pathname = "/app", href = "http://localhost/app") {
  const loc = { pathname, href };
  Object.defineProperty(window, "location", {
    configurable: true,
    writable: true,
    value: loc,
  });
  return loc;
}

describe("AuthBootstrap", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.unstubAllGlobals();

    vi.stubGlobal(
      "BroadcastChannel",
      vi.fn().mockImplementation(() => {
        const instance = {
          onmessage: null,
          postMessage: vi.fn(),
          close: vi.fn(),
        };
        lastBroadcastChannelInstance = instance;
        return instance;
      }),
    );

    mockWindowLocation("/dashboard", "http://localhost/dashboard");
    sessionStorage.clear();
  });

  describe("session restore — success", () => {
    it("calls refresh endpoint using raw fetch on mount", async () => {
      stubFetchSuccess();

      renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `${BASE_URL}/auth/refresh`,
          expect.objectContaining({
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          }),
        );
      });

      expect(global.BroadcastChannel).toHaveBeenCalledWith("auth_channel");
      expect(axios.post).not.toHaveBeenCalled();
      expect(axios.get).not.toHaveBeenCalled();
    });

    it("dispatches setBootstrapComplete(true) after successful restore", async () => {
      stubFetchSuccess();

      const { store } = renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
      );

      await waitFor(() => {
        expect(store.getState().auth.isBootstrapComplete).toBe(true);
      });
    });

    it("dispatches setCredentials with accessToken after restore", async () => {
      stubFetchSuccess();

      const { store } = renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
      );

      await waitFor(() => {
        expect(store.getState().auth.accessToken).toBe("new-token");
        expect(store.getState().auth.isAuthenticated).toBe(true);
      });

      await waitFor(() => {
        expect(store.getState().user.profile).toEqual(
          expect.objectContaining({
            id: "1",
            email: "test@example.com",
          }),
        );
      });
    });

    it("does NOT call refresh endpoint twice (Strict Mode guard)", async () => {
      stubFetchSuccess();

      render(
        <StrictMode>
          <Provider
            store={configureStore({
              reducer: { auth: authReducer, user: userReducer },
            })}
          >
            <AuthBootstrap>
              <div data-testid="bootstrap-child">Child</div>
            </AuthBootstrap>
          </Provider>
        </StrictMode>,
      );

      await waitFor(() => {
        const refreshCalls = vi.mocked(global.fetch).mock.calls.filter((call) =>
          String(call[0]).includes("/auth/refresh"),
        );
        expect(refreshCalls).toHaveLength(1);
      });

      expect(axios.post).not.toHaveBeenCalled();
      expect(axios.get).not.toHaveBeenCalled();
    });
  });

  describe("session restore — failure", () => {
    it("dispatches setBootstrapComplete(true) even when refresh fails", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: () => Promise.resolve({}),
        }),
      );

      const { store } = renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
      );

      await waitFor(() => {
        expect(store.getState().auth.isBootstrapComplete).toBe(true);
      });
    });

    it("does NOT dispatch setCredentials when refresh fails", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: () => Promise.resolve({}),
        }),
      );

      const { store } = renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
      );

      await waitFor(() => {
        expect(store.getState().auth.isBootstrapComplete).toBe(true);
      });

      expect(store.getState().auth.accessToken).toBeNull();
      expect(store.getState().auth.isAuthenticated).toBe(false);
    });

    it("still renders children when refresh fails", async () => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
          ok: false,
          status: 401,
          json: () => Promise.resolve({}),
        }),
      );

      renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
      );

      await waitFor(() => {
        expect(screen.getByTestId("bootstrap-child")).toBeInTheDocument();
      });
    });
  });

  describe("BroadcastChannel — LOGOUT event", () => {
    const loggedInState = {
      auth: {
        accessToken: "tok",
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: true,
      },
      user: {
        profile: { id: "u1", email: "x@y.com" },
        isLoading: false,
        error: null,
      },
    };

    beforeEach(() => {
      stubFetchSuccess();
    });

    it("dispatches clearCredentials on LOGOUT broadcast", async () => {
      const { store } = renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
        loggedInState,
      );

      await waitFor(() => {
        expect(lastBroadcastChannelInstance).toBeTruthy();
      });

      act(() => {
        lastBroadcastChannelInstance.onmessage({ data: "LOGOUT" });
      });

      await waitFor(() => {
        expect(store.getState().auth.isAuthenticated).toBe(false);
        expect(store.getState().auth.accessToken).toBeNull();
      });
    });

    it("shows info toast on LOGOUT broadcast", async () => {
      renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
        loggedInState,
      );

      await waitFor(() => {
        expect(lastBroadcastChannelInstance).toBeTruthy();
      });

      act(() => {
        lastBroadcastChannelInstance.onmessage({ data: "LOGOUT" });
      });

      await waitFor(() => {
        expect(NotificationService.info).toHaveBeenCalled();
      });
    });

    it("navigates to /login after 1500ms delay on LOGOUT", async () => {
      const loc = mockWindowLocation("/other", "http://localhost/other");

      renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
        loggedInState,
      );

      await waitFor(() => {
        expect(lastBroadcastChannelInstance).toBeTruthy();
      });

      vi.useFakeTimers();
      try {
        act(() => {
          lastBroadcastChannelInstance.onmessage({ data: "LOGOUT" });
        });

        expect(loc.href).toBe("http://localhost/other");

        act(() => {
          vi.advanceTimersByTime(1500);
        });

        expect(loc.href).toBe("/login");
      } finally {
        vi.useRealTimers();
      }
    });

    it("skips logout handling when logout_source is 'local'", async () => {
      const loc = mockWindowLocation("/other", "http://localhost/other");
      const { store } = renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
        loggedInState,
      );

      await waitFor(() => {
        expect(lastBroadcastChannelInstance).toBeTruthy();
      });

      sessionStorage.setItem("logout_source", "local");

      vi.useFakeTimers();
      try {
        act(() => {
          lastBroadcastChannelInstance.onmessage({ data: "LOGOUT" });
        });

        expect(store.getState().auth.isAuthenticated).toBe(true);
        expect(NotificationService.info).not.toHaveBeenCalled();

        act(() => {
          vi.advanceTimersByTime(1500);
        });

        expect(loc.href).toBe("http://localhost/other");
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("BroadcastChannel — LOGIN event", () => {
    beforeEach(() => {
      stubFetchSuccess();
    });

    it("reloads to / on LOGIN broadcast from another tab", async () => {
      const loc = mockWindowLocation("/login", "http://localhost/login");

      renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
      );

      await waitFor(() => {
        expect(lastBroadcastChannelInstance).toBeTruthy();
      });

      act(() => {
        lastBroadcastChannelInstance.onmessage({ data: "LOGIN" });
      });

      expect(loc.href).toBe("/");
    });

    it("skips login handling when login_source is 'local'", async () => {
      const loc = mockWindowLocation("/login", "http://localhost/login");

      renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
      );

      await waitFor(() => {
        expect(lastBroadcastChannelInstance).toBeTruthy();
      });

      sessionStorage.setItem("login_source", "local");

      act(() => {
        lastBroadcastChannelInstance.onmessage({ data: "LOGIN" });
      });

      expect(loc.href).toBe("http://localhost/login");
    });
  });

  describe("sessionStorage cleanup on mount", () => {
    beforeEach(() => {
      stubFetchSuccess();
    });

    it("removes logout_source flag on mount", async () => {
      const spy = vi.spyOn(Storage.prototype, "removeItem");
      sessionStorage.setItem("logout_source", "local");

      renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
      );

      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith("logout_source");
      });

      spy.mockRestore();
    });

    it("removes login_source flag on mount", async () => {
      const spy = vi.spyOn(Storage.prototype, "removeItem");
      sessionStorage.setItem("login_source", "local");

      renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
      );

      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith("login_source");
      });

      spy.mockRestore();
    });
  });

  describe("renders children", () => {
    it("renders children regardless of auth state", async () => {
      stubFetchSuccess();

      renderAuthBootstrap(
        <AuthBootstrap>
          <div data-testid="bootstrap-child">Child</div>
        </AuthBootstrap>,
      );

      expect(screen.getByTestId("bootstrap-child")).toBeInTheDocument();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalled();
      });
    });
  });
});
