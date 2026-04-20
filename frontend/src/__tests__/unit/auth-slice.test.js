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
  logoutAllDevices,
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

describe("verifyEmail.rejected", () => {
  it("sets isLoading and isVerifying false and sets error from string payload", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        isVerifying: true,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({
      type: verifyEmail.rejected.type,
      payload: "Verification failed",
    });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.isVerifying).toBe(false);
    expect(state.error).toBe("Verification failed");
  });

  it("sets error from payload.message when payload is object", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        isVerifying: true,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({
      type: verifyEmail.rejected.type,
      payload: { message: "Invalid token" },
    });
    const state = store.getState().auth;
    expect(state.error).toBe("Invalid token");
  });

  it("sets error from action.error.message as fallback", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        isVerifying: true,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({
      type: verifyEmail.rejected.type,
      payload: null,
      error: { message: "Network error" },
    });
    const state = store.getState().auth;
    expect(state.error).toBe("Network error");
  });

  it("sets default error when nothing available", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: null,
        isVerifying: true,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({
      type: verifyEmail.rejected.type,
      payload: null,
      error: {},
    });
    const state = store.getState().auth;
    expect(state.error).toBe("Email verification failed");
  });
});

describe("forgotPassword.fulfilled", () => {
  it("sets isLoading false and clears error on forgotPassword.fulfilled", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: "should clear",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: forgotPassword.fulfilled.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe("resetPassword.fulfilled", () => {
  it("sets isLoading false and clears error on resetPassword.fulfilled", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: "should clear",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: resetPassword.fulfilled.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe("verify2fa.pending", () => {
  it("sets isLoading true and clears error on verify2fa.pending", () => {
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
    store.dispatch({ type: verify2fa.pending.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });
});

describe("verify2fa.fulfilled", () => {
  it("sets isAuthenticated true and accessToken on verify2fa.fulfilled", () => {
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
      type: verify2fa.fulfilled.type,
      payload: { data: { accessToken: "2fa-token" } },
    });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe("2fa-token");
    expect(state.error).toBeNull();
  });

  it("sets accessToken to null when not provided in payload", () => {
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
      type: verify2fa.fulfilled.type,
      payload: { data: {} },
    });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBeNull();
    expect(state.error).toBeNull();
  });
});

describe("verify2fa.rejected", () => {
  it("sets isLoading false and error from payload.message", () => {
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
      type: verify2fa.rejected.type,
      payload: { message: "Invalid 2FA code" },
    });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe("Invalid 2FA code");
  });

  it("sets default error when no payload.message", () => {
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
      type: verify2fa.rejected.type,
      payload: {},
    });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.error).toBe("2FA verification failed");
  });
});

describe("bootstrapAuth.rejected", () => {
  it("sets isLoading false and isAuthenticated false on bootstrapAuth.rejected", () => {
    const store = makeStore({
      auth: {
        accessToken: "some-token",
        isAuthenticated: true,
        isLoading: true,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: bootstrapAuth.rejected.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
  });
});

describe("logoutAllDevices.fulfilled", () => {
  it("clears auth state on logoutAllDevices.fulfilled", () => {
    const store = makeStore({
      auth: {
        accessToken: "token-to-clear",
        isAuthenticated: true,
        isLoading: true,
        error: "some error",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: logoutAllDevices.fulfilled.type });
    const state = store.getState().auth;
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe("loginUser.fulfilled", () => {
  it("sets isAuthenticated and accessToken on normal login", () => {
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
      type: loginUser.fulfilled.type,
      payload: { data: { accessToken: "login-token" } },
    });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBe("login-token");
  });

  it("early returns when requiresTwoFactor is true", () => {
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
      type: loginUser.fulfilled.type,
      payload: { data: { requiresTwoFactor: true } },
    });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
  });

  it("sets accessToken to null when not provided in payload", () => {
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
      type: loginUser.fulfilled.type,
      payload: { data: {} },
    });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.accessToken).toBeNull();
  });
});

describe("registerUser.fulfilled", () => {
  it("sets isLoading false and isAuthenticated false on registerUser.fulfilled", () => {
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
      type: registerUser.fulfilled.type,
      payload: { data: { user: { id: "123" } } },
    });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.isAuthenticated).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe("clearCredentials reducer", () => {
  it("resets all auth state to initial values", () => {
    const store = makeStore({
      auth: {
        accessToken: "token",
        isAuthenticated: true,
        isLoading: true,
        error: "error",
        isVerifying: true,
        sessionExpired: true,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: "auth/clearCredentials" });
    const state = store.getState().auth;
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
    expect(state.sessionExpired).toBe(false);
  });
});

describe("setSessionExpired reducer", () => {
  it("sets sessionExpired to true", () => {
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
    store.dispatch({ type: "auth/setSessionExpired", payload: true });
    expect(store.getState().auth.sessionExpired).toBe(true);
  });
});

describe("setLoading reducer", () => {
  it("sets isLoading to the provided value", () => {
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
    store.dispatch({ type: "auth/setLoading", payload: true });
    expect(store.getState().auth.isLoading).toBe(true);
  });
});

describe("setBootstrapComplete reducer", () => {
  it("sets isBootstrapComplete to the provided value", () => {
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
    store.dispatch({ type: "auth/setBootstrapComplete", payload: true });
    expect(store.getState().auth.isBootstrapComplete).toBe(true);
  });
});

describe("clearError reducer", () => {
  it("clears the error state", () => {
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
    store.dispatch({ type: "auth/clearError" });
    expect(store.getState().auth.error).toBeNull();
  });
});

describe("setAuthError reducer", () => {
  it("sets error from string payload", () => {
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
    store.dispatch({ type: "auth/setAuthError", payload: "Custom error" });
    const state = store.getState().auth;
    expect(state.error).toBe("Custom error");
    expect(state.isLoading).toBe(false);
  });

  it("sets error from payload.message when payload is object", () => {
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
    store.dispatch({ type: "auth/setAuthError", payload: { message: "Object error" } });
    const state = store.getState().auth;
    expect(state.error).toBe("Object error");
    expect(state.isLoading).toBe(false);
  });

  it("sets error from action.error.message as fallback", () => {
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
    store.dispatch({ type: "auth/setAuthError", payload: null, error: { message: "Fallback error" } });
    const state = store.getState().auth;
    expect(state.error).toBe("Fallback error");
    expect(state.isLoading).toBe(false);
  });

  it("sets default error when nothing available", () => {
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
    store.dispatch({ type: "auth/setAuthError", payload: null, error: {} });
    const state = store.getState().auth;
    expect(state.error).toBe("An unexpected error occurred");
    expect(state.isLoading).toBe(false);
  });
});

describe("setCredentials reducer", () => {
  it("sets accessToken, isAuthenticated, and clears loading/error", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: "some error",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({
      type: "auth/setCredentials",
      payload: { accessToken: "new-token" },
    });
    const state = store.getState().auth;
    expect(state.accessToken).toBe("new-token");
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe("logout reducer", () => {
  it("clears auth state on logout", () => {
    const store = makeStore({
      auth: {
        accessToken: "token",
        isAuthenticated: true,
        isLoading: true,
        error: "error",
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: "auth/logout" });
    const state = store.getState().auth;
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe("setAccessToken reducer", () => {
  it("sets accessToken and updates isAuthenticated when token provided", () => {
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
    store.dispatch({ type: "auth/setAccessToken", payload: "access-token" });
    const state = store.getState().auth;
    expect(state.accessToken).toBe("access-token");
    expect(state.isAuthenticated).toBe(true);
  });

  it("clears isAuthenticated when null token provided", () => {
    const store = makeStore({
      auth: {
        accessToken: "old-token",
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: null, isLoading: false, error: null },
    });
    store.dispatch({ type: "auth/setAccessToken", payload: null });
    const state = store.getState().auth;
    expect(state.accessToken).toBeNull();
    expect(state.isAuthenticated).toBe(false);
  });
});
