// frontend/src/store/modules/auth/auth-selectors.js
import { createSelector } from "@reduxjs/toolkit";

// Basic selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectAccessToken = (state) => state.auth.accessToken;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.isLoading;
export const selectAuthError = (state) => state.auth.error;

// Memoized selectors for performance
export const selectUserPermissions = createSelector(
  [selectUser],
  (user) => user?.permissions || []
);

export const selectUserRole = createSelector(
  [selectUser],
  (user) => user?.role || "guest"
);

export const selectIsAdmin = createSelector(
  [selectUserRole],
  (role) => role === "admin"
);

export const selectCan = createSelector(
  [selectUserPermissions],
  (permissions) => (permission) => permissions.includes(permission)
);
