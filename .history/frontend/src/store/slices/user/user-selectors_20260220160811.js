// frontend/src/store/slices/user/user-selectors.js
import { createSelector } from "@reduxjs/toolkit";
// Base selectors
export const selectUser = (state) => state.user;
export const selectUserProfile = (state) => state.user.profile;
export const selectUserPreferences = (state) => state.user.preferences;
export const selectUserLoading = (state) => state.user.isLoading;
export const selectUserError = (state) => state.user.error;

// Preference selectors
export const selectTheme = (state) => state.user.preferences.theme;
export const selectLanguage = (state) => state.user.preferences.language;
export const selectNotifications = (state) =>
  state.user.preferences.notifications;

// Profile selectors
export const selectUserName = (state) => state.user.profile?.name;
export const selectUserEmail = (state) => state.user.profile?.email;
export const selectUserAvatar = (state) => state.user.profile?.avatar;

// Compound selectors
export const selectUserSettings = createSelector(
  [selectUser],
  (user) => ({
    profile: user.profile,
    preferences: user.preferences,
    isLoading: user.isLoading,
  })
);
