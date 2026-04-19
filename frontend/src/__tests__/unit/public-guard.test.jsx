import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import authReducer from "@/store/slices/auth/auth-slice";
import userReducer from "@/store/slices/user/user-slice";
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

const authF3LoadingNotBlocking = {
  auth: {
    isBootstrapComplete: true,
    isAuthenticated: false,
    isLoading: true,
    error: null,
    sessionExpired: false,
    isVerifying: false,
    accessToken: null,
  },
};

describe("PublicGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("during bootstrap (isBootstrapComplete: false)", () => {
    it("renders AppSplashScreen while bootstrap is incomplete", () => {
      renderWithStore(
        <PublicGuard>
          <div data-testid="public-content">Public</div>
        </PublicGuard>,
        authBootstrapIncomplete,
      );
      expect(screen.getByTestId("splash")).toBeInTheDocument();
    });

    it("does NOT render children while bootstrap is incomplete", () => {
      renderWithStore(
        <PublicGuard>
          <div data-testid="public-content">Public</div>
        </PublicGuard>,
        authBootstrapIncomplete,
      );
      expect(screen.queryByTestId("public-content")).not.toBeInTheDocument();
    });

    it("does NOT redirect while bootstrap is incomplete", () => {
      renderWithStore(
        <PublicGuard>
          <div data-testid="public-content">Public</div>
        </PublicGuard>,
        authBootstrapIncomplete,
      );
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe("after bootstrap — not authenticated", () => {
    it("renders children when not authenticated and bootstrap complete", () => {
      renderWithStore(
        <PublicGuard>
          <div data-testid="public-content">Public</div>
        </PublicGuard>,
        authNotAuthenticated,
      );
      expect(screen.getByTestId("public-content")).toBeInTheDocument();
    });

    it("does NOT redirect when not authenticated", () => {
      renderWithStore(
        <PublicGuard>
          <div data-testid="public-content">Public</div>
        </PublicGuard>,
        authNotAuthenticated,
      );
      expect(mockPush).not.toHaveBeenCalled();
    });

    it("does NOT render splash screen when not authenticated", () => {
      renderWithStore(
        <PublicGuard>
          <div data-testid="public-content">Public</div>
        </PublicGuard>,
        authNotAuthenticated,
      );
      expect(screen.queryByTestId("splash")).not.toBeInTheDocument();
    });
  });

  describe("after bootstrap — authenticated", () => {
    it("redirects to / when authenticated after bootstrap", async () => {
      renderWithStore(
        <PublicGuard>
          <div data-testid="public-content">Public</div>
        </PublicGuard>,
        authAuthenticated,
      );
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
    });

    it("renders null (not children) when authenticated", async () => {
      renderWithStore(
        <PublicGuard>
          <div data-testid="public-content">Public</div>
        </PublicGuard>,
        authAuthenticated,
      );
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
      expect(screen.queryByTestId("public-content")).not.toBeInTheDocument();
    });

    it("does NOT render splash screen when authenticated", async () => {
      renderWithStore(
        <PublicGuard>
          <div data-testid="public-content">Public</div>
        </PublicGuard>,
        authAuthenticated,
      );
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith("/");
      });
      expect(screen.queryByTestId("splash")).not.toBeInTheDocument();
    });
  });

  describe("Rule F3 compliance", () => {
    it("does NOT block rendering based on isLoading state", () => {
      renderWithStore(
        <PublicGuard>
          <div data-testid="public-content">Public</div>
        </PublicGuard>,
        authF3LoadingNotBlocking,
      );
      expect(screen.getByTestId("public-content")).toBeInTheDocument();
      expect(screen.queryByTestId("splash")).not.toBeInTheDocument();
    });
  });
});
