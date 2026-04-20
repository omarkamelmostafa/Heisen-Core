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
  setAuthenticated,
  startVerification,
  endVerification,
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
import {
  verify2fa,
  resetPassword,
  verifyEmail,
  forgotPassword,
  loginUser,
  registerUser,
  bootstrapAuth,
} from "../../store/slices/auth/auth-thunks";

function makeStore(preloadedState = {}) {
  return configureStore({
    reducer: { auth: authReducer, user: userReducer },
    preloadedState,
  });
}











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

describe("setAuthenticated reducer", () => {
  it("sets isAuthenticated to true when payload is true", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch(setAuthenticated(true));
    expect(store.getState().auth.isAuthenticated).toBe(true);
  });

  it("sets isAuthenticated to false when payload is false", () => {
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
    store.dispatch(setAuthenticated(false));
    expect(store.getState().auth.isAuthenticated).toBe(false);
  });
});

describe("updateAccessToken reducer", () => {
  it("sets accessToken and isAuthenticated true when token provided", () => {
    const store = makeStore();
    store.dispatch(updateAccessToken("new-access"));
    const state = store.getState().auth;
    expect(state.accessToken).toBe("new-access");
    expect(state.isAuthenticated).toBe(true);
  });

  it("sets isAuthenticated false and accessToken when null provided", () => {
    const store = makeStore({
      auth: {
        accessToken: "old",
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch(updateAccessToken(null));
    const state = store.getState().auth;
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});

describe("startVerification reducer", () => {
  it("sets isVerifying to true", () => {
    const store = makeStore();
    store.dispatch(startVerification());
    expect(store.getState().auth.isVerifying).toBe(true);
  });
});

describe("endVerification reducer", () => {
  it("sets isVerifying to false", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isVerifying: true,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch(endVerification());
    expect(store.getState().auth.isVerifying).toBe(false);
  });
});

describe("pending actions", () => {
  it("sets isLoading true and clears error for loginUser.pending", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: "prior",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: loginUser.pending.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("sets isLoading true and clears error for registerUser.pending", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: "prior",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: registerUser.pending.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("sets isLoading true and clears error for forgotPassword.pending", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: "prior",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: forgotPassword.pending.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });

  it("sets isLoading true and clears error for resetPassword.pending", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: "prior",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: resetPassword.pending.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });
});

describe("rejected actions", () => {
  it("sets error and isLoading false for loginUser.rejected", () => {
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
    store.dispatch({
      type: loginUser.rejected.type,
      payload: "Login failed",
    });
    const state = store.getState().auth;
    expect(state.error).toBe("Login failed");
    expect(state.isLoading).toBe(false);
  });

  it("sets error from payload.message for loginUser.rejected", () => {
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
    store.dispatch({
      type: loginUser.rejected.type,
      payload: { message: "Invalid credentials" },
    });
    const state = store.getState().auth;
    expect(state.error).toBe("Invalid credentials");
    expect(state.isLoading).toBe(false);
  });

  it("sets error from action.error.message for loginUser.rejected", () => {
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
    store.dispatch({
      type: loginUser.rejected.type,
      payload: null,
      error: { message: "Network error" },
    });
    const state = store.getState().auth;
    expect(state.error).toBe("Network error");
    expect(state.isLoading).toBe(false);
  });

  it("sets default error when nothing available for loginUser.rejected", () => {
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
    store.dispatch({
      type: loginUser.rejected.type,
      payload: null,
      error: {},
    });
    const state = store.getState().auth;
    expect(state.error).toBe("An unexpected error occurred");
    expect(state.isLoading).toBe(false);
  });

  it("sets isLoading false for registerUser.rejected", () => {
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
    store.dispatch({
      type: registerUser.rejected.type,
      payload: { message: "Registration failed" },
    });
    expect(store.getState().auth.isLoading).toBe(false);
  });

  it("sets isLoading false for forgotPassword.rejected", () => {
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
    store.dispatch({
      type: forgotPassword.rejected.type,
      payload: { message: "Forgot failed" },
    });
    expect(store.getState().auth.isLoading).toBe(false);
  });

  it("sets isLoading false for resetPassword.rejected", () => {
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
    store.dispatch({
      type: resetPassword.rejected.type,
      payload: { message: "Reset failed" },
    });
    expect(store.getState().auth.isLoading).toBe(false);
  });
});

describe("bootstrapAuth.pending", () => {
  it("sets isLoading true for bootstrapAuth.pending", () => {
    const store = makeStore();
    store.dispatch({
      type: bootstrapAuth.pending.type,
    });
    expect(store.getState().auth.isLoading).toBe(true);
  });
});

describe("bootstrapAuth.fulfilled", () => {
  it("sets isAuthenticated based on accessToken on bootstrapAuth.fulfilled", () => {
    const store = makeStore({
      auth: {
        accessToken: "test-token",
        isAuthenticated: false,
        isLoading: true,
        error: "noise",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({
      type: bootstrapAuth.fulfilled.type,
      payload: { data: { accessToken: "test-token" } },
    });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBeNull();
  });

  it("sets isAuthenticated false when no accessToken on bootstrapAuth.fulfilled", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: true,
        isLoading: true,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({
      type: bootstrapAuth.fulfilled.type,
      payload: { data: {} },
    });
    const state = store.getState().auth;
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
  });
});

describe("verifyEmail.pending", () => {
  it("sets isLoading and isVerifying true and clears error on verifyEmail.pending", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: "should clear",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: verifyEmail.pending.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(true);
    expect(state.isVerifying).toBe(true);
    expect(state.error).toBeNull();
  });
});

describe("verifyEmail.fulfilled", () => {
  it("sets isLoading and isVerifying false and clears error on verifyEmail.fulfilled", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: "should clear",
        isVerifying: true,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: verifyEmail.fulfilled.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.isVerifying).toBe(false);
    expect(state.error).toBeNull();
  });
});
