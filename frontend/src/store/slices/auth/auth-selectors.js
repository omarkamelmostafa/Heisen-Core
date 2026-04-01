// frontend/src/store/slices/auth/auth-selectors.js
import { createSelector } from "@reduxjs/toolkit";

// ==================== PRIMARY SELECTORS ====================
// Auth status selector (keeps auth-related status together)
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
export const selectIsVerifying = (state) => state.auth.isVerifying;
export const selectSessionExpired = (state) => state.auth.sessionExpired;
export const selectIsBootstrapComplete = (state) => state.auth.isBootstrapComplete;

// Access token selector
export const selectAccessToken = (state) => state.auth.accessToken;