// frontend/src/__tests__/unit/auth-slice.test.js
import { describe, it, expect, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, {
  setCredentials,
  clearCredentials,
  setAuthError,
  clearError,
  setLoading,
  setBootstrapComplete,
  setSessionExpired,
  setAccessToken,
  logout,
  updateAccessToken,
} from "../../store/slices/auth/auth-slice";
import userReducer from "../../store/slices/user/user-slice";
import {
  selectIsAuthenticated,
  selectAuthError,
  selectAuthLoading,
  selectAccessToken,
  selectIsBootstrapComplete,
  selectSessionExpired,
} from "../../store/slices/auth/auth-selectors";

// Mock thunks to prevent circular imports and API execution
vi.mock("../../store/slices/auth/auth-thunks");
vi.mock("../../../services/domain/auth-service");
vi.mock("../../../services/auth/token-manager");
vi.mock("../../../services/api/refresh-queue");

function makeStore(preloadedState = {}) {
  return configureStore({
    reducer: { auth: authReducer, user: userReducer },
    preloadedState,
  });
}

describe("authSlice — initial state", () => {
  it("has correct initial state", () => {
    const store = makeStore();
    const state = store.getState().auth;
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.isBootstrapComplete).toBe(false);
    expect(state.sessionExpired).toBe(false);
  });
});

describe("authSlice — setCredentials", () => {
  it("sets accessToken and isAuthenticated to true", () => {
    const store = makeStore();
    store.dispatch(setCredentials({ accessToken: "tok-123", user: { id: "1" } }));
    const state = store.getState().auth;
    expect(state.accessToken).toBe("tok-123");
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("clears error when credentials are set", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: "old error",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch(setCredentials({ accessToken: "tok-123", user: { id: "1" } }));
    const state = store.getState().auth;
    expect(state.error).toBeNull();
  });
});

describe("authSlice — clearCredentials", () => {
  it("resets all auth state to null/false", () => {
    const store = makeStore({
      auth: {
        accessToken: "token-123",
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: true,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch(clearCredentials());
    const state = store.getState().auth;
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.sessionExpired).toBe(false);
  });
});

describe("authSlice — setAuthError", () => {
  it("sets error string and sets isLoading to false", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch(setAuthError("Invalid credentials"));
    const state = store.getState().auth;
    expect(state.error).toBe("Invalid credentials");
    expect(state.isLoading).toBe(false);
  });

  it("extracts message from object payload", () => {
    const store = makeStore();
    store.dispatch(setAuthError({ message: "Token expired" }));
    const state = store.getState().auth;
    expect(state.error).toBe("Token expired");
  });

  it("falls back to default message for empty object", () => {
    const store = makeStore();
    store.dispatch(setAuthError({}));
    const state = store.getState().auth;
    expect(state.error).toBe("An unexpected error occurred");
  });
});

describe("authSlice — clearError", () => {
  it("sets error to null", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: "some error",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch(clearError());
    const state = store.getState().auth;
    expect(state.error).toBeNull();
  });
});

describe("authSlice — setLoading", () => {
  it("sets isLoading to true", () => {
    const store = makeStore();
    store.dispatch(setLoading(true));
    const state = store.getState().auth;
    expect(state.isLoading).toBe(true);
  });

  it("sets isLoading to false", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch(setLoading(false));
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
  });
});

describe("authSlice — setBootstrapComplete", () => {
  it("sets isBootstrapComplete to true", () => {
    const store = makeStore();
    store.dispatch(setBootstrapComplete(true));
    const state = store.getState().auth;
    expect(state.isBootstrapComplete).toBe(true);
  });

  it("sets isBootstrapComplete to false", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: true,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch(setBootstrapComplete(false));
    const state = store.getState().auth;
    expect(state.isBootstrapComplete).toBe(false);
  });
});

describe("authSlice — setSessionExpired", () => {
  it("sets sessionExpired to true", () => {
    const store = makeStore();
    store.dispatch(setSessionExpired(true));
    const state = store.getState().auth;
    expect(state.sessionExpired).toBe(true);
  });
});

describe("authSlice — setAccessToken", () => {
  it("sets accessToken and isAuthenticated true when token provided", () => {
    const store = makeStore();
    store.dispatch(setAccessToken("new-token"));
    const state = store.getState().auth;
    expect(state.accessToken).toBe("new-token");
    expect(state.isAuthenticated).toBe(true);
  });

  it("sets isAuthenticated false when token is null", () => {
    const store = makeStore({
      auth: {
        accessToken: "existing-token",
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch(setAccessToken(null));
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
  });
});

describe("authSlice — logout", () => {
  it("clears accessToken and sets isAuthenticated to false", () => {
    const store = makeStore({
      auth: {
        accessToken: "existing-token",
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch(logout());
    const state = store.getState().auth;
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});

describe("auth selectors", () => {
  it("selectIsAuthenticated returns auth.isAuthenticated", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    expect(selectIsAuthenticated(store.getState())).toBe(true);
  });

  it("selectAuthError returns auth.error", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: "oops",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    expect(selectAuthError(store.getState())).toBe("oops");
  });

  it("selectAuthLoading returns auth.isLoading", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    expect(selectAuthLoading(store.getState())).toBe(true);
  });

  it("selectAccessToken returns auth.accessToken", () => {
    const store = makeStore({
      auth: {
        accessToken: "abc",
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    expect(selectAccessToken(store.getState())).toBe("abc");
  });

  it("selectIsBootstrapComplete returns auth.isBootstrapComplete", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: true,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    expect(selectIsBootstrapComplete(store.getState())).toBe(true);
  });

  it("selectSessionExpired returns auth.sessionExpired", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: true,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    expect(selectSessionExpired(store.getState())).toBe(true);
  });
});
