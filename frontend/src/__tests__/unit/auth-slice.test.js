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

  it("falls back to action.error.message when payload has no message property", () => {
    const store = makeStore();
    store.dispatch({
      type: setAuthError.type,
      payload: {},
      error: { message: "error from action.error" },
    });
    const state = store.getState().auth;
    expect(state.error).toBe("error from action.error");
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

import { verify2fa } from "../../store/slices/auth/auth-thunks";

describe("authSlice — extraReducers — verify2fa", () => {
  it("verify2fa.fulfilled sets accessToken and isAuthenticated", () => {
    const store = makeStore();
    store.dispatch({
      type: verify2fa.fulfilled.type,
      payload: { data: { accessToken: "tok-2fa" } }
    });
    const state = store.getState().auth;
    expect(state.accessToken).toBe("tok-2fa");
    expect(state.isAuthenticated).toBe(true);
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });

  it("verify2fa.rejected sets error message", () => {
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
      payload: { message: "2FA failed" }
    });
    const state = store.getState().auth;
    expect(state.error).toBe("2FA failed");
    expect(state.isLoading).toBe(false);
  });
  
  it("verify2fa.rejected sets default error message when no payload message", () => {
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
      payload: null
    });
    const state = store.getState().auth;
    expect(state.error).toBe("2FA verification failed");
    expect(state.isLoading).toBe(false);
  });
});

import { resetPassword } from "../../store/slices/auth/auth-thunks";

describe("authSlice — extraReducers — more missing coverage", () => {
  it("resetPassword.fulfilled sets isLoading to false", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: "old error",
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

  it("verify2fa.pending sets isLoading to true and clears error", () => {
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
    store.dispatch({ type: verify2fa.pending.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(true);
    expect(state.error).toBeNull();
  });
});

import {
  verifyEmail,
  forgotPassword,
  loginUser,
  registerUser,
  bootstrapAuth,
} from "../../store/slices/auth/auth-thunks";

describe("authSlice — extraReducers — verifyEmail & forgotPassword", () => {
  it("verifyEmail.rejected sets error and clears loading", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        isVerifying: true,
        error: null,
      },
    });
    store.dispatch({
      type: verifyEmail.rejected.type,
      payload: "Verification failed message",
    });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.isVerifying).toBe(false);
    expect(state.error).toBe("Verification failed message");
  });

  it("verifyEmail.rejected handles object payload", () => {
    const store = makeStore();
    store.dispatch({
      type: verifyEmail.rejected.type,
      payload: { message: "Object error" },
    });
    expect(store.getState().auth.error).toBe("Object error");
  });

  it("verifyEmail.rejected handles empty payload with fallback", () => {
    const store = makeStore();
    store.dispatch({
      type: verifyEmail.rejected.type,
      payload: null,
      error: { message: null }
    });
    expect(store.getState().auth.error).toBe("Email verification failed");
  });

  it("forgotPassword.fulfilled clears loading and error", () => {
    const store = makeStore({
      auth: {
        accessToken: null,
        isAuthenticated: false,
        isLoading: true,
        error: "previous error",
      },
    });
    store.dispatch({ type: forgotPassword.fulfilled.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
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

describe("handlePending (via untested thunks)", () => {
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

describe("handleRejected (via untested thunks)", () => {
  it("sets error from string payload for loginUser.rejected", () => {
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

describe("bootstrapAuth thunk handlers", () => {
  it("sets isLoading true on bootstrapAuth.pending", () => {
    const store = makeStore();
    store.dispatch({ type: bootstrapAuth.pending.type });
    expect(store.getState().auth.isLoading).toBe(true);
  });

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

describe("verifyEmail thunk handlers", () => {
  it("sets isLoading and isVerifying true on verifyEmail.pending", () => {
    const store = makeStore();
    store.dispatch({ type: verifyEmail.pending.type });
    const state = store.getState().auth;
    expect(state.isLoading).toBe(true);
    expect(state.isVerifying).toBe(true);
    expect(state.error).toBeNull();
  });

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

