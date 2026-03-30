// frontend/src/store/slices/auth/auth-slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // ==================== PRIMARY STATE ====================
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // ==================== LATER ENHANCEMENT ====================
  isVerifying: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // ==================== PRIMARY ACTIONS ====================
    // Logout
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
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
      state.error = action.payload;
      state.isLoading = false;
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
    // Helper to handle loading state
    const handlePending = (state) => {
      state.isLoading = true;
      state.error = null;
    };

    // Helper to handle error state
    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.error = action.payload || action.error?.message || "An unexpected error occurred";
    };

    // Login
    builder
      .addCase("auth/login/pending", handlePending)
      .addCase("auth/login/fulfilled", (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase("auth/login/rejected", handleRejected);

    // Register
    builder
      .addCase("auth/register/pending", handlePending)
      .addCase("auth/register/fulfilled", (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase("auth/register/rejected", handleRejected);

    // Verify Email
    builder
      .addCase("auth/verifyEmail/pending", (state) => {
        state.isLoading = true;
        state.isVerifying = true;
        state.error = null;
      })
      .addCase("auth/verifyEmail/fulfilled", (state, action) => {
        state.isLoading = false;
        state.isVerifying = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.error = null;
      })
      .addCase("auth/verifyEmail/rejected", (state, action) => {
        state.isLoading = false;
        state.isVerifying = false;
        state.error = action.payload || "Email verification failed";
      });

    // Forgot Password
    builder
      .addCase("auth/forgotPassword/pending", handlePending)
      .addCase("auth/forgotPassword/fulfilled", (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase("auth/forgotPassword/rejected", handleRejected);

    // Reset Password
    builder
      .addCase("auth/resetPassword/pending", handlePending)
      .addCase("auth/resetPassword/fulfilled", (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase("auth/resetPassword/rejected", handleRejected);
  },
});

export const {
  // PRIMARY
  logout,
  setAuthenticated,
  clearError,
  setAuthError,
  // LATER
  startVerification,
  endVerification,
} = authSlice.actions;

export default authSlice.reducer;
