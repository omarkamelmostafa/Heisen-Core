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
    // Import thunks inline to avoid circular dependency at module top-level.
    // This is evaluated lazily when the slice is created, by which time
    // both modules have finished loading.
    const {
      loginUser,
      registerUser,
      verifyEmail,
      forgotPassword,
      resetPassword,
    } = require("./auth-thunks");

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
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data?.user;
        state.error = null;
      })
      .addCase(loginUser.rejected, handleRejected);

    // Register
    builder
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data?.user;
        state.error = null;
      })
      .addCase(registerUser.rejected, handleRejected);

    // Verify Email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isVerifying = false;
        state.isAuthenticated = true;
        state.user = action.payload.data?.user;
        state.error = null;
      })
      .addCase(verifyEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.isVerifying = false;
        state.error = action.payload || "Email verification failed";
      });

    // Forgot Password
    builder
      .addCase(forgotPassword.pending, handlePending)
      .addCase(forgotPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgotPassword.rejected, handleRejected);

    // Reset Password
    builder
      .addCase(resetPassword.pending, handlePending)
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(resetPassword.rejected, handleRejected);
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
