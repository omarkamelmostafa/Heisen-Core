export const selectThemeState = (state) => state.ui.theme;

export const selectThemeMode = (state) => state.ui.theme.mode;
export const selectIsDarkMode = (state) => state.ui.theme.mode === "dark";
export const selectPrimaryColor = (state) => state.ui.theme.primaryColor;
export const selectResponsive = (state) => state.ui.theme.responsive;
export const selectScreenSize = (state) => state.ui.theme.responsive.screenSize;
export const selectPreferences = (state) => state.ui.theme.preferences;
export const selectLanguage = (state) => state.ui.theme.preferences.language;
