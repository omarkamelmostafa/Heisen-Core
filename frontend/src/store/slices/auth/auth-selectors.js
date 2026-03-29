// frontend/src/store/slices/auth/auth-selectors.js
import { createSelector } from "@reduxjs/toolkit";

// ==================== PRIMARY SELECTORS ====================
// Base selectors
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = createSelector(
  [(state) => state.auth],
  (auth) => ({
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
  })
);

export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

// Memoized/computed selectors
export const selectUserName = createSelector(
  [selectAuthUser],
  (user) => user?.name || user?.email?.split("@")[0]
);
export const selectUserEmail = (state) => state.auth.user?.email;

export const selectIsVerifying = (state) => state.auth.isVerifying;