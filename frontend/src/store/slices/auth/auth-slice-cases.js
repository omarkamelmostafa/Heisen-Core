// frontend/src/store/slices/auth/auth-slice-cases.js
/**
 * Thunk Cases for Auth Slice
 *
 * This file decouples the auth slice from auth thunks to prevent
 * circular dependencies. Import this in your store configuration
 * and use configureStore's extraReducers or slice.injectReducer.
 *
 * Architecture: UI → Hooks → Thunks → Services → API Client
 * Thunks are the ONLY layer connecting Services ↔ Redux.
 */

import {
  loginUser,
  registerUser,
  verifyEmail,
  forgotPassword,
  resetPassword,
  bootstrapAuth,
  logoutAllDevices,
  verify2fa,
} from "./auth-thunks";

// Helper to handle loading state
const handlePending = (state) => {
  state.isLoading = true;
  state.error = null;
};

// Helper to handle error state
const handleRejected = (state, action) => {
  state.isLoading = false;
  state.error = typeof action.payload === "string"
    ? action.payload
    : (action.payload?.message || action.error?.message || "An unexpected error occurred");
};

/**
 * Add auth thunk cases to the slice builder.
 * Usage in slice:
 *   extraReducers: (builder) => {
 *     addAuthThunkCases(builder);
 *   }
 */
export const addAuthThunkCases = (builder) => {
  // Login — stores access token in Redux memory
  builder
    .addCase(loginUser.pending, handlePending)
    .addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.error = null;
      if (action.payload.data?.requiresTwoFactor) {
        return;
      }
      state.isAuthenticated = true;
      state.accessToken = action.payload.data?.accessToken || null;
    })
    .addCase(loginUser.rejected, handleRejected);

  // Register — does NOT set isAuthenticated (user must verify email first)
  builder
    .addCase(registerUser.pending, handlePending)
    .addCase(registerUser.fulfilled, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
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
      state.isAuthenticated = !!action.payload?.data?.accessToken;
      state.error = null;
    })
    .addCase(bootstrapAuth.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.accessToken = null;
    });

  // Logout All Devices
  builder
    .addCase(logoutAllDevices.fulfilled, (state) => {
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
      state.error = null;
    })
    .addCase(verifyEmail.rejected, (state, action) => {
      state.isLoading = false;
      state.isVerifying = false;
      state.error = typeof action.payload === "string"
        ? action.payload
        : (action.payload?.message || action.error?.message || "Email verification failed");
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

  // Verify 2FA
  builder
    .addCase(verify2fa.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(verify2fa.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.accessToken = action.payload.data?.accessToken || null;
      state.error = null;
    })
    .addCase(verify2fa.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload?.message || "2FA verification failed";
    });
};
