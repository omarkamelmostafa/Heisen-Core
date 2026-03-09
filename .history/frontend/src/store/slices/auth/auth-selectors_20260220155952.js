import { createSelector } from "@reduxjs/toolkit";
import { cookieService } from "@/services/storage/cookie-service";

// ==================== PRIMARY SELECTORS ====================
// Base selectors
export const selectAuth = (state) => state.auth;
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthRawTokens = (state) => state.auth.tokens;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsVerifying = (state) => state.auth.isVerifying;

// Memoized/computed selectors
export const selectAccessToken = (state) =>
  cookieService.getAccessToken() || state.auth.tokens.accessToken;

export const selectRefreshToken = (state) =>
  cookieService.getRefreshToken() || state.auth.tokens.refreshToken;

export const selectAuthTokens = createSelector(
  [selectAccessToken, selectRefreshToken],
  (accessToken, refreshToken) => ({
    accessToken,
    refreshToken,
  })
);

export const selectUserName = createSelector(
  [selectAuthUser],
  (user) => user?.name || user?.email?.split("@")[0]
);

export const selectUserEmail = createSelector(
  [selectAuthUser],
  (user) => user?.email
);

// Compound selectors
export const selectAuthStatus = createSelector(
  [selectIsAuthenticated, selectAuthLoading, selectAuthError],
  (isAuthenticated, isLoading, error) => ({
    isAuthenticated,
    isLoading,
    error,
  })
);