// frontend/src/store/slices/auth/auth-slice.js
import { createSlice } from "@reduxjs/toolkit";
import { addAuthThunkCases } from "./auth-slice-cases";

const initialState = {
  // ==================== PRIMARY STATE ====================
  accessToken: null, // Held in memory only — never persisted to cookies/localStorage
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ==================== LATER ENHANCEMENT ====================
  isVerifying: false,
  sessionExpired: false, // Added for session management
  isBootstrapComplete: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ==================== PRIMARY ACTIONS ====================
    // Logout — clears all auth state
    logout: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
    },

    // Set access token (called by refresh flow and bootstrap)
    setAccessToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    // Set authentication status
    setAuthenticated: (state, action) => {
      state.isAuthenticated = action.payload;
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Set error manually (primarily for UI validation)
    setAuthError: (state, action) => {
      state.error = typeof action.payload === 'string'
        ? action.payload
        : (action.payload?.message || action.error?.message || 'An unexpected error occurred');
      state.isLoading = false;
    },

    // ==================== NEW ACTIONS ====================
    setCredentials: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    clearCredentials: (state) => {
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.sessionExpired = false;
    },

    setSessionExpired: (state, action) => {
      state.sessionExpired = action.payload;
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setBootstrapComplete: (state, action) => {
      state.isBootstrapComplete = action.payload;
    },

    // ==================== LATER ENHANCEMENT ACTIONS ====================

    // Start email verification
    startVerification: (state) => {
      state.isVerifying = true;
    },

    // End email verification
    endVerification: (state) => {
      state.isVerifying = false;
    },
  },
  extraReducers: (builder) => {
    addAuthThunkCases(builder);
  },
});

export const {
  // PRIMARY
  logout,
  setAccessToken,
  setAuthenticated,
  clearError,
  setAuthError,
  setCredentials,
  clearCredentials,
  setSessionExpired,
  setLoading,
  setBootstrapComplete,
  // LATER
  startVerification,
  endVerification,
} = authSlice.actions;

export default authSlice.reducer;
