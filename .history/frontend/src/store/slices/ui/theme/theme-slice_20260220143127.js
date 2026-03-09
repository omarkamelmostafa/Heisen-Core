import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  mode: "light", // 'light' | 'dark' | 'system'
  primaryColor: "#3B82F6",
  secondaryColor: "#6366F1",
  borderRadius: "8px",
  fontFamily: "Inter, sans-serif",
  responsive: {
    screenSize: "desktop",
    orientation: "landscape",
    touchDevice: false,
  },
  preferences: {
    reducedMotion: false,
    highContrast: false,
    largeText: false,
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  },
};

const themeSlice = createSlice({
  name: "ui/theme",
  initialState,
  reducers: {
    setThemeMode: (state, action) => {
      state.mode = action.payload;
    },
    toggleTheme: (state) => {
      state.mode = state.mode === "light" ? "dark" : "light";
    },
    updateThemeColors: (state, action) => {
      return { ...state, ...action.payload };
    },
    setScreenSize: (state, action) => {
      state.responsive.screenSize = action.payload;
    },
    setOrientation: (state, action) => {
      state.responsive.orientation = action.payload;
    },
    setTouchDevice: (state, action) => {
      state.responsive.touchDevice = action.payload;
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    toggleReducedMotion: (state) => {
      state.preferences.reducedMotion = !state.preferences.reducedMotion;
    },
    toggleHighContrast: (state) => {
      state.preferences.highContrast = !state.preferences.highContrast;
    },
  },
});

export const {
  setThemeMode,
  toggleTheme,
  updateThemeColors,
  setScreenSize,
  setOrientation,
  setTouchDevice,
  updatePreferences,
  toggleReducedMotion,
  toggleHighContrast,
} = themeSlice.actions;

export default themeSlice.reducer;
