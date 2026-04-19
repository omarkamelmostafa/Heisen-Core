import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import authReducer from "@/store/slices/auth/auth-slice";
import userReducer from "@/store/slices/user/user-slice";
import { ProtectedGuard } from "@/features/auth/components/guards/protected-guard.jsx";

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
  }),
}));

vi.mock("@/components/shared/app-splash-screen", () => ({
  AppSplashScreen: ({ message }) => <div data-testid="splash">{message}</div>,
}));

function renderWithStore(ui, preloadedState = {}) {
  const store = configureStore({
    reducer: { auth: authReducer, user: userReducer },
    preloadedState,
  });
  return { store, ...render(<Provider store={store}>{ui}</Provider>) };
}

const authBootstrapIncomplete = {
  auth: {
    isBootstrapComplete: false,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    sessionExpired: false,
    isVerifying: false,
    accessToken: null,
  },
};

const authAuthenticated = {
  auth: {
    isBootstrapComplete: true,
    isAuthenticated: true,
    isLoading: false,
    error: null,
    sessionExpired: false,
    isVerifying: false,
    accessToken: "token",
  },
};

const authNotAuthenticated = {
  auth: {
    isBootstrapComplete: true,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    sessionExpired: false,
    isVerifying: false,
    accessToken: null,
  },
};

const authF3LoadingButAuth = {
  auth: {
    isBootstrapComplete: true,
    isAuthenticated: true,
    isLoading: true,
    error: null,
    sessionExpired: false,
    isVerifying: false,
    accessToken: "token",
  },
};

describe("ProtectedGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("during bootstrap (isBootstrapComplete: false)", () => {
    it("renders AppSplashScreen while bootstrap is incomplete", () => {
      renderWithStore(
        <ProtectedGuard>
          <div data-testid="protected-content">Protected</div>
        </ProtectedGuard>,
        authBootstrapIncomplete,
      );
      expect(screen.getByTestId("splash")).toBeInTheDocument();
    });

    it("does NOT render children while bootstrap is incomplete", () => {
      renderWithStore(
        <ProtectedGuard>
          <div data-testid="protected-content">Protected</div>
        </ProtectedGuard>,
        authBootstrapIncomplete,
      );
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("does NOT redirect while bootstrap is incomplete", () => {
      renderWithStore(
        <ProtectedGuard>
          <div data-testid="protected-content">Protected</div>
        </ProtectedGuard>,
        authBootstrapIncomplete,
      );
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("after bootstrap — authenticated", () => {
    it("renders children when authenticated and bootstrap complete", () => {
      renderWithStore(
        <ProtectedGuard>
          <div data-testid="protected-content">Protected</div>
        </ProtectedGuard>,
        authAuthenticated,
      );
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
    });

    it("does NOT redirect when authenticated", () => {
      renderWithStore(
        <ProtectedGuard>
          <div data-testid="protected-content">Protected</div>
        </ProtectedGuard>,
        authAuthenticated,
      );
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("does NOT render splash screen when authenticated", () => {
      renderWithStore(
        <ProtectedGuard>
          <div data-testid="protected-content">Protected</div>
        </ProtectedGuard>,
        authAuthenticated,
      );
      expect(screen.queryByTestId("splash")).not.toBeInTheDocument();
    });
  });

  describe("after bootstrap — not authenticated", () => {
    it("redirects to /login when not authenticated after bootstrap", async () => {
      renderWithStore(
        <ProtectedGuard>
          <div data-testid="protected-content">Protected</div>
        </ProtectedGuard>,
        authNotAuthenticated,
      );
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
    });

    it("renders null (not children) when not authenticated", async () => {
      renderWithStore(
        <ProtectedGuard>
          <div data-testid="protected-content">Protected</div>
        </ProtectedGuard>,
        authNotAuthenticated,
      );
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    });

    it("does NOT render splash screen when not authenticated", async () => {
      renderWithStore(
        <ProtectedGuard>
          <div data-testid="protected-content">Protected</div>
        </ProtectedGuard>,
        authNotAuthenticated,
      );
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/login");
      });
      expect(screen.queryByTestId("splash")).not.toBeInTheDocument();
    });
  });

  describe("Rule F3 compliance", () => {
    it("does NOT block rendering based on isLoading state", () => {
      renderWithStore(
        <ProtectedGuard>
          <div data-testid="protected-content">Protected</div>
        </ProtectedGuard>,
        authF3LoadingButAuth,
      );
      expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      expect(screen.queryByTestId("splash")).not.toBeInTheDocument();
    });
  });
});
