import { createSelector } from "@reduxjs/toolkit";

// Base selectors
export const selectUser = (state) => state.user;
export const selectUserProfile = (state) => state.user.profile;
export const selectUserPreferences = (state) => state.user.preferences;
export const selectUserLoading = (state) => state.user.isLoading;
export const selectUserError = (state) => state.user.error;

// Preference selectors
export const selectTheme = createSelector(
  [selectUserPreferences],
  (preferences) => preferences.theme
);

export const selectLanguage = createSelector(
  [selectUserPreferences],
  (preferences) => preferences.language
);

export const selectNotifications = createSelector(
  [selectUserPreferences],
  (preferences) => preferences.notifications
);

// Profile selectors
export const selectUserName = createSelector(
  [selectUserProfile],
  (profile) => profile?.name
);

export const selectUserEmail = createSelector(
  [selectUserProfile],
  (profile) => profile?.email
);

export const selectUserAvatar = createSelector(
  [selectUserProfile],
  (profile) => profile?.avatar
);

// Compound selectors
export const selectUserSettings = createSelector(
  [selectUserProfile, selectUserPreferences, selectUserLoading],
  (profile, preferences, isLoading) => ({
    profile,
    preferences,
    isLoading,
  })
);
