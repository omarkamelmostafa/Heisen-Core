// frontend/src/__tests__/unit/basic-auth-slice.test.js
import { describe, it, expect, beforeEach } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import authReducer, {
  logout,
  setCredentials,
  clearCredentials,
  setAuthError,
  clearError,
  setLoading,
  setBootstrapComplete,
  setSessionExpired,
  setAccessToken,
} from "../../store/slices/auth/auth-slice";

describe("authSlice - Basic functionality", () => {
  let store;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        auth: authReducer,
      },
    });
  });

  it("has correct initial state", () => {
    const state = store.getState().auth;
    expect(state).toEqual({
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isVerifying: false,
      sessionExpired: false,
      isBootstrapComplete: false,
    });
  });

  it("sets credentials correctly", () => {
    store.dispatch(setCredentials({ accessToken: "test-token" }));
    const state = store.getState().auth;
    expect(state.accessToken).toBe("test-token");
    expect(state.isAuthenticated).toBe(true);
    expect(state.error).toBe(null);
  });

  it("clears credentials correctly", () => {
    store.dispatch(setCredentials({ accessToken: "test-token" }));
    store.dispatch(clearCredentials());
    const state = store.getState().auth;
    expect(state.accessToken).toBe(null);
    expect(state.isAuthenticated).toBe(false);
  });

  it("sets and clears error correctly", () => {
    store.dispatch(setAuthError("Test error"));
    const state = store.getState().auth;
    expect(state.error).toBe("Test error");
    expect(state.isLoading).toBe(false);

    store.dispatch(clearError());
    const stateAfterClear = store.getState().auth;
    expect(stateAfterClear.error).toBe(null);
  });

  it("sets loading state correctly", () => {
    store.dispatch(setLoading(true));
    const state = store.getState().auth;
    expect(state.isLoading).toBe(true);

    store.dispatch(setLoading(false));
    const stateAfter = store.getState().auth;
    expect(stateAfter.isLoading).toBe(false);
  });

  it("sets bootstrap complete correctly", () => {
    store.dispatch(setBootstrapComplete(true));
    const state = store.getState().auth;
    expect(state.isBootstrapComplete).toBe(true);

    store.dispatch(setBootstrapComplete(false));
    const stateAfter = store.getState().auth;
    expect(stateAfter.isBootstrapComplete).toBe(false);
  });

  it("sets session expired correctly", () => {
    store.dispatch(setSessionExpired(true));
    const state = store.getState().auth;
    expect(state.sessionExpired).toBe(true);
  });

  it("sets access token correctly", () => {
    store.dispatch(setAccessToken("new-token"));
    const state = store.getState().auth;
    expect(state.accessToken).toBe("new-token");
    expect(state.isAuthenticated).toBe(true);

    store.dispatch(setAccessToken(null));
    const stateAfter = store.getState().auth;
    expect(stateAfter.accessToken).toBe(null);
    expect(stateAfter.isAuthenticated).toBe(false);
  });

  it("logout clears all state correctly", () => {
    // Set some state first
    store.dispatch(setCredentials({ accessToken: "test-token" }));
    store.dispatch(setAuthError("some error"));
    store.dispatch(setLoading(true));

    // Then logout
    store.dispatch(logout());
    const state = store.getState().auth;
    expect(state).toEqual({
      accessToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      isVerifying: false,
      sessionExpired: false,
      isBootstrapComplete: false,
    });
  });
});
