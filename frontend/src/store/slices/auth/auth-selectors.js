import { createSelector } from "@reduxjs/toolkit";
import { cookieService } from "@/services/storage/cookie-service";

// ==================== PRIMARY SELECTORS ====================
// Base selectors
export const selectAuth = (state) => state.auth;
export const selectAuthUser = (state) => state.auth.user;
export const selectAuthStatus = createSelector(
  [selectAuth],
  (auth) => ({
    isAuthenticated: auth.isAuthenticated,
    isLoading: auth.isLoading,
    error: auth.error,
  })
);

// Deprecated: Tokens are now HttpOnly and not stored in Redux
export const selectAuthTokens = () => ({ accessToken: null, refreshToken: null });
export const selectAccessToken = () => null;
export const selectRefreshToken = () => null;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;
export const selectIsBootstrapComplete = (state) => state.auth.isBootstrapComplete;

// Memoized/computed selectors
// export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserName = createSelector(
  [selectAuthUser],
  (user) => user?.name || user?.email?.split("@")[0]
);
export const selectUserEmail = (state) => state.auth.user?.email;

// export const selectCanAccess = (roles) => (state) => {
//   if (!roles || roles.length === 0) return true;
//   const userRole = selectUserRole(state);
//   return roles.includes(userRole);
// };

// ==================== LATER ENHANCEMENT SELECTORS ====================
export const selectIsVerifying = (state) => state.auth.isVerifying;