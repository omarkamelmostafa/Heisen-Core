// frontend/src/__tests__/unit/user-slice.test.js
import { describe, it, expect, vi } from "vitest";
import { configureStore } from "@reduxjs/toolkit";
import userReducer, {
  setProfile,
  updateProfile,
  clearError,
  clearUser,
} from "../../store/slices/user/user-slice";
import authReducer, {
  setCredentials,
  clearCredentials,
  logout,
} from "../../store/slices/auth/auth-slice";
import {
  selectUserProfile,
  selectUserEmail,
  selectUser2FA,
  selectUserAvatar,
  selectUserIsVerified,
  selectUserDisplayName,
  selectUserIsLoading,
  selectUserError,
} from "../../store/slices/user/user-selectors";

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

const MOCK_USER = {
  id: "user-123",
  email: "test@example.com",
  firstname: "John",
  lastname: "Doe",
  avatar: "https://example.com/avatar.jpg",
  isVerified: true,
  twoFactorEnabled: false,
};

describe("userSlice — initial state", () => {
  it("has correct initial state", () => {
    const store = makeStore();
    const state = store.getState().user;
    expect(state.profile).toBeNull();
    expect(state.isLoading).toBe(false);
    expect(state.error).toBeNull();
  });
});

describe("userSlice — setProfile", () => {
  it("sets profile to provided value", () => {
    const store = makeStore();
    store.dispatch(setProfile(MOCK_USER));
    expect(store.getState().user.profile).toEqual(MOCK_USER);
  });

  it("overwrites existing profile", () => {
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
      user: { profile: { id: "old" }, isLoading: false, error: null },
    });
    store.dispatch(setProfile(MOCK_USER));
    expect(store.getState().user.profile.id).toBe("user-123");
  });
});

describe("userSlice — updateProfile", () => {
  it("merges partial update into existing profile", () => {
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
      user: { profile: MOCK_USER, isLoading: false, error: null },
    });
    store.dispatch(updateProfile({ firstname: "Jane" }));
    const profile = store.getState().user.profile;
    expect(profile.firstname).toBe("Jane");
    expect(profile.email).toBe(MOCK_USER.email);
  });

  it("does nothing when profile is null", () => {
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
    store.dispatch(updateProfile({ firstname: "Jane" }));
    expect(store.getState().user.profile).toBeNull();
  });
});

describe("userSlice — clearUser", () => {
  it("sets profile and error to null", () => {
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
      user: { profile: MOCK_USER, isLoading: false, error: "err" },
    });
    store.dispatch(clearUser());
    expect(store.getState().user.profile).toBeNull();
    expect(store.getState().user.error).toBeNull();
  });
});

describe("userSlice — clearError", () => {
  it("sets error to null", () => {
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
      user: { profile: null, isLoading: false, error: "something went wrong" },
    });
    store.dispatch(clearError());
    expect(store.getState().user.error).toBeNull();
  });
});

describe("userSlice — cross-slice reactions", () => {
  it("sets profile when setCredentials is dispatched", () => {
    const store = makeStore();
    store.dispatch(setCredentials({ accessToken: "tok", user: MOCK_USER }));
    expect(store.getState().user.profile).toEqual(MOCK_USER);
  });

  it("clears profile when clearCredentials is dispatched", () => {
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
      user: { profile: MOCK_USER, isLoading: false, error: null },
    });
    store.dispatch(clearCredentials());
    expect(store.getState().user.profile).toBeNull();
  });

  it("clears profile when logout is dispatched", () => {
    const store = makeStore({
      auth: {
        accessToken: "token",
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isVerifying: false,
        sessionExpired: false,
        isBootstrapComplete: false,
      },
      user: { profile: MOCK_USER, isLoading: false, error: null },
    });
    store.dispatch(logout());
    expect(store.getState().user.profile).toBeNull();
  });
});

describe("user selectors", () => {
  it("selectUserProfile returns user.profile", () => {
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
      user: { profile: MOCK_USER, isLoading: false, error: null },
    });
    expect(selectUserProfile(store.getState())).toEqual(MOCK_USER);
  });

  it("selectUserEmail returns profile email", () => {
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
      user: { profile: MOCK_USER, isLoading: false, error: null },
    });
    expect(selectUserEmail(store.getState())).toBe("test@example.com");
  });

  it("selectUserEmail returns undefined when profile is null", () => {
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
    expect(selectUserEmail(store.getState())).toBeUndefined();
  });

  it("selectUser2FA returns twoFactorEnabled", () => {
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
      user: { profile: { ...MOCK_USER, twoFactorEnabled: true }, isLoading: false, error: null },
    });
    expect(selectUser2FA(store.getState())).toBe(true);
  });

  it("selectUserAvatar returns avatar url", () => {
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
      user: { profile: MOCK_USER, isLoading: false, error: null },
    });
    expect(selectUserAvatar(store.getState())).toBe("https://example.com/avatar.jpg");
  });

  it("selectUserIsVerified returns isVerified", () => {
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
      user: { profile: MOCK_USER, isLoading: false, error: null },
    });
    expect(selectUserIsVerified(store.getState())).toBe(true);
  });

  it("selectUserDisplayName returns email prefix when no name field", () => {
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
      user: { profile: MOCK_USER, isLoading: false, error: null },
    });
    const name = selectUserDisplayName(store.getState());
    expect(name).toBe("test");
  });

  it("selectUserDisplayName returns null when profile is null", () => {
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
    expect(selectUserDisplayName(store.getState())).toBeNull();
  });

  it("selectUserIsLoading returns user.isLoading", () => {
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
      user: { profile: null, isLoading: true, error: null },
    });
    expect(selectUserIsLoading(store.getState())).toBe(true);
  });

  it("selectUserError returns user.error", () => {
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
      user: { profile: null, isLoading: false, error: "load failed" },
    });
    expect(selectUserError(store.getState())).toBe("load failed");
  });
});
