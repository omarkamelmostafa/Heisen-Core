// frontend/src/store/slices/auth/auth-slice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // ==================== PRIMARY STATE ====================
  user: null,
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
      state.user = null;
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

    // Set user data (called by bootstrap after successful refresh)
    setUser: (state, action) => {
      state.user = action.payload;
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

    // ==================== NEW ACTIONS ====================
    setCredentials: (state, action) => {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },

    updateAccessToken: (state, action) => {
      state.accessToken = action.payload;
      state.isAuthenticated = !!action.payload;
    },

    clearCredentials: (state) => {
      state.user = null;
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
    // Import thunks inline to avoid circular dependency at module top-level.
    // This is evaluated lazily when the slice is created, by which time
    // both modules have finished loading.
    const {
      loginUser,
      registerUser,
      verifyEmail,
      forgotPassword,
      resetPassword,
      bootstrapAuth,
      logoutAllDevices,
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

    // Login — stores access token in Redux memory
    builder
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.data?.user;
        state.accessToken = action.payload.data?.accessToken || null;
        state.error = null;
      })
      .addCase(loginUser.rejected, handleRejected);

    // Register — does NOT set isAuthenticated (user must verify email first)
    builder
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false; // Must verify email before authenticated
        state.user = action.payload.data?.user || null;
        state.error = null;
      })
      .addCase(registerUser.rejected, handleRejected);

    // Bootstrap Auth — restore session from refresh token cookie
    builder
      .addCase(bootstrapAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(bootstrapAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        // accessToken and user are set by the thunk via dispatch(setAccessToken/setUser)
        state.isAuthenticated = !!state.accessToken;
        state.error = null;
      })
      .addCase(bootstrapAuth.rejected, (state) => {
        state.isLoading = false;
        // No valid session — not an error, just not authenticated
        state.isAuthenticated = false;
        state.accessToken = null;
        state.user = null;
      });

    // Logout All Devices
    builder
      .addCase(logoutAllDevices.fulfilled, (state) => {
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
      });

    // Verify Email
    builder
      .addCase(verifyEmail.pending, (state) => {
        state.isLoading = true;
        state.isVerifying = true;
        state.error = null;
      })
      .addCase(verifyEmail.fulfilled, (state) => {
        state.isLoading = false;
        state.isVerifying = false;
        // User is now verified but not yet logged in — they need to log in
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
  setAccessToken,
  setUser,
  setAuthenticated,
  clearError,
  setAuthError,
  setCredentials,
  updateAccessToken,
  clearCredentials,
  setSessionExpired,
  setLoading,
  setBootstrapComplete,
  // LATER
  startVerification,
  endVerification,
} = authSlice.actions;

export default authSlice.reducer;
