// frontend/src/store/slices/user/user-selectors.js
import { createSelector } from "@reduxjs/toolkit";

// ==================== PRIMARY SELECTORS ====================

// Base selectors
export const selectUserProfile = (state) => state.user.profile;
export const selectUserIsLoading = (state) => state.user.isLoading;
export const selectUserError = (state) => state.user.error;

// Field selectors
export const selectUserEmail = (state) => state.user.profile?.email;
export const selectUser2FA = (state) => state.user.profile?.twoFactorEnabled;
export const selectUserAvatar = (state) => state.user.profile?.avatar;
export const selectUserIsVerified = (state) => state.user.profile?.isVerified;

// Memoized/computed selectors
export const selectUserDisplayName = createSelector(
  [selectUserProfile],
  (profile) => {
    if (!profile) return null;
    return profile.name || profile.email?.split("@")[0];
  }
);
